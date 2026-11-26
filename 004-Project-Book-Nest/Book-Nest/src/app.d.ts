import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
    namespace App {
        interface Locals {
            supabase: SupabaseClient;
            // verified with the Supabase auth server, not just read from the cookie
            getUser: () => Promise<User | null>;
        }
    }
}

export {};
