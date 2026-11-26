import { fakeSupabase } from '../test/fake-supabase.ts';
import { handle } from '../hooks.server.ts';
import { POST as scanEndpoint } from './api/scan-shelf/+server';
import { actions as login } from './login/+page.server';
import { actions as logout } from './logout/+page.server';
import { actions as bookActions, load as loadBook } from './private/books/[id]/+page.server';
import { actions as dashboard, load as loadDashboard } from './private/dashboard/+page.server';
import { actions as settings } from './private/settings/+page.server';
import { actions as register } from './register/+page.server';

const mocks = vi.hoisted(() => ({
    ssrClient: null as unknown,
    deleteUser: vi.fn(),
    scanShelf: vi.fn(),
}));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => mocks.ssrClient }));
vi.mock('$app/env/public', () => ({
    PUBLIC_SUPABASE_URL: 'https://db.test',
    PUBLIC_SUPABASE_ANON_KEY: 'anon',
}));
vi.mock('#lib/server/admin.ts', () => ({
    supabaseAdmin: () => ({ auth: { admin: { deleteUser: mocks.deleteUser } } }),
}));
vi.mock('#lib/server/scan.ts', async (original) => ({
    ...(await original<typeof import('#lib/server/scan.ts')>()),
    scanShelf: mocks.scanShelf,
}));
vi.mock('$app/env/private', () => ({ OPENAI_API_KEY: '', OPENAI_MODEL: '' }));

const user = { id: 'u1', email: 'ana@example.com', user_metadata: { name: 'Ana' } };

const formRequest = (fields: Record<string, string>) => {
    const body = new FormData();
    for (const [k, v] of Object.entries(fields)) body.set(k, v);
    return new Request('http://x', { method: 'POST', body });
};

const event = (sb: ReturnType<typeof fakeSupabase>, extra: object = {}) =>
    ({ locals: { supabase: sb.client, getUser: async () => user }, params: {}, ...extra }) as never;

async function runHook(path: string, signedIn: boolean) {
    const sb = fakeSupabase();
    sb.auth.getUser.mockResolvedValue({
        data: { user: signedIn ? user : null },
        error: null,
    } as never);
    mocks.ssrClient = sb.client;
    const resolve = vi.fn(async () => new Response('page'));
    const e = {
        url: new URL(`http://x${path}`),
        locals: {},
        cookies: { getAll: () => [], set: vi.fn() },
        setHeaders: vi.fn(),
    };
    try {
        return { response: await handle({ event: e, resolve } as never), resolve };
    } catch (thrown) {
        return { thrown, resolve };
    }
}

test('hook sends signed-out visitors of /private to the login page', async () => {
    const { thrown, resolve } = await runHook('/private/dashboard', false);
    expect(thrown).toMatchObject({ status: 303, location: '/login' });
    expect(resolve).not.toHaveBeenCalled();
});

test('hook answers 401 for signed-out API calls and lets signed-in users through', async () => {
    expect((await runHook('/api/scan-shelf', false)).response?.status).toBe(401);
    expect(await (await runHook('/private/dashboard', true)).response?.text()).toBe('page');
    expect((await runHook('/login', true)).thrown).toMatchObject({
        location: '/private/dashboard',
    });
    expect((await runHook('/', false)).response?.status).toBe(200);
});

test('register validates, then signs up with the name as metadata', async () => {
    const sb = fakeSupabase();
    expect(
        await register.default(event(sb, { request: formRequest({ email: 'bad' }) })),
    ).toMatchObject({ status: 400 });
    expect(sb.auth.signUp).not.toHaveBeenCalled();

    const fields = {
        name: 'Ana',
        email: 'ana@example.com',
        password: 'longenough',
        passwordConfirm: 'longenough',
    };
    await expect(
        register.default(event(sb, { request: formRequest(fields) })),
    ).rejects.toMatchObject({
        location: '/private/dashboard',
    });
    expect(sb.auth.signUp).toHaveBeenCalledWith({
        email: 'ana@example.com',
        password: 'longenough',
        options: { data: { name: 'Ana' } },
    });
});

