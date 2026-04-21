/**
 * Bibliothèque de 15 calculateurs réglementaires CICF — EPLE.
 * Référentiels : M9-6, décret GBCP 2012-1246, CCP 2026, Code éducation, CGCT.
 *
 * Chaque calculateur expose :
 *  - id, label, catégorie, icône (lucide name), référence réglementaire
 *  - description courte et exemple "essayer avec valeurs test"
 *  - composant React via lazy import dans la page hub
 */
import type { LucideIcon } from 'lucide-react';
import {
  Coins, HeartHandshake, Users, Gavel, Scale, Building, ArrowRightLeft,
  UtensilsCrossed, Plane, GraduationCap, Clock, Sun, Briefcase, Timer, BarChart3,
} from 'lucide-react';

export type CalculateurCategorie =
  | 'Trésorerie' | 'Aides sociales' | 'Commande publique'
  | 'Comptabilité' | 'Recettes' | 'Paie' | 'Pilotage';

export interface CalculateurMeta {
  id: string;
  label: string;
  description: string;
  categorie: CalculateurCategorie;
  reference: string;
  icon: LucideIcon;
  /** Restreint à l'agent comptable (ratios bilanciels, etc.) */
  agentComptableOnly?: boolean;
  /** Mots-clés pour la recherche Cmd+K */
  keywords?: string[];
}

export const CALCULATEURS: CalculateurMeta[] = [
  {
    id: 'caisse-regie',
    label: 'Caisse régie',
    description: "Décompte espèces (billets/pièces) + CB + chèques, comparaison théorique/réel, génération du PV.",
    categorie: 'Trésorerie',
    reference: 'Arrêté du 11/12/2019 — régies EPLE',
    icon: Coins,
    keywords: ['billetage', 'pv caisse', 'régisseur'],
  },
  {
    id: 'fonds-social-cantine',
    label: 'Fonds social cantine',
    description: "Aide ≤ créance DP de l'élève. Alerte rouge si dépassement, calcul du reliquat.",
    categorie: 'Aides sociales',
    reference: 'Circulaire 2017-122',
    icon: HeartHandshake,
    keywords: ['aide cantine', 'demi-pension', 'fsc'],
  },
  {
    id: 'fonds-social-eleves',
    label: 'Fonds social collégien / lycéen',
    description: "Suivi de l'enveloppe annuelle, consommation, solde disponible, historique des bénéficiaires.",
    categorie: 'Aides sociales',
    reference: 'Circulaire 2017-122 — fonds sociaux',
    icon: Users,
    keywords: ['fsc', 'fsl', 'enveloppe'],
  },
  {
    id: 'seuils-ccp',
    label: 'Seuils commande publique 2026',
    description: "Saisie HT → vert (gré à gré), orange (3 devis), rouge (MAPA / formalisée). Anti-saucissonnage.",
    categorie: 'Commande publique',
    reference: 'CCP 2026 — Décret 2025-1386',
    icon: Gavel,
    keywords: ['mapa', 'marché', 'seuil', 'achat'],
  },
  {
    id: 'rapprochement-bancaire',
    label: 'Rapprochement bancaire assisté',
    description: "Lettrage relevé DFT ↔ C/515100 Op@le, écarts isolés, génération de l'état de rapprochement.",
    categorie: 'Trésorerie',
    reference: 'M9-6 § 4.3.3',
    icon: Scale,
    keywords: ['dft', '515', 'banque'],
  },
  {
    id: 'amortissements',
    label: 'Amortissements / Immobilisations',
    description: "Tableau d'amortissement linéaire, valeur nette comptable, fin d'amortissement, sorties d'inventaire.",
    categorie: 'Comptabilité',
    reference: 'M9-6 § 4.6 — PCG EPLE classe 2',
    icon: Building,
    keywords: ['vnc', 'immobilisation', 'classe 2'],
  },
  {
    id: 'dbm',
    label: 'DBM / Virements budgétaires',
    description: "Aide à la décision DBM 22/23/24/27, impact budget initial, vérification de l'équilibre.",
    categorie: 'Comptabilité',
    reference: 'GBCP art. 175-178 ; M9-6 § 2.4',
    icon: ArrowRightLeft,
    keywords: ['dbm', 'budget', 'virement'],
  },
  {
    id: 'droits-dp',
    label: 'Droits constatés demi-pension',
    description: "Effectifs × tarifs CA × période. Écart trimestriel/forfait, contrôle transfert GFE → Op@le.",
    categorie: 'Recettes',
    reference: 'M9-6 § 3.2 ; Code éducation R531-52',
    icon: UtensilsCrossed,
    keywords: ['dp', 'demi-pension', 'forfait', 'gfe'],
  },
  {
    id: 'voyage-famille',
    label: 'Participation familles voyage',
    description: "Coût par élève, simulation aides (FSE, coopérative, bourses), reste à charge famille, seuil non-discrimination.",
    categorie: 'Aides sociales',
    reference: 'Circulaire voyages 2011-117',
    icon: Plane,
    keywords: ['voyage', 'sortie', 'erasmus'],
  },
  {
    id: 'bourses',
    label: 'Bourses nationales',
    description: "Rapprochement arrêté rectorat ↔ Op@le, déduction DP, reliquat à verser, régularisation fin d'année.",
    categorie: 'Recettes',
    reference: 'Code éducation R531-13 et s.',
    icon: GraduationCap,
    keywords: ['bourse', 'rectorat', 'reliquat'],
  },
  {
    id: 'dgp',
    label: 'Délai global de paiement (DGP)',
    description: "DGP par mandat, dépassements, intérêts moratoires (taux BCE + 8 points + 40 € forfait).",
    categorie: 'Comptabilité',
    reference: 'Décret 2013-269 ; Loi 2013-100',
    icon: Clock,
    keywords: ['dgp', 'intérêts moratoires', '30 jours'],
  },
  {
    id: 'surremuneration-dom',
    label: 'Surrémunération DOM (Guadeloupe)',
    description: "Coefficient 1,40 — simulation brut/net, cotisations CGSS, IRCANTEC.",
    categorie: 'Paie',
    reference: 'Décret 53-1266 ; art. R3522-1 CGCT',
    icon: Sun,
    keywords: ['dom', 'guadeloupe', '1.40', 'majoration'],
  },
  {
    id: 'taxe-apprentissage',
    label: "Taxe d'apprentissage",
    description: "Répartition entre CFA / établissements, affectation par code activité, reliquat à reverser.",
    categorie: 'Recettes',
    reference: 'Code travail L6241-1 et s.',
    icon: Briefcase,
    keywords: ['ta', 'cfa', 'apprentissage'],
  },
  {
    id: 'heures-sup',
    label: 'Heures supplémentaires',
    description: "HSA / HSE, plafonds réglementaires, calcul de liquidation.",
    categorie: 'Paie',
    reference: 'Décret 50-1253 ; arrêté HSA/HSE',
    icon: Timer,
    keywords: ['hsa', 'hse', 'heures sup'],
  },
  {
    id: 'ratios-bilanciels',
    label: 'Ratios bilanciels (AC)',
    description: "FDR, BFR, trésorerie nette, jours de fonctionnement, CAF. Réservé à l'agent comptable.",
    categorie: 'Pilotage',
    reference: 'M9-6 § 4.5 ; modèle FDRM IGAENR 2016-071',
    icon: BarChart3,
    agentComptableOnly: true,
    keywords: ['fdr', 'bfr', 'caf', 'trésorerie'],
  },
];

