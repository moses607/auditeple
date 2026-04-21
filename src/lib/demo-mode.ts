/**
 * Mode démo Guadeloupe — données fictives in-memory pour présentation rectorat.
 * Activé via toggle dans la palette ou par localStorage `cic_demo_mode=1`.
 * N'écrit rien en base : surcharge uniquement le hook MaturiteCICF côté client.
 */
import type { MaturiteCICF } from './maturite-cicf';

const KEY = 'cic_demo_mode';

export function isDemoMode(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem(KEY) === '1';
}

export function setDemoMode(on: boolean) {
  if (on) localStorage.setItem(KEY, '1');
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('demo-mode-changed', { detail: on }));
}

/** Données fictives représentatives d'un groupement guadeloupéen (3 EPLE). */
export const DEMO_MATURITE: MaturiteCICF = {
  scoreGlobal: 72,
  niveau: 'maitrise',
  axes: [
    { id: 'gouvernance', label: 'Gouvernance & équipe', score: 90, poids: 0.20, description: 'AC, ordonnateur, équipe dans Paramètres.' },
    { id: 'perimetre', label: "Périmètre d'audit", score: 100, poids: 0.15, description: 'Couverture des établissements du groupement.' },
    { id: 'controles', label: 'Exécution des contrôles', score: 68, poids: 0.30, description: 'Points M9-6 audités sur la période.' },
    { id: 'tracabilite', label: 'Traçabilité & qualité', score: 60, poids: 0.20, description: 'Anomalies documentées et corrigées.' },
    { id: 'restitution', label: 'Restitution contradictoire', score: 55, poids: 0.15, description: 'PV envoyés et finalisés.' },
  ],
  kpis: {
    auditsTotal: 8,
    auditsClotures: 5,
    pointsAudites: 142,
    pointsTotal: 208,
    tauxCouverture: 68,
    anomaliesOuvertes: 11,
    pvEnAttente: 2,
    pvFinalises: 3,
    agentsActifs: 9,
    etablissementsCouverts: 3,
  },
};

export const DEMO_GROUPEMENT_LABEL = 'Agence comptable Pointe-à-Pitre Sud (DÉMO)';
