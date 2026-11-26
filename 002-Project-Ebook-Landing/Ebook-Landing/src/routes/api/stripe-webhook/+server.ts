import sgMail from '@sendgrid/mail';
import { error, text } from '@sveltejs/kit';
import { STRIPE_WEBHOOK_SECRET, SENDGRID_API_KEY, MAIL_FROM, EBOOK_URL } from '$app/env/private';
import { stripe } from '#lib/server/stripe.ts';
import type { RequestHandler } from './$types';

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const POST: RequestHandler = async ({ request }) => {
    // anyone can POST here: only events signed with our webhook secret are trusted
    let event;
    try {
        event = await stripe().webhooks.constructEventAsync(
            await request.text(),
            request.headers.get('stripe-signature') ?? '',
            STRIPE_WEBHOOK_SECRET,
        );
    } catch {
        error(400, 'Invalid signature');
    }

    if (event.type === 'checkout.session.completed') {
        const customer = event.data.object.customer_details;
        if (customer?.email) {
            sgMail.setApiKey(SENDGRID_API_KEY);
            await sgMail.send({
                to: customer.email,
                from: MAIL_FROM,
                subject: 'Your copy of Zero to Shipped',
                html: `<p>Hi ${escape(customer.name ?? 'there')},</p>
<p>Thank you for buying <strong>Zero to Shipped</strong>.
<a href="${escape(EBOOK_URL)}">Download your ebook</a>.</p>`,
            });
        }
    }
    return text('ok');
};
