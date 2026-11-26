import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$app/env/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$app/env/private';

// bypasses RLS: only for deleting the signed-in user's own account
export const supabaseAdmin = () =>
    createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
