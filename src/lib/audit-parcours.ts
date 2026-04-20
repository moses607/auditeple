/**
 * Parcours d'Audit CICF — colonne vertébrale de la navigation.
 *
 * Refonte v2 (M9-6 / décret GBCP 2012-1246) :
 *
 *  1. CARTOGRAPHIE DES RISQUES — Préparation du dossier, équipe, calendrier
 *  2. CADRE DE RÉFÉRENCE CICF  — Plan de contrôle annuel, doctrine
 *  3. AUDIT                    — 8 domaines couvrant tout le cycle comptable EPLE
 *  4. SUPERVISION & REVUE 2ᵉ N — Vérification ordonnateur, supervision
 *  5. ANALYSER                 — Analyse financière M9-6, FdR, annexe comptable
 *  6. RESTITUER                — PV d'audit consolidé
 *  7. SUIVRE                   — Piste d'audit, traçabilité
 *
 * Le « Triptyque CICF » (Cartographie · Organigramme · Plan d'action) est
 * affiché dans un groupe distinct en tête de sidebar.
 */

import {
  Briefcase, Compass, Calculator, ClipboardCheck,
  TrendingUp, FileSignature, CalendarClock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type EtapeId =
  | 'preparer' | 'cadrer' | 'controler'
  | 'verifier' | 'analyser' | 'restituer' | 'suivre';

export interface EtapeParcours {
  id: EtapeId;
  numero: number;
  label: string;
  description: string;
  /** Verbe d'action court pour breadcrumb / titres */
  verbe: string;
  icon: LucideIcon;
  /** Couleur de l'étape (token semantic ou Tailwind) */
  color: string;
  /** IDs de modules (issus de audit-modules.ts) appartenant à l'étape */
  moduleIds: string[];
}

export const PARCOURS_ETAPES: EtapeParcours[] = [
  {
    id: 'preparer',
    numero: 1,
    label: 'Cartographie des risques',
    verbe: 'Cartographie',
    description:
      "Constitution du dossier, équipe d'audit, organigramme fonctionnel, calendrier annuel de l'agence comptable. Référence : M9-6 § 1.2 — séparation des tâches.",
    icon: Briefcase,
    color: 'text-section-controle-interne',
    moduleIds: ['parametres', 'calendrier-annuel'],
  },
  {
    id: 'cadrer',
    numero: 2,
    label: 'Cadre de référence CICF',
    verbe: 'Cadrage',
    description:
      "Délimitation du périmètre et plan de contrôle annuel selon la nomenclature M9-6. La cartographie des risques est traitée dans le Triptyque CICF.",
    icon: Compass,
    color: 'text-section-controle-interne',
    moduleIds: ['plan-controle'],
  },
  {
    id: 'controler',
    numero: 3,
    label: 'AUDIT',
    verbe: 'Audit',
    description:
      "Audit des 8 domaines du cycle comptable EPLE : Dépenses, Recettes, Trésorerie, Tiers, Stocks, Paie, Services spéciaux, Gouvernance. Conforme M9-6 et décret GBCP 2012-1246.",
    icon: Calculator,
    color: 'text-section-controles',
    moduleIds: [
      'audit-domaines',
      // A. Cycle dépenses
      'depenses', 'marches',
      // B. Cycle recettes
      'droits-constates', 'bourses', 'fonds-sociaux', 'recouvrement', 'subventions',
      // C. Trésorerie & moyens de paiement
      'controle-caisse', 'rapprochement', 'regies',
      // D. Comptes de tiers — couverts via verification (471/472/473/486/487)
      'verification',
      // E. Stocks & immobilisations
      'stocks',
      // G. Services spéciaux & budgets annexes
      'restauration', 'voyages', 'budgets-annexes',
    ],
  },
  {
    id: 'verifier',
    numero: 4,
    label: 'Supervision & revue 2ᵉ niveau',
    verbe: 'Supervision',
    description:
      "Supervision et revue de second niveau : conformité ordonnateur, délégations de signature, habilitations Op@le, séparation des fonctions. Réf. : décret GBCP 2012-1246 art. 9-12.",
    icon: ClipboardCheck,
    color: 'text-section-verification',
    moduleIds: ['ordonnateur'],
  },
  {
    id: 'analyser',
    numero: 5,
    label: 'Analyser',
    verbe: 'Analyse financière',
    description:
      "Analyse financière M9-6 § 4.5.3 (DRFN/365), fonds de roulement (modèle FDRM IGAENR 2016-071), annexe comptable narrative.",
    icon: TrendingUp,
    color: 'text-section-finances',
    moduleIds: ['analyse-financiere', 'fonds-roulement', 'annexe-comptable'],
  },
  {
    id: 'restituer',
    numero: 6,
    label: 'Restituer',
    verbe: 'Restitution',
    description:
      "PV d'audit consolidé (collecte automatique des anomalies de tous les modules contrôlés). Le plan d'action figure dans le Triptyque CICF.",
    icon: FileSignature,
    color: 'text-section-restitution',
    moduleIds: ['pv-audit'],
  },
  {
    id: 'suivre',
    numero: 7,
    label: 'Suivre',
    verbe: 'Suivi & traçabilité',
    description:
      "Piste d'audit chronologique, suivi des recommandations, traçabilité des opérations (M9-6 § 5.1).",
    icon: CalendarClock,
    color: 'text-section-restitution',
    moduleIds: ['piste-audit', 'mentions-legales'],
  },
];

/** Lookup rapide module → étape */
const MODULE_TO_ETAPE = new Map<string, EtapeParcours>();
PARCOURS_ETAPES.forEach(e => e.moduleIds.forEach(mid => MODULE_TO_ETAPE.set(mid, e)));

export function getEtapeForModule(moduleId: string): EtapeParcours | undefined {
  return MODULE_TO_ETAPE.get(moduleId);
}

export function getEtapeById(id: EtapeId): EtapeParcours | undefined {
  return PARCOURS_ETAPES.find(e => e.id === id);
}

/** Modules orphelins (présents dans audit-modules mais pas attachés à une étape) */
export function getOrphanModuleIds(allModuleIds: string[]): string[] {
  return allModuleIds.filter(id => !MODULE_TO_ETAPE.has(id));
}

// ───────────────────────────────────────────────────────────────────
// SOUS-DOMAINES DE L'ÉTAPE 3 « AUDIT » — 8 domaines M9-6 / GBCP
// ───────────────────────────────────────────────────────────────────

export interface DomaineAudit {
  id: string;
  lettre: string; // A à H
  label: string;
  description: string;
  reference: string;
  periodicite: string;
  /** IDs de modules existants couvrant ce domaine */
  moduleIds: string[];
  /** Check-list opérationnelle (≥ 5 points) */
  checklist: string[];
}

export const DOMAINES_AUDIT: DomaineAudit[] = [
  {
    id: 'cycle-depenses',
    lettre: 'A',
    label: 'Cycle Dépenses',
    description: "Engagement, liquidation, mandatement et paiement des dépenses publiques.",
    reference: "Décret GBCP 2012-1246 art. 30-37 ; M9-6 § 3.3 ; CCP 2018",
    periodicite: 'Mensuel',
    moduleIds: ['depenses', 'marches'],
    checklist: [
      "Vérifier le respect des seuils de la commande publique (CCP 2026)",
      "Contrôler l'absence de saucissonnage des marchés (art. R2121-1 CCP)",
      "Vérifier le service fait avant mandatement (GBCP art. 31)",
      "Contrôler les pièces justificatives (décret 2012-1246 annexe)",
      "Suivre les délais globaux de paiement (DGP) et intérêts moratoires",
      "Vérifier la régularité des avances et acomptes (CCP art. R2191-3)",
    ],
  },
  {
    id: 'cycle-recettes',
    lettre: 'B',
    label: 'Cycle Recettes',
    description: "Constatation, ordonnancement et recouvrement des recettes (familles, État, collectivités).",
    reference: "GBCP art. 18-22 ; M9-6 § 3.2 ; Code éducation art. R531-13 et s.",
    periodicite: 'Mensuel',
    moduleIds: ['droits-constates', 'bourses', 'fonds-sociaux', 'recouvrement'],
    checklist: [
      "Vérifier l'exhaustivité des droits constatés (transfert GFE → Op@le)",
      "Contrôler les ordres de recettes et titres exécutoires (GBCP art. 22)",
      "Vérifier la liquidation des bourses nationales (Code éducation R531-13)",
      "Contrôler les participations familles (DP, voyages)",
      "Suivre les diligences de recouvrement amiable et contentieux",
      "Tracer les admissions en non-valeur et remises gracieuses",
    ],
  },
  {
    id: 'tresorerie',
    lettre: 'C',
    label: 'Trésorerie & Moyens de paiement',
    description: "Sécurisation des flux financiers et rapprochement des comptes de trésorerie.",
    reference: "GBCP art. 191-198 ; M9-6 § 4.3 ; arrêté du 11/12/2019 régies",
    periodicite: 'Mensuel',
    moduleIds: ['controle-caisse', 'rapprochement', 'regies'],
    checklist: [
      "Effectuer le rapprochement bancaire mensuel DFT (M9-6 § 4.3.3)",
      "Vérifier les flux PES et virements émis",
      "Contrôler les chèques, CB, espèces (caisse)",
      "Auditer les régies de recettes et d'avances (14 points obligatoires)",
      "Vérifier la sécurisation physique des moyens de paiement",
    ],
  },
  {
    id: 'comptes-tiers',
    lettre: 'D',
    label: 'Comptes de Tiers',
    description: "Lettrage et apurement des comptes 4XX (clients, fournisseurs, attente, régularisation).",
    reference: "M9-6 § 3.4 ; PCG EPLE comptes classe 4",
    periodicite: 'Mensuel',
    moduleIds: ['verification'],
    checklist: [
      "Lettrer le compte 411 (familles, élèves)",
      "Apurer les comptes fournisseurs 401 et 408 (factures non parvenues)",
      "Justifier les soldes des comptes 46X (créditeurs/débiteurs divers)",
      "Apurer les comptes 47X (471 à classer, 472 à régulariser, 473)",
      "Détecter les soldes anormaux (débiteurs en crédit, créditeurs en débit)",
      "Surveiller les comptes 486/487 (charges/produits constatés d'avance)",
    ],
  },
  {
    id: 'stocks-immo',
    lettre: 'E',
    label: 'Stocks & Immobilisations',
    description: "Inventaire physique, valorisation et amortissements.",
    reference: "M9-6 § 4.5 et § 4.6 ; PCG EPLE classe 2",
    periodicite: 'Annuel (inventaire) — Mensuel (stocks)',
    moduleIds: ['stocks'],
    checklist: [
      "Réaliser l'inventaire physique annuel des denrées (restauration)",
      "Contrôler les stocks de fournitures et consommables",
      "Effectuer l'inventaire physique des immobilisations corporelles",
      "Vérifier les amortissements pratiqués (durée, méthode)",
      "Tracer les sorties d'inventaire et cessions (procès-verbal)",
    ],
  },
  {
    id: 'paie-rh',
    lettre: 'F',
    label: 'Paie & RH',
    description: "Liquidation des rémunérations des personnels payés sur budget de l'établissement.",
    reference: "Décret 86-83 (contractuels) ; circulaire IFSE/CIA ; Code Sécurité sociale",
    periodicite: 'Mensuel',
    moduleIds: [],
    checklist: [
      "Vérifier la liquidation des rémunérations agents contractuels (décret 86-83)",
      "Contrôler les indemnités IFSE, CIA, NBI, heures supplémentaires",
      "Vérifier le calcul des cotisations sociales (URSSAF, IRCANTEC)",
      "Contrôler la surrémunération DOM (Guadeloupe, art. R3522-1 CGCT)",
      "Vérifier la paie des apprentis CFA et contrats aidés (PEC, AESH)",
    ],
  },
  {
    id: 'services-speciaux',
    lettre: 'G',
    label: 'Services Spéciaux & Budgets Annexes',
    description: "SRH, objets confectionnés, CFA/GRETA, voyages, fonds sociaux, taxe d'apprentissage.",
    reference: "M9-6 Tome 2 § 2.1.2.3.2 ; circulaire 2017-122 (fonds sociaux)",
    periodicite: 'Trimestriel',
    moduleIds: ['restauration', 'voyages', 'budgets-annexes', 'subventions'],
    checklist: [
      "Auditer le service de restauration et hébergement (SRH)",
      "Contrôler les objets confectionnés (atelier pédagogique)",
      "Vérifier l'équilibre budgétaire CFA / GRETA / formation continue",
      "Auditer les voyages et sorties scolaires (dont Erasmus+)",
      "Contrôler l'emploi des fonds sociaux (commission, justificatifs)",
      "Vérifier la perception de la taxe d'apprentissage",
    ],
  },
  {
    id: 'gouvernance-si',
    lettre: 'H',
    label: 'Gouvernance & Système d\'Information',
    description: "Séparation ordonnateur/comptable, habilitations Op@le, fin d'exercice.",
    reference: "GBCP art. 9-12 (séparation) ; M9-6 § 1.2 ; arrêté 25/07/2013 accréditation",
    periodicite: 'Annuel',
    moduleIds: ['ordonnateur'],
    checklist: [
      "Vérifier la séparation effective ordonnateur / comptable (GBCP art. 9)",
      "Contrôler les délégations de signature (publication, périmètre)",
      "Auditer les habilitations Op@le (profils, droits, revue annuelle)",
      "Vérifier l'archivage des pièces comptables (durée légale 10 ans)",
      "Contrôler les opérations de fin d'exercice (rattachement, PCA, CCA)",
      "Vérifier la cohérence compte financier ordonnateur / agent comptable",
    ],
  },
];

export function getDomaineAuditForModule(moduleId: string): DomaineAudit | undefined {
  return DOMAINES_AUDIT.find(d => d.moduleIds.includes(moduleId));
}
