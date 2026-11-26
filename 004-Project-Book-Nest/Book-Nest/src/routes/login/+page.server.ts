import { fail, redirect } from '@sveltejs/kit';
import { parseCredentials } from '#lib/server/validate.ts';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const input = parseCredentials(await request.formData());
        if (!input.ok) return fail(400, { values: input.values, errors: input.errors });

        const { email, password } = input.data;
        const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
        // same message for unknown email and wrong password
        if (error)
            return fail(400, { values: { email }, errors: { form: 'Wrong email or password.' } });
        redirect(303, '/private/dashboard');
    },
};
