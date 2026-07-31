import { createClient } from '@supabase/supabase-js';

// Server-only client using the service role key (bypasses RLS).
// NEVER import this into client components — it exposes admin access.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase service role not configured. Set SUPABASE_SERVICE_ROLE_KEY (server-only).');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
