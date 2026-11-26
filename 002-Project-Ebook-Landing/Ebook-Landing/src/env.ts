import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';

// required when the server runs, but `vite build` (CI) works without the secrets
const required = (description: string) => ({
    description,
    schema: (value: string | undefined) => {
        if (!value && !building) throw new Error('missing, see .env.example');
        return value ?? '';
    },
});

export const variables = defineEnvVars({
    STRIPE_SECRET_KEY: required('Stripe secret API key'),
    STRIPE_PRICE_ID: required('Stripe Price of the ebook'),
    STRIPE_WEBHOOK_SECRET: required('Signing secret of the Stripe webhook'),
    SENDGRID_API_KEY: required('SendGrid API key'),
    MAIL_FROM: required('Sender address of the purchase email'),
    EBOOK_URL: required('Download link sent to buyers'),
});
