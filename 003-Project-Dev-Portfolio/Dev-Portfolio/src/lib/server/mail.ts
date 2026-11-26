import sgMail from '@sendgrid/mail';
import { MAIL_FROM, MAIL_TO, SENDGRID_API_KEY } from '$app/env/private';

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export type Contact = { name: string; email: string; message: string };

export async function sendContactMail({ name, email, message }: Contact) {
    sgMail.setApiKey(SENDGRID_API_KEY);
    await sgMail.send({
        to: MAIL_TO,
        from: MAIL_FROM,
        replyTo: email,
        subject: `Portfolio contact from ${name}`,
        html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) wrote:</p>
<p>${escapeHtml(message).replaceAll('\n', '<br>')}</p>`,
    });
}
