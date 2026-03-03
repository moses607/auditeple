import { loadState, saveState } from './store';

export interface ModuleConfig {
  id: string;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
  section: string;
  children?: { id: string; label: string; path: string }[];
}

export const SECTIONS = [
  'CONTRÔLES SUR PLACE',
  'VÉRIFICATION & ORDONNATEUR',
  'GESTION COMPTABLE',
  'FINANCES & BUDGET',
  'CONTRÔLE INTERNE',
  'AUDIT & RESTITUTION',
];

const DEFAULT_MODULES: ModuleConfig[] = [
  // ═══ CONTRÔLES SUR PLACE ═══
  { id: 'controle-caisse', label: 'Contrôle Caisse', path: '/controle-caisse', icon: 'Landmark', enabled: true, section: 'CONTRÔLES SUR PLACE' },
  { id: 'stocks', label: 'Stocks Denrées', path: '/stocks', icon: 'Package', enabled: true, section: 'CONTRÔLES SUR PLACE' },
  { id: 'rapprochement', label: 'Rappro. Bancaire', path: '/rapprochement', icon: 'Scale', enabled: true, section: 'CONTRÔLES SUR PLACE' },
  { id: 'regies', label: 'Régies', path: '/regies', icon: 'Calculator', enabled: true, section: 'CONTRÔLES SUR PLACE' },

  // ═══ VÉRIFICATION & ORDONNATEUR ═══
  { id: 'verification', label: 'Vérification quotidienne', path: '/verification', icon: 'ClipboardCheck', enabled: true, section: 'VÉRIFICATION & ORDONNATEUR' },
  { id: 'ordonnateur', label: 'Contrôle ordonnateur', path: '/ordonnateur', icon: 'UserCheck', enabled: true, section: 'VÉRIFICATION & ORDONNATEUR' },
  { id: 'droits-constates', label: 'Droits constatés', path: '/droits-constates', icon: 'Receipt', enabled: true, section: 'VÉRIFICATION & ORDONNATEUR' },
  { id: 'depenses', label: 'Dépenses', path: '/depenses', icon: 'CreditCard', enabled: true, section: 'VÉRIFICATION & ORDONNATEUR',
    children: [
      { id: 'depenses-liquidation', label: 'Validité de la liquidation', path: '/depenses/liquidation' },
      { id: 'depenses-pieces', label: 'Vérification des pièces', path: '/depenses/pieces' },
    ]
  },

  // ═══ GESTION COMPTABLE ═══
  { id: 'voyages', label: 'Voyages Scolaires', path: '/voyages', icon: 'Plane', enabled: true, section: 'GESTION COMPTABLE' },
  { id: 'bourses', label: 'Bourses', path: '/bourses', icon: 'GraduationCap', enabled: true, section: 'GESTION COMPTABLE' },
  { id: 'fonds-sociaux', label: 'Fonds Sociaux', path: '/fonds-sociaux', icon: 'Heart', enabled: true, section: 'GESTION COMPTABLE' },
  { id: 'restauration', label: 'Restauration', path: '/restauration', icon: 'UtensilsCrossed', enabled: true, section: 'GESTION COMPTABLE' },

  // ═══ FINANCES & BUDGET ═══
  { id: 'analyse-financiere', label: 'Analyse Financière', path: '/analyse-financiere', icon: 'TrendingUp', enabled: true, section: 'FINANCES & BUDGET' },
  { id: 'fonds-roulement', label: 'Fonds de Roulement', path: '/fonds-roulement', icon: 'BarChart3', enabled: true, section: 'FINANCES & BUDGET' },
  { id: 'recouvrement', label: 'Recouvrement', path: '/recouvrement', icon: 'AlertTriangle', enabled: true, section: 'FINANCES & BUDGET' },
  { id: 'marches', label: 'Commande & Marchés Publics', path: '/marches', icon: 'FileText', enabled: true, section: 'FINANCES & BUDGET' },
  { id: 'subventions', label: 'Subventions', path: '/subventions', icon: 'Building', enabled: true, section: 'FINANCES & BUDGET' },
  { id: 'budgets-annexes', label: 'Budgets Annexes', path: '/budgets-annexes', icon: 'Building2', enabled: true, section: 'FINANCES & BUDGET' },

  // ═══ CONTRÔLE INTERNE ═══
  { id: 'cartographie', label: 'Cartographie Risques', path: '/cartographie', icon: 'Map', enabled: true, section: 'CONTRÔLE INTERNE' },
  { id: 'organigramme', label: 'Organigramme', path: '/organigramme', icon: 'GitFork', enabled: true, section: 'CONTRÔLE INTERNE' },
  { id: 'plan-action', label: "Plan d'Action", path: '/plan-action', icon: 'ListChecks', enabled: true, section: 'CONTRÔLE INTERNE' },
  { id: 'plan-controle', label: 'Plan Contrôle', path: '/plan-controle', icon: 'Calendar', enabled: true, section: 'CONTRÔLE INTERNE' },

  // ═══ AUDIT & RESTITUTION ═══
  { id: 'pv-audit', label: 'PV Audit', path: '/pv-audit', icon: 'ClipboardList', enabled: true, section: 'AUDIT & RESTITUTION' },
  { id: 'annexe-comptable', label: 'Annexe Comptable', path: '/annexe-comptable', icon: 'BookOpen', enabled: true, section: 'AUDIT & RESTITUTION' },
  { id: 'piste-audit', label: "Piste d'Audit", path: '/piste-audit', icon: 'FileText', enabled: true, section: 'AUDIT & RESTITUTION' },
  { id: 'parametres', label: 'Paramètres & Équipe', path: '/parametres', icon: 'Settings', enabled: true, section: 'AUDIT & RESTITUTION' },
];

export function getModules(): ModuleConfig[] {
  const saved = loadState<ModuleConfig[]>('modules_v2', []);
  if (saved.length === 0) return DEFAULT_MODULES;
  // Merge: keep saved enabled states, but ensure all default modules exist
  const map = new Map(saved.map(m => [m.id, m]));
  return DEFAULT_MODULES.map(d => {
    const s = map.get(d.id);
    return s ? { ...d, enabled: s.enabled } : d;
  });
}

export function saveModules(modules: ModuleConfig[]): void {
  saveState('modules_v2', modules);
}

export function toggleModule(id: string): ModuleConfig[] {
  const modules = getModules();
  const updated = modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
  saveModules(updated);
  return updated;
}

export function isModuleEnabled(id: string): boolean {
  return getModules().find(m => m.id === id)?.enabled ?? false;
}
