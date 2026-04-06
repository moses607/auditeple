import { useMemo, useSyncExternalStore } from 'react';
import { loadState } from '@/lib/store';

/**
 * All localStorage keys used by ComplianceCheck modules.
 * Each key stores a Record<string, boolean> of checked items.
 */
const CHECK_KEYS = [
  'verification_checks_v2',
  'depenses_controles_ac',
  'depenses_suspensions_v2',
  'depenses_pieces_v2',
  'ordonnateur_checks',
  'ctrl_caisse_checks',
  'rapprochement_checks',
  'stocks_checks',
  'bourses_checks',
  'marches_checks',
  'recouvrement_checks',
  'restauration_checks',
  'fdr_checks',
  'dc_checks',
  'fonds_sociaux_checks',
  'subventions_checks',
  'voyages_checks',
  'organigramme_checks',
  'annexe_checks',
  'ba_checks',
  'regies_reg_checks',
] as const;

/** Section mapping for progress by section */
const SECTION_KEYS: Record<string, string[]> = {
  'CONTRÔLES SUR PLACE': ['ctrl_caisse_checks', 'rapprochement_checks', 'stocks_checks', 'regies_reg_checks'],
  'VÉRIFICATION & ORDONNATEUR': ['verification_checks_v2', 'ordonnateur_checks', 'dc_checks', 'depenses_controles_ac', 'depenses_suspensions_v2', 'depenses_pieces_v2'],
  'GESTION COMPTABLE': ['voyages_checks', 'restauration_checks', 'bourses_checks', 'fonds_sociaux_checks'],
  'FINANCES & BUDGET': ['fdr_checks', 'recouvrement_checks', 'marches_checks', 'subventions_checks'],
  'CONTRÔLE INTERNE': ['organigramme_checks'],
  'AUDIT & RESTITUTION': ['annexe_checks', 'ba_checks'],
};

function getSnapshot(): string {
  // Return a serialized snapshot of all check states for change detection
  const parts: string[] = [];
  for (const key of CHECK_KEYS) {
    const raw = localStorage.getItem('cic_expert_' + key);
    parts.push(raw || '{}');
  }
  return parts.join('|');
}

function subscribe(callback: () => void): () => void {
  // Listen for storage events and custom module-changed events
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('modules-changed', handler);
  // Also poll every 2 seconds for in-tab changes
  const interval = setInterval(handler, 2000);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('modules-changed', handler);
    clearInterval(interval);
  };
}

interface AuditProgress {
  /** Total checked items across all modules */
  totalChecked: number;
  /** Total possible items across all modules */
  totalItems: number;
  /** Overall percentage (0-100) */
  percentage: number;
  /** Progress per section */
  sections: Record<string, { checked: number; total: number; percentage: number }>;
}

function calculateProgress(snapshot: string): AuditProgress {
  let totalChecked = 0;
  let totalItems = 0;
  const sections: AuditProgress['sections'] = {};

  for (const [section, keys] of Object.entries(SECTION_KEYS)) {
    let sChecked = 0;
    let sTotal = 0;
    for (const key of keys) {
      const data: Record<string, boolean> = loadState(key, {});
      const vals = Object.values(data);
      sTotal += vals.length;
      sChecked += vals.filter(Boolean).length;
    }
    sections[section] = {
      checked: sChecked,
      total: sTotal,
      percentage: sTotal > 0 ? Math.round(sChecked / sTotal * 100) : 0,
    };
    totalChecked += sChecked;
    totalItems += sTotal;
  }

  return {
    totalChecked,
    totalItems,
    percentage: totalItems > 0 ? Math.round(totalChecked / totalItems * 100) : 0,
    sections,
  };
}

/**
 * Hook that provides real-time audit progress across all modules.
 * Updates automatically when any module's checks change.
 */
export function useAuditProgress(): AuditProgress {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return useMemo(() => calculateProgress(snapshot), [snapshot]);
}
