import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

window.addEventListener('error', (e) => {
  document.body.innerHTML = `<div style="padding:20px;font-family:sans-serif;color:red"><h2>Erreur au démarrage</h2><pre>${e.message}\n${e.filename}:${e.lineno}</pre></div>`;
});
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML = `<div style="padding:20px;font-family:sans-serif;color:red"><h2>Promesse rejetée</h2><pre>${e.reason}</pre></div>`;
});

const hostname = window.location.hostname;
const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
const isLovable = hostname.endsWith('.lovable.app') || hostname.endsWith('.lovableproject.com');
const isAuthorized = isDev || isLovable || hostname.endsWith('.vercel.app');
if (!isAuthorized) {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666"><p>Application non autorisée sur ce domaine.</p></div>';
  throw new Error('Domaine non autorisé');
}

createRoot(document.getElementById("root")!).render(<App />);
