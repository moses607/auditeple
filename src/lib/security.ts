import { z } from 'zod';

// ─── Input validation schemas ───────────────────────────────────
export const emailSchema = z.string().trim().email('Email invalide').max(255, 'Email trop long');
export const passwordSchema = z.string().min(6, 'Minimum 6 caractères').max(128, 'Maximum 128 caractères');
export const displayNameSchema = z.string().trim().min(1, 'Nom requis').max(100, 'Nom trop long');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

// ─── Rate limiting (client-side, UX hint only) ─────────────────
// NOTE: This is a UX convenience to deter casual repeated submissions.
// It is NOT a security control — it resets on page refresh and does not
// protect against programmatic brute-force attacks. Server-side rate
// limiting (Supabase Auth built-in) is the actual security layer.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxAttempts) {
    return false;
  }
  
  entry.count++;
  return true;
}

export function getRateLimitRemainingSeconds(key: string): number {
  const entry = attempts.get(key);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}

// ─── XSS Sanitization ──────────────────────────────────────────
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─── Session inactivity timeout ─────────────────────────────────
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let onTimeoutCallback: (() => void) | null = null;

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (onTimeoutCallback) {
    inactivityTimer = setTimeout(onTimeoutCallback, INACTIVITY_TIMEOUT_MS);
  }
}

export function startInactivityMonitor(onTimeout: () => void) {
  onTimeoutCallback = onTimeout;
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
  events.forEach(event => document.addEventListener(event, resetInactivityTimer, { passive: true }));
  resetInactivityTimer();
  
  return () => {
    events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
    if (inactivityTimer) clearTimeout(inactivityTimer);
    onTimeoutCallback = null;
  };
}
