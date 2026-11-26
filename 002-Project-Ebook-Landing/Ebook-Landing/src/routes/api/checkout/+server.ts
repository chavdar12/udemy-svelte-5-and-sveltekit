import { error, json } from '@sveltejs/kit';
import { STRIPE_PRICE_ID } from '$app/env/private';
import { stripe } from '#lib/server/stripe.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url }) => {
    try {
        const session = await stripe().checkout.sessions.create({
            mode: 'payment',
            line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
            success_url: `${url.origin}/checkout/success`,
            cancel_url: `${url.origin}/checkout/failure`,
        });
        return json({ url: session.url });
    } catch (e) {
        console.error(e);
        error(502, 'Could not start the checkout');
    }
};
