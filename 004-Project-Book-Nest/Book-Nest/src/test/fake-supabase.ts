// a chainable stand-in for the Supabase query builder: records every call, resolves to `result`
export function fakeSupabase(result: { data?: unknown; error?: unknown } = {}) {
    const calls: [string, ...unknown[]][] = [];
    const query: Record<string, unknown> = {};
    for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'maybeSingle']) {
        query[method] = (...args: unknown[]) => (calls.push([method, ...args]), query);
    }
    query.then = (resolve: (v: unknown) => void) => resolve({ data: null, error: null, ...result });
    const auth = {
        getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
        signUp: vi.fn(async () => ({ error: null })),
        signInWithPassword: vi.fn(async () => ({ error: null })),
        signOut: vi.fn(async () => ({ error: null })),
        updateUser: vi.fn(async () => ({ error: null })),
    };
    return {
        client: { from: (table: string) => (calls.push(['from', table]), query), auth },
        calls,
        auth,
    };
}
