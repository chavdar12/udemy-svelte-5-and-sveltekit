export const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export type Post = { id: number; title: string; body: string };

// SvelteKit hands load functions its own fetch; taking it as a parameter keeps this testable
export async function getJson<T>(fetch: typeof globalThis.fetch, url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
}
