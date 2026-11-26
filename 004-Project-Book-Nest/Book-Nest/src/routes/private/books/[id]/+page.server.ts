import { error, fail, redirect } from '@sveltejs/kit';
import { parseBook, parseId } from '#lib/server/validate.ts';
import type { Book } from '../../dashboard/+page.server';
import type { Actions, PageServerLoad } from './$types';

const bookId = (id: string) => parseId(id) ?? error(404, 'Book not found');

export const load: PageServerLoad = async ({ params, locals }) => {
    const id = bookId(params.id);
    const { data } = await locals.supabase
        .from('books')
        .select('id, title, author, genre, rating, started_reading_on, finished_reading_on')
        .eq('id', id)
        .maybeSingle();
    if (!data) error(404, 'Book not found');
    return { book: data as Book };
};

export const actions: Actions = {
    update: async ({ params, request, locals }) => {
        const id = bookId(params.id);
        const input = parseBook(await request.formData());
        if (!input.ok) return fail(400, { values: input.values, errors: input.errors });
        const { data, error: e } = await locals.supabase
            .from('books')
            .update(input.data)
            .eq('id', id)
            .select('id');
        if (e)
            return fail(500, { values: input.data, errors: { form: 'Could not save the book.' } });
        if (!data?.length) error(404, 'Book not found');
        return { saved: true };
    },
    delete: async ({ params, locals }) => {
        const id = bookId(params.id);
        await locals.supabase.from('books').delete().eq('id', id);
        redirect(303, '/private/dashboard');
    },
};
