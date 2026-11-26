import { fail, redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '#lib/server/admin.ts';
import type { Actions } from './$types';

export const actions: Actions = {
    updateName: async ({ request, locals }) => {
        const name = String((await request.formData()).get('name') ?? '').trim();
        if (!name || name.length > 100)
            return fail(400, { errors: { name: 'Enter your name (up to 100 characters).' } });
        const { error } = await locals.supabase.auth.updateUser({ data: { name } });
        if (error) return fail(500, { errors: { form: 'Could not update your name.' } });
        return { saved: true };
    },
    deleteAccount: async ({ request, locals }) => {
        const user = await locals.getUser();
        if (!user) redirect(303, '/login');
        if ((await request.formData()).get('confirm') !== 'DELETE')
            return fail(400, { errors: { confirm: 'Type DELETE to confirm.' } });
        // the books go with the account (on delete cascade)
        const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
        if (error) return fail(500, { errors: { form: 'Could not delete your account.' } });
        await locals.supabase.auth.signOut();
        redirect(303, '/');
    },
};
