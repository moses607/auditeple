import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Contournement : Lovable injecte VITE_SUPABASE_PUBLISHABLE_KEY
// mais l'ancien client lit VITE_SUPABASE_ANON_KEY. On lit les deux
// pour fonctionner dans tous les cas.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[CIC Expert Pro] Variables Supabase manquantes au build."
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "https://invalid.supabase.co",
  SUPABASE_KEY ?? "invalid-key",
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);