import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => event.cookies.getAll(),
            setAll: (cookies, headers) => {
                for (const { name, value, options } of cookies)
                    event.cookies.set(name, value, { ...options, path: '/' });
                event.setHeaders(headers);
            },
        },
    });

    let user: Awaited<ReturnType<App.Locals['getUser']>> | undefined;
    event.locals.getUser = async () => {
        if (user === undefined) {
            const { data, error } = await event.locals.supabase.auth.getUser();
            user = error ? null : data.user;
        }
        return user;
    };

    // guard here, not in a layout load: layout loads do not run for form actions or endpoints
    const path = event.url.pathname;
    if (
        (path.startsWith('/private') || path.startsWith('/api/')) &&
        !(await event.locals.getUser())
    ) {
        if (path.startsWith('/api/')) return new Response('Unauthorized', { status: 401 });
        redirect(303, '/login');
    }
    if ((path === '/login' || path === '/register') && (await event.locals.getUser())) {
        redirect(303, '/private/dashboard');
    }

    return resolve(event, { filterSerializedResponseHeaders: (name) => name === 'content-range' });
};
