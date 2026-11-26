import { API_URL, getJson, type Post } from '#lib/api.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => ({
    posts: (await getJson<Post[]>(fetch, API_URL)).slice(0, 10),
});
