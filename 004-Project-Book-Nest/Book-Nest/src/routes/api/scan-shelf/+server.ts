import { error, json } from '@sveltejs/kit';
import { checkImage, MAX_IMAGE_BYTES, scanShelf } from '#lib/server/scan.ts';
import type { RequestHandler } from './$types';

// hooks.server.ts already rejects signed-out requests to /api
export const POST: RequestHandler = async ({ request, locals }) => {
    if (Number(request.headers.get('content-length') ?? 0) > MAX_IMAGE_BYTES * 1.5)
        error(413, 'Image too large');
    const body = await request.json().catch(() => null);
    const image = checkImage(body?.image);
    if (!image) error(400, 'Send a PNG, JPEG or WebP image up to 5 MB');

    let books;
    try {
        books = await scanShelf(image);
    } catch (e) {
        console.error(e);
        error(502, 'Could not read the photo');
    }
    if (books.length) {
        const { error: e } = await locals.supabase.from('books').insert(books);
        if (e) error(500, 'Could not save the books');
    }
    return json({ books });
};
