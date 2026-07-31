import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from './config.js';

let client: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const config = getRuntimeConfig();
    client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return client;
}
