import { error } from '@sveltejs/kit';
import { API_URL, getJson, type Post } from '#lib/api.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    if (!/^\d+$/.test(params.postId)) error(404, 'Post not found');
    try {
        return { post: await getJson<Post>(fetch, `${API_URL}/${params.postId}`) };
    } catch {
        error(404, 'Post not found');
    }
};
