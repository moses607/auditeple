import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const hostname = window.location.hostname;
const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
const isLovable = hostname.endsWith('.lovable.app') || hostname.endsWith('.lovableproject.com');
const isAuthorized = isDev || isLovable || hostname.endsWith('.vercel.app');
if (!isAuthorized) {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666"><p>Application non autorisée sur ce domaine.</p></div>';
  throw new Error('Domaine non autorisé');
}

createRoot(document.getElementById("root")!).render(<App />);
