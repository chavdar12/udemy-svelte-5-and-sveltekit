import { fail, redirect } from '@sveltejs/kit';
import { parseCredentials } from '#lib/server/validate.ts';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const input = parseCredentials(await request.formData(), { register: true });
        if (!input.ok) return fail(400, { values: input.values, errors: input.errors });

        const { name, email, password } = input.data;
        const { error } = await locals.supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) return fail(400, { values: { name, email }, errors: { form: error.message } });
        redirect(303, '/private/dashboard');
    },
};
