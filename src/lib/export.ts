/**
 * Export des données d'audit — CIC Expert Pro
 * Permet d'exporter toutes les données localStorage en JSON
 * et de les réimporter sur un autre poste.
 */

const STORE_PREFIX = 'cic_expert_';

/** Exporte toutes les données CIC Expert Pro en JSON */
export function exportAuditData(): string {
  const data: Record<string, unknown> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORE_PREFIX)) {
      const shortKey = key.slice(STORE_PREFIX.length);
      try {
        data[shortKey] = JSON.parse(localStorage.getItem(key) || '');
      } catch {
        data[shortKey] = localStorage.getItem(key);
      }
    }
  }
  
  const exportObj = {
    _meta: {
      app: 'CIC Expert Pro',
      version: '7.0',
      exportDate: new Date().toISOString(),
      keysCount: Object.keys(data).length,
    },
    data,
  };
  
  return JSON.stringify(exportObj, null, 2);
}

/** Télécharge les données en fichier JSON */
export function downloadAuditData(filename?: string): void {
  const json = exportAuditData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `cic-expert-pro-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Importe des données depuis un fichier JSON exporté */
export function importAuditData(jsonString: string): { success: boolean; keysImported: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed._meta || !parsed.data) {
      return { success: false, keysImported: 0, error: 'Format de fichier invalide. Utilisez un fichier exporté par CIC Expert Pro.' };
    }
    
    let count = 0;
    for (const [key, value] of Object.entries(parsed.data)) {
      try {
        localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
        count++;
      } catch (e) {
        console.warn(`Failed to import key: ${key}`, e);
      }
    }
    
    return { success: true, keysImported: count };
  } catch {
    return { success: false, keysImported: 0, error: 'Fichier JSON invalide.' };
  }
}

/** Efface toutes les données d'audit (attention : irréversible) */
export function clearAllAuditData(): number {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  return keysToRemove.length;
}

/** Statistiques sur les données stockées */
export function getStorageStats(): { keys: number; sizeKB: number; modules: string[] } {
  let totalSize = 0;
  const modules: string[] = [];
  let keys = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORE_PREFIX)) {
      keys++;
      const value = localStorage.getItem(key) || '';
      totalSize += key.length + value.length;
      modules.push(key.slice(STORE_PREFIX.length));
    }
  }
  
  return {
    keys,
    sizeKB: Math.round(totalSize / 1024 * 10) / 10,
    modules: modules.sort(),
  };
}
