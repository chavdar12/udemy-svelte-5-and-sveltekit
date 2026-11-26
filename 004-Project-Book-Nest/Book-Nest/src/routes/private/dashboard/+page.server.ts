import { error, fail } from '@sveltejs/kit';
import { parseBook } from '#lib/server/validate.ts';
import type { Actions, PageServerLoad } from './$types';

export type Book = {
    id: number;
    title: string;
    author: string | null;
    genre: string | null;
    rating: number | null;
    started_reading_on: string | null;
    finished_reading_on: string | null;
};

// RLS limits every query to the signed-in user's rows
export const load: PageServerLoad = async ({ locals }) => {
    const { data, error: e } = await locals.supabase
        .from('books')
        .select('id, title, author, genre, rating, started_reading_on, finished_reading_on')
        .order('created_at', { ascending: false });
    if (e) error(500, 'Could not load your books');
    return { books: data as Book[] };
};

export const actions: Actions = {
    add: async ({ request, locals }) => {
        const input = parseBook(await request.formData());
        if (!input.ok) return fail(400, { values: input.values, errors: input.errors });
        const { error: e } = await locals.supabase.from('books').insert(input.data);
        if (e) return fail(500, { values: {}, errors: { form: 'Could not save the book.' } });
        return { added: input.data.title };
    },
};
