import { loadState, saveState } from './store';

export interface ModuleConfig {
  id: string;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
  children?: { id: string; label: string; path: string }[];
}

const DEFAULT_MODULES: ModuleConfig[] = [
  { id: 'parametres', label: 'Paramètres & Équipe', path: '/parametres', icon: 'Settings', enabled: true },
  { id: 'verification', label: 'Vérification quotidienne', path: '/verification', icon: 'ClipboardCheck', enabled: true },
  { id: 'ordonnateur', label: 'Contrôle ordonnateur', path: '/ordonnateur', icon: 'UserCheck', enabled: true },
  { id: 'droits-constates', label: 'Droits constatés', path: '/droits-constates', icon: 'Receipt', enabled: true },
  { 
    id: 'depenses', label: 'Dépenses', path: '/depenses', icon: 'CreditCard', enabled: true,
    children: [
      { id: 'depenses-liquidation', label: 'Validité de la liquidation', path: '/depenses/liquidation' },
      { id: 'depenses-pieces', label: 'Vérification des pièces', path: '/depenses/pieces' },
    ]
  },
  { id: 'voyages', label: 'Voyages scolaires', path: '/voyages', icon: 'Plane', enabled: true },
  { id: 'marches', label: 'Marchés publics', path: '/marches', icon: 'FileText', enabled: true },
  { id: 'regies', label: 'Régies', path: '/regies', icon: 'Calculator', enabled: true },
  { id: 'annexe-comptable', label: 'Annexe comptable (M9-6)', path: '/annexe-comptable', icon: 'BookOpen', enabled: true },
  { id: 'fonds-roulement', label: 'Fonds de roulement', path: '/fonds-roulement', icon: 'TrendingUp', enabled: true },
];

export function getModules(): ModuleConfig[] {
  return loadState<ModuleConfig[]>('modules', DEFAULT_MODULES);
}

export function saveModules(modules: ModuleConfig[]): void {
  saveState('modules', modules);
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
