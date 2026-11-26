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
    PUBLIC_SUPABASE_URL: { ...required('Supabase project URL'), public: true },
    PUBLIC_SUPABASE_ANON_KEY: {
        ...required('Supabase anon key (safe for the browser)'),
        public: true,
    },
    SUPABASE_SERVICE_ROLE_KEY: required('Supabase service role key, server only'),
    OPENAI_API_KEY: required('OpenAI API key'),
    OPENAI_MODEL: {
        description: 'OpenAI vision model',
        schema: (value?: string) => value || 'gpt-5-mini',
    },
});
