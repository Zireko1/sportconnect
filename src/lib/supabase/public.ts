import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Client anonyme sans cookies : utilisable dans les pages statiques / ISR
 * (le client SSR lit les cookies, ce qui force le rendu dynamique).
 * Soumis aux RLS comme un visiteur non connecté.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
