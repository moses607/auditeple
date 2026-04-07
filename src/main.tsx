import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const ALLOWED_DOMAINS = ['localhost', '127.0.0.1'];
const hostname = window.location.hostname;
const isVercel = hostname.endsWith('.vercel.app');
const isLovable = hostname.endsWith('.lovable.app') || hostname.endsWith('.lovableproject.com');
const isAllowed = isVercel || isLovable || ALLOWED_DOMAINS.includes(hostname);
if (!isAllowed) {
  document.body.innerHTML = '<h1>Application non autorisée sur ce domaine.</h1>';
  throw new Error('Domaine non autorisé');
}

createRoot(document.getElementById("root")!).render(<App />);