test('login hides whether the email exists', async () => {
    const sb = fakeSupabase();
    sb.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
    } as never);
    const result = await login.default(
        event(sb, { request: formRequest({ email: 'ana@example.com', password: 'x' }) }),
    );
    expect(result).toMatchObject({
        status: 400,
        data: {
            values: { email: 'ana@example.com' },
            errors: { form: 'Wrong email or password.' },
        },
    });
});

test('logout signs out and goes home', async () => {
    const sb = fakeSupabase();
    await expect(logout.default(event(sb))).rejects.toMatchObject({ location: '/' });
    expect(sb.auth.signOut).toHaveBeenCalled();
});

test('dashboard loads the books and adds a valid one', async () => {
    const sb = fakeSupabase({ data: [{ id: 1, title: 'Dune' }] });
    expect(await loadDashboard(event(sb))).toEqual({ books: [{ id: 1, title: 'Dune' }] });

    expect(await dashboard.add(event(sb, { request: formRequest({ title: '' }) }))).toMatchObject({
        status: 400,
    });
    expect(
        await dashboard.add(event(sb, { request: formRequest({ title: 'Emma', rating: '4' }) })),
    ).toEqual({ added: 'Emma' });
    expect(sb.calls).toContainEqual([
        'insert',
        expect.objectContaining({ title: 'Emma', rating: 4 }),
    ]);
});

test('book page 404s for a malformed or missing id', async () => {
    const sb = fakeSupabase({ data: null });
    await expect(loadBook(event(sb, { params: { id: 'abc' } }))).rejects.toMatchObject({
        status: 404,
    });
    expect(sb.calls).toEqual([]);
    await expect(loadBook(event(sb, { params: { id: '5' } }))).rejects.toMatchObject({
        status: 404,
    });
    expect(sb.calls).toContainEqual(['eq', 'id', 5]);
});

test('book update saves through RLS and 404s when no row matched', async () => {
    const request = () => formRequest({ title: 'Dune' });
    expect(
        await bookActions.update(
            event(fakeSupabase({ data: [{ id: 5 }] }), { params: { id: '5' }, request: request() }),
        ),
    ).toEqual({
        saved: true,
    });
    await expect(
        bookActions.update(
            event(fakeSupabase({ data: [] }), { params: { id: '5' }, request: request() }),
        ),
    ).rejects.toMatchObject({ status: 404 });
});

test('deleting the account needs the confirmation word', async () => {
    const sb = fakeSupabase();
    expect(
        await settings.deleteAccount(event(sb, { request: formRequest({ confirm: 'yes' }) })),
    ).toMatchObject({ status: 400 });
    expect(mocks.deleteUser).not.toHaveBeenCalled();

    mocks.deleteUser.mockResolvedValue({ error: null });
    await expect(
        settings.deleteAccount(event(sb, { request: formRequest({ confirm: 'DELETE' }) })),
    ).rejects.toMatchObject({
        location: '/',
    });
    expect(mocks.deleteUser).toHaveBeenCalledWith('u1');
    expect(sb.auth.signOut).toHaveBeenCalled();
});

test('settings updates the display name', async () => {
    const sb = fakeSupabase();
    expect(
        await settings.updateName(event(sb, { request: formRequest({ name: ' Bo ' }) })),
    ).toEqual({ saved: true });
    expect(sb.auth.updateUser).toHaveBeenCalledWith({ data: { name: 'Bo' } });
});

test('scan endpoint validates the image, then saves what the model read', async () => {
    const sb = fakeSupabase();
    const post = (body: unknown) =>
        scanEndpoint(
            event(sb, {
                request: new Request('http://x', { method: 'POST', body: JSON.stringify(body) }),
            }),
        );

    await expect(post({ image: 'https://evil.test/x.png' })).rejects.toMatchObject({ status: 400 });
    expect(mocks.scanShelf).not.toHaveBeenCalled();

    mocks.scanShelf.mockResolvedValue([{ title: 'Dune', author: null }]);
    const res = await post({ image: 'data:image/png;base64,AAAA' });
    expect(await res.json()).toEqual({ books: [{ title: 'Dune', author: null }] });
    expect(sb.calls).toContainEqual(['insert', [{ title: 'Dune', author: null }]]);
});
