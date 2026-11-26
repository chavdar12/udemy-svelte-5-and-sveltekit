import { load as loadPosts } from './blog/+page';
import { load as loadPost } from './blog/[postId]/+page';
import { API_URL } from '#lib/api.ts';

const post = { id: 1, title: 'First', body: 'Hello' };
const reply = (body: unknown, ok = true) =>
    vi.fn(async () => ({ ok, status: ok ? 200 : 404, json: async () => body }) as Response);

// load functions only read fetch and params from the event
const event = (fetch: typeof globalThis.fetch, postId = '1') =>
    ({ fetch, params: { postId } }) as never;

test('blog page loads the first ten posts', async () => {
    const fetch = reply(Array.from({ length: 15 }, (_, i) => ({ ...post, id: i + 1 })));
    const data = (await loadPosts(event(fetch))) as { posts: unknown[] };
    expect(fetch).toHaveBeenCalledWith(API_URL);
    expect(data.posts).toHaveLength(10);
});

test('post page loads the post from its id', async () => {
    const fetch = reply(post);
    expect(await loadPost(event(fetch, '1'))).toEqual({ post });
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/1`);
});

test('post page throws 404 for an unknown or malformed id', async () => {
    await expect(loadPost(event(reply({}, false), '999'))).rejects.toMatchObject({ status: 404 });
    const fetch = reply(post);
    await expect(loadPost(event(fetch, 'abc'))).rejects.toMatchObject({ status: 404 });
    expect(fetch).not.toHaveBeenCalled();
});
