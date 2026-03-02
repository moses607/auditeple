// Robust localStorage persistence layer
const STORE_PREFIX = 'cic_expert_';

export function loadState<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save state:', key, e);
  }
}

export function clearState(key: string): void {
  localStorage.removeItem(STORE_PREFIX + key);
}
