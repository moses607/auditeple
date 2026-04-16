import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

const rootEl = document.getElementById("root")!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[CIC Expert Pro] Variables Supabase manquantes. " +
      "Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY) " +
      "dans les variables d'environnement du projet."
  );
  rootEl.innerHTML = `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; margin: 80px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; color: #0f172a;">
      <h1 style="margin: 0 0 12px; font-size: 20px;">Configuration manquante</h1>
      <p style="margin: 0 0 8px; line-height: 1.5;">
        L'application n'a pas pu démarrer car les variables d'environnement Supabase
        ne sont pas injectées dans le build.
      </p>
      <p style="margin: 0 0 8px; line-height: 1.5;">
        Veuillez republier l'application depuis Lovable (bouton <strong>Publish &rarr; Update</strong>)
        afin que les variables soient correctement injectées.
      </p>
      <code style="display: block; margin-top: 16px; padding: 12px; background: #f1f5f9; border-radius: 6px; font-size: 13px;">
        VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
      </code>
    </div>
  `;
} else {
  createRoot(rootEl).render(<App />);
}
