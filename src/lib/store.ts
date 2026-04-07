// Robust localStorage persistence layer with UAI-scoped keys
const STORE_PREFIX = 'cic_expert_';

// Current UAI context for scoped storage
let _currentUAI: string = '';

export function setCurrentUAI(uai: string): void {
  _currentUAI = uai.trim().toUpperCase();
}

export function getCurrentUAI(): string {
  return _currentUAI;
}

// Build the full localStorage key, scoped by UAI when set
function buildKey(key: string): string {
  if (_currentUAI) {
    return `${STORE_PREFIX}${_currentUAI}_${key}`;
  }
  return STORE_PREFIX + key;
}

// Auto-migrate: if scoped key doesn't exist but legacy (unscoped) key does, copy it
function migrateIfNeeded(key: string): void {
  if (!_currentUAI) return;
  const scopedKey = buildKey(key);
  const legacyKey = STORE_PREFIX + key;
  if (localStorage.getItem(scopedKey) === null && localStorage.getItem(legacyKey) !== null) {
    const legacyData = localStorage.getItem(legacyKey);
    if (legacyData !== null) {
      localStorage.setItem(scopedKey, legacyData);
    }
  }
}

export function loadState<T>(key: string, defaultValue: T): T {
  try {
    migrateIfNeeded(key);
    const raw = localStorage.getItem(buildKey(key));
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(buildKey(key), JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save state:', key, e);
  }
}

export function clearState(key: string): void {
  localStorage.removeItem(buildKey(key));
}

// Global keys (not scoped by UAI) for cross-establishment data
export function loadGlobalState<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveGlobalState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save global state:', key, e);
  }
}