export function getCalculateur(id: string): CalculateurMeta | undefined {
  return CALCULATEURS.find(c => c.id === id);
}

export const CALCULATEUR_CATEGORIES: CalculateurCategorie[] = [
  'Trésorerie', 'Aides sociales', 'Commande publique', 'Comptabilité',
  'Recettes', 'Paie', 'Pilotage',
];

// ───────── Historique local (10 derniers calculs) ─────────
const HIST_KEY = 'cic_calculateurs_history_v1';
export interface HistoEntry {
  id: string;
  calculateurId: string;
  label: string;
  resume: string;
  timestamp: number;
}
export function getHistorique(): HistoEntry[] {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch { return []; }
}
export function addHistorique(e: Omit<HistoEntry, 'id' | 'timestamp'>) {
  const list = getHistorique();
  list.unshift({ ...e, id: crypto.randomUUID(), timestamp: Date.now() });
  localStorage.setItem(HIST_KEY, JSON.stringify(list.slice(0, 10)));
}
export function clearHistorique() { localStorage.removeItem(HIST_KEY); }

// ───────── Helpers numériques FR ─────────
export const fmtEur = (v: number) => new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 2,
}).format(isFinite(v) ? v : 0);
export const fmtNum = (v: number, dec = 2) => new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: dec, maximumFractionDigits: dec,
}).format(isFinite(v) ? v : 0);
export const fmtPct = (v: number, dec = 2) => `${fmtNum(v, dec)} %`;
