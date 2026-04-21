import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Valeurs publiques Lovable Cloud (anon key = clé publique, safe en client).
// Utilisées en fallback car le `.env` géré automatiquement n'expose que
// `VITE_SUPABASE_PUBLISHABLE_KEY`, alors que le client auto-généré
// (`src/integrations/supabase/client.ts`) lit `VITE_SUPABASE_ANON_KEY`.
// Sans ce shim, `createClient` reçoit `undefined` en build publié → écran blanc.
const FALLBACK_SUPABASE_URL = "https://mpexzicaotykelgogdwv.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZXh6aWNhb3R5a2VsZ29nZHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM5MDAsImV4cCI6MjA4ODY1OTkwMH0.-CF0-oJ-jMtt6Hc5-Jh3YvWSNMKKGaH4qfYY1v_-eoc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ??
    env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    FALLBACK_SUPABASE_KEY;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseAnonKey),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
  };
});
