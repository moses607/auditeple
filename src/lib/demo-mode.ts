/**
 * Mode démo Guadeloupe — données fictives in-memory pour présentation rectorat.
 * Activé via toggle dans la palette ou par localStorage `cic_demo_mode=1`.
 * N'écrit rien en base : surcharge uniquement les hooks/lecteurs côté client.
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

// ────────────────────────────────────────────────────────────────────────────
// Dataset démo — Régies & Caisse (Lycée Baimbridge, UAI 9710003X)
// Conforme M9-6 § 3.2 et Décret 2019-798. Mélange volontaire de cas conformes
// et d'écarts détectables pour démonstration des contrôles automatiques.
// ────────────────────────────────────────────────────────────────────────────
export const DEMO_REGIES = {
  acte: {
    dateCreation: '2021-09-01',
    referenceArrete: 'Arrêté n° 2021-145 du 01/09/2021',
    typeRegie: 'Avances et recettes',
    montantPlafond: 2500,
    montantAvance: 1500,
    dureeAvance: '1 mois',
    objetRegie: 'Menues dépenses de fonctionnement et encaissement des recettes annexes (photocopies, locations de salles).',
    observations: 'Régie créée par arrêté du chef d\'établissement, visa AC du 30/08/2021.',
  },
  nomination: {
    nom: 'BERNARD',
    prenom: 'Sylvie',
    fonction: 'Secrétaire d\'intendance',
    dateNomination: '2021-09-01',
    referenceArrete: 'Arrêté de nomination n° 2021-146 du 01/09/2021',
    suppleant: 'JEAN-LOUIS Marc',
    dateSuppleance: '2021-09-01',
    formationRegie: true,
    dateFormation: '2021-06-15',
    observations: 'Régisseuse titulaire confirmée, suppléant désigné conformément à l\'art. 10 du Décret 2019-798.',
    irMontantAnnuel: 110,
    irVersee: true,
    // Champ ajouté pour la conformité M9-6 (contrôle inopiné annuel obligatoire)
    dateDernierControleInopine: new Date(Date.now() - 95 * 24 * 3600 * 1000).toISOString().split('T')[0],
  },
  controles: [
    {
      id: 'demo-c1',
      date: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      regisseur: 'BERNARD Sylvie',
      type: 'Avances restauration',
      plafond: 3000,
      theorique: 1248.50,
      reel: 1248.50,
      ecart: 0,
      statut: 'Conforme',
      observations: 'Comptage inopiné AC, billetage complet, journal à jour.',
      journalCaisse: true,
      billetage: { b50: 20, b20: 10, b10: 4, b5: 1, p2: 1, p1: 1, p050: 1 },
    },
    {
      id: 'demo-c2',
      date: new Date(Date.now() - 95 * 24 * 3600 * 1000).toISOString().split('T')[0],
      regisseur: 'BERNARD Sylvie',
      type: 'Recettes restauration',
      plafond: 10000,
      theorique: 8420.00,
      reel: 8418.50,
      ecart: -1.50,
      statut: 'Écart',
      observations: 'Léger écart de caisse de 1,50 € — régularisé immédiatement par le régisseur.',
      journalCaisse: true,
      billetage: {},
    },
  ],
  cheques: [
    { id: 'demo-q1', numero: '7845212', emetteur: 'Famille DUPONT', montant: 245.00, date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0], observations: 'Voyage scolaire Espagne' },
    { id: 'demo-q2', numero: '8521447', emetteur: 'Association FCPE', montant: 1200.00, date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0], observations: 'Subvention sortie pédagogique' },
  ],
  valeurs: [
    { id: 'demo-v1', type: 'Tickets cantine', serieDebut: 'TC-2024-0001', serieFin: 'TC-2024-1500', quantite: 1500, valeurUnitaire: 4.20, observations: 'Stock début exercice 2024-2025' },
    { id: 'demo-v2', type: 'Cartes de photocopie', serieDebut: 'CP-001', serieFin: 'CP-200', quantite: 200, valeurUnitaire: 5.00, observations: '' },
  ],
  // DFT : encaissement il y a 4 jours, versement il y a 1 jour → 3 jours, conforme (< 7 j)
  dftMontant: '1850.00',
  dftDateEncaissement: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
  dftDateVersement: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
  // Cases cochées — ~80 % des contrôles obligatoires Régies déjà accomplis
  regChecks: {
    reg1: true, reg2: true, reg3: true, reg4: true, reg5: true,
    reg6: true, reg7: true, reg8: true, reg9: true, reg10: true,
    reg11: false, reg12: true, reg13: true, reg14: false,
  } as Record<string, boolean>,
};
