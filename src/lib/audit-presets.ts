/**
 * Presets de sélection pour l'audit sélectif.
 * Chaque preset coche un sous-ensemble des points des 8 domaines.
 */
import { DOMAINES_AUDIT } from './audit-parcours';

export type AuditScope = Record<string, number[]>; // { domaineId: [pointIndex, ...] }

export interface AuditPreset {
  id: string;
  label: string;
  description: string;
  build: () => AuditScope;
}

const allPoints = (): AuditScope => {
  const scope: AuditScope = {};
  DOMAINES_AUDIT.forEach(d => {
    scope[d.id] = d.checklist.map((_, i) => i);
  });
  return scope;
};

const noPoints = (): AuditScope => {
  const scope: AuditScope = {};
  DOMAINES_AUDIT.forEach(d => { scope[d.id] = []; });
  return scope;
};

/** Audit minimal M9-6 : 2 premiers points de chaque domaine (contrôles obligatoires de base). */
const minimalM96 = (): AuditScope => {
  const scope: AuditScope = {};
  DOMAINES_AUDIT.forEach(d => {
    scope[d.id] = d.checklist.slice(0, 2).map((_, i) => i);
  });
  return scope;
};

/** Audit prise de fonction : gouvernance + comptes de tiers + trésorerie en intégral. */
const priseFonction = (): AuditScope => {
  const scope: AuditScope = noPoints();
  ['gouvernance-si', 'comptes-tiers', 'tresorerie'].forEach(id => {
    const d = DOMAINES_AUDIT.find(x => x.id === id);
    if (d) scope[id] = d.checklist.map((_, i) => i);
  });
  return scope;
};

export const AUDIT_PRESETS: AuditPreset[] = [
  { id: 'all', label: 'Audit annuel complet', description: 'Tous les points des 8 domaines (couverture maximale).', build: allPoints },
  { id: 'minimal', label: 'Audit minimal M9-6', description: 'Points obligatoires de base (2 par domaine).', build: minimalM96 },
  { id: 'prise-fonction', label: 'Audit de prise de fonction', description: 'Gouvernance + Comptes de tiers + Trésorerie en intégral.', build: priseFonction },
  { id: 'none', label: 'Tout décocher', description: 'Repartir d\'une sélection vide.', build: noPoints },
];

export function countPoints(scope: AuditScope): number {
  return Object.values(scope).reduce((sum, arr) => sum + arr.length, 0);
}

export function totalPoints(): number {
  return DOMAINES_AUDIT.reduce((sum, d) => sum + d.checklist.length, 0);
}
