import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Cliente Supabase anônimo (sem cookies) para o site público.
 * Só enxerga o que as regras RLS liberam para visitantes, e permite
 * que as páginas públicas sejam cacheadas (ISR).
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
