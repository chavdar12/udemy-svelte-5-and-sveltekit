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
    SANITY_PROJECT_ID: required('Sanity project id'),
    SANITY_DATASET: required('Sanity dataset, usually production'),
    SENDGRID_API_KEY: required('SendGrid API key'),
    MAIL_FROM: required('Sender address of contact emails'),
    MAIL_TO: required('Where contact emails are delivered'),
});
