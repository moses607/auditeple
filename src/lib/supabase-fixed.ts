import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Valeurs publiques Lovable Cloud (clé anon = clé publique, sans risque
// d'être exposée côté client). On code en dur en fallback car les
// variables VITE_* ne sont pas systématiquement injectées dans le build
// publié, ce qui causait un écran blanc en production.
const FALLBACK_SUPABASE_URL = "https://mpexzicaotykelgogdwv.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZXh6aWNhb3R5a2VsZ29nZHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM5MDAsImV4cCI6MjA4ODY1OTkwMH0.-CF0-oJ-jMtt6Hc5-Jh3YvWSNMKKGaH4qfYY1v_-eoc";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  FALLBACK_SUPABASE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = true;