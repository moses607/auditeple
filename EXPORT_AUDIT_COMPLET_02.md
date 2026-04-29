> 📚 **Document d'export en 3 parties.** Vous lisez la partie **2/3**.
>
> Fichiers : `EXPORT_AUDIT_COMPLET_01.md`, `EXPORT_AUDIT_COMPLET_02.md`, `EXPORT_AUDIT_COMPLET_03.md`

# EXPORT AUDIT COMPLET — Suite

_Suite de la PARTIE 3 — code source intégral._

### FICHIER : src/lib/calculateurs.ts

```ts
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

```

### FICHIER : src/lib/calendrier-activites.ts

```ts
// Bibliothèque pré-remplie des activités du calendrier annuel de l'agent comptable
// Sources : décret 2012-1246 (GBCP), art. R. 421-64 et s. Code éducation, M9.6,
// circulaire n° 2011-117 du 03/08/2011 (voyages), guides DAF A3 / IH2EF, vade-mecum

export type Periodicite = 'mensuelle' | 'trimestrielle' | 'annuelle' | 'ponctuelle';
export type Categorie =
  | 'Cloture / Inventaire'
  | 'Compte financier'
  | 'Bourses'
  | 'Voyages scolaires'
  | 'Budget'
  | 'Régies'
  | 'Contrôle interne'
  | 'Audit ER'
  | 'Pilotage / Conseil AC'
  | 'Restauration / SRH'
  | 'Recouvrement'
  | 'Marchés / Achats'
  | 'Ressources';

export interface ActiviteModele {
  id: string;
  titre: string;
  categorie: Categorie;
  periodicite: Periodicite;
  // Mois clé (1-12) pour l'affichage par défaut. Pour mensuel : 0 = tous les mois.
  moisDebut: number;
  moisFin?: number;
  reference?: string;
  description: string;
  responsable: 'AC' | 'ER' | 'AC+ER';
  criticite: 'haute' | 'moyenne' | 'info';
}

export const ACTIVITES_MODELES: ActiviteModele[] = [
  // ═══ JANVIER — Inventaire et clôture définitive ═══
  {
    id: 'jan-inventaire',
    titre: "Opérations d'inventaire sur exercice N-1 (date comptable 31/12/N-1)",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 1,
    reference: 'M9.6 — GBCP',
    description: "Apurement EJ, extourne charges à payer / produits à recevoir, liquidation définitive des factures, contre-passations, variations de stocks (DBM 293), amortissements, relevés de compteurs, inventaire denrées / matières / objets confectionnés / fuel / gaz.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'jan-dbm22-credit-nourriture',
    titre: "Variation du crédit nourriture (DBM 22) — service SRH",
    categorie: 'Restauration / SRH',
    periodicite: 'trimestrielle',
    moisDebut: 1,
    description: "À calculer quelques semaines avant la fin de chaque trimestre afin de vérifier si le solde permet de boucler les charges du trimestre.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },
  {
    id: 'jan-er-stocks-gti',
    titre: "Transmission par les ER : états de stocks au 31/12 et GTI (valeurs inactives)",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 1,
    description: "Tous documents nécessaires à l'inventaire à transmettre à l'AC sans retard.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'jan-cloture-21',
    titre: "Avant le 21 janvier : fin de toutes les opérations d'exercice N-1",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 1,
    description: "Date butoir réglementaire pour la finalisation des opérations de fin d'exercice N-1.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'jan-rappel-ej',
    titre: "Rappel SG : apurer régulièrement les EJ et opérations bloquantes",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 1,
    description: "Note de l'AC aux secrétaires généraux : prendre dès le début d'année l'habitude d'apurer les engagements juridiques pour ne pas bloquer le compte financier.",
    responsable: 'AC',
    criticite: 'moyenne',
  },

  // ═══ FÉVRIER — AVRIL — Compte financier ═══
  {
    id: 'fev-elaboration-cf',
    titre: "Élaboration du compte financier N-1",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 2,
    moisFin: 4,
    reference: 'art. R. 421-77 Code éducation',
    description: "Préparation du compte financier par l'agent comptable en lien avec les ordonnateurs.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'avr-vote-cf',
    titre: "Vote du compte financier au CA — au plus tard le 30 avril",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 4,
    reference: 'art. R. 421-77 Code éducation',
    description: "Avant expiration du 4ᵉ mois suivant le 31/12. AC présente la situation patrimoniale ; SG présente l'exécution budgétaire et le compte rendu de gestion.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'avr-fourniture-docs',
    titre: "Fourniture des documents post-CA par l'AC",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 4,
    description: "Juste après la séance de travail du CA, l'AC fournit les documents nécessaires.",
    responsable: 'AC',
    criticite: 'moyenne',
  },
  {
    id: 'avr-transmission-actes',
    titre: "Transmission des actes du CA — sous 30 jours après le vote",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 4,
    description: "Délai maximum de 30 jours après le vote du CA pour la transmission des actes.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'avr-controle-interne-diag',
    titre: "Contrôle interne comptable et financier — diagnostic",
    categorie: 'Contrôle interne',
    periodicite: 'annuelle',
    moisDebut: 4,
    moisFin: 5,
    description: "Diagnostic CICF en lien avec la cartographie des risques.",
    responsable: 'AC',
    criticite: 'moyenne',
  },

  // ═══ MAI — AOÛT ═══
  {
    id: 'mai-conseil-ac',
    titre: "Réunions du conseil de l'agence comptable",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 5,
    moisFin: 6,
    description: "Réunions de pilotage du groupement comptable.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },
  {
    id: 'mai-controle-regies',
    titre: "Contrôles des régies permanentes et temporaires",
    categorie: 'Régies',
    periodicite: 'annuelle',
    moisDebut: 5,
    moisFin: 7,
    reference: 'décret 2019-798',
    description: "Au moins une fois tous les 2 ans. Contrôle de la caisse, des pièces justificatives et des avances.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'jun-bourses-t3',
    titre: "Liquidation et paiement des bourses du 3ᵉ trimestre",
    categorie: 'Bourses',
    periodicite: 'annuelle',
    moisDebut: 6,
    description: "Généralement fin juin. AC paie et suit les comptes 441120 / 441912.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'jun-vote-programmation-voyages',
    titre: "Vote CA — programmation des voyages scolaires année scolaire suivante",
    categorie: 'Voyages scolaires',
    periodicite: 'annuelle',
    moisDebut: 6,
    moisFin: 7,
    reference: 'circ. n° 2011-117 du 03/08/2011',
    description: "Présentation et vote de la programmation des voyages au CA en juin ou juillet (anticipation exigée par la circulaire).",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'jul-verification-pre-conges',
    titre: "Vérification d'été — opérations en cours et EJ",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 7,
    description: "Vérification recommandée avant les congés des opérations en cours et apurement préventif des engagements juridiques.",
    responsable: 'AC',
    criticite: 'moyenne',
  },

  // ═══ SEPTEMBRE — Rentrée comptable ═══
  {
    id: 'sep-accreditation-ordonnateurs',
    titre: "Réception des arrêtés de nomination et accréditations des ordonnateurs",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 9,
    reference: 'arrêté du 25 juillet 2013',
    description: "Vérification des accréditations des ordonnateurs et délégations de signature.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'sep-transmission-calendrier',
    titre: "Transmission du calendrier annuel aux ER",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 9,
    description: "Diffusion du présent calendrier aux établissements rattachés lors du conseil de l'agence comptable.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'sep-conseil-ac-rentree',
    titre: "Réunion du conseil de l'agence comptable — rentrée",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 9,
    description: "Réunion de rentrée du conseil du groupement.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },
  {
    id: 'sep-organigramme-pa',
    titre: "Mise à jour organigramme fonctionnel et plan d'action CICF",
    categorie: 'Contrôle interne',
    periodicite: 'annuelle',
    moisDebut: 9,
    description: "Actualisation de l'organigramme fonctionnel et du plan d'action de maîtrise des risques.",
    responsable: 'AC',
    criticite: 'moyenne',
  },
  {
    id: 'sep-vote-financement-voyages',
    titre: "Vote CA — financement des voyages scolaires",
    categorie: 'Voyages scolaires',
    periodicite: 'annuelle',
    moisDebut: 9,
    moisFin: 10,
    reference: 'circ. n° 2011-117',
    description: "Vote du financement après la programmation. Prévoir ensuite la mise en concurrence (Code de la commande publique) et le délai pour le paiement des familles.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'sep-bourses-campagne',
    titre: "Démarrage campagne bourses (1ᵉʳ trimestre)",
    categorie: 'Bourses',
    periodicite: 'annuelle',
    moisDebut: 9,
    description: "Préparation de la liquidation du 1ᵉʳ trimestre et lancement de la campagne.",
    responsable: 'ER',
    criticite: 'moyenne',
  },
  {
    id: 'sep-er-concessions-stocks',
    titre: "ER : transmettre concessions de logement, inventaires stocks, projet de budget",
    categorie: 'Ressources',
    periodicite: 'annuelle',
    moisDebut: 9,
    description: "Documents indispensables à la préparation de l'exercice et du budget N+1.",
    responsable: 'ER',
    criticite: 'moyenne',
  },

  // ═══ OCTOBRE ═══
  {
    id: 'oct-note-fin-exercice',
    titre: "Note « opérations de fin d'exercice » envoyée par l'AC",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 10,
    description: "Instructions détaillées de clôture envoyées à tous les ER.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'oct-debut-apurement-ej',
    titre: "Début apurement des EJ — limiter les commandes non urgentes",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 10,
    description: "Apurement progressif des engagements juridiques en vue de la clôture. Limitation des commandes non urgentes dès mi-novembre.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'oct-bourses-fin-demandes',
    titre: "Campagne bourses : fin des demandes (3ᵉ jeudi d'octobre)",
    categorie: 'Bourses',
    periodicite: 'annuelle',
    moisDebut: 10,
    description: "Date limite réglementaire de dépôt des demandes de bourses.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'oct-point-trim-tresorerie',
    titre: "Point trimestriel trésorerie et créances",
    categorie: 'Recouvrement',
    periodicite: 'trimestrielle',
    moisDebut: 10,
    description: "Point trimestriel avec chaque ordonnateur sur la trésorerie, les créances et le délai global de paiement.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },

  // ═══ NOVEMBRE ═══
  {
    id: 'nov-notif-subvention',
    titre: "Notification de la subvention globale de la collectivité (avant 1ᵉʳ nov.)",
    categorie: 'Budget',
    periodicite: 'annuelle',
    moisDebut: 11,
    description: "Réception de la notification déclenchant l'élaboration du budget N+1.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'nov-ar-chef-etab',
    titre: "Accusé de réception par le chef d'établissement → délai 30j vote CA",
    categorie: 'Budget',
    periodicite: 'annuelle',
    moisDebut: 11,
    description: "L'AR déclenche le délai réglementaire de 30 jours pour le vote du budget au CA.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'nov-arret-commandes',
    titre: "Arrêt des commandes (dans la mesure du possible)",
    categorie: 'Marchés / Achats',
    periodicite: 'annuelle',
    moisDebut: 11,
    description: "Pour avoir toutes les factures payées avant la fin de l'exercice.",
    responsable: 'ER',
    criticite: 'moyenne',
  },

  // ═══ DÉCEMBRE — Clôture ═══
  {
    id: 'dec-arret-menues-depenses',
    titre: "Arrêt des menues dépenses (vers le 11 décembre)",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Arrêt des menues dépenses en vue de la clôture.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'dec-stop-tickets-repas',
    titre: "Stopper la vente des tickets repas (12-13 décembre)",
    categorie: 'Restauration / SRH',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Arrêt de la vente des tickets repas pour permettre l'arrêté des comptes.",
    responsable: 'ER',
    criticite: 'moyenne',
  },
  {
    id: 'dec-mandater-15',
    titre: "Mandater toutes factures et émettre tous titres avant le 15 décembre",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Sous Op@le : émission de toutes les demandes de paiement et titres de recette possibles avant la date butoir.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'dec-encaissement-final',
    titre: "Encaissement final des chèques",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Dernier dépôt et encaissement des chèques avant clôture.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'dec-bourses-t1',
    titre: "Liquidation et paiement des bourses du 1ᵉʳ trimestre",
    categorie: 'Bourses',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Généralement fin décembre.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'dec-prepa-cf',
    titre: "Préparation du compte financier N (inventaires au 31/12)",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Inventaires denrées, matières, objets confectionnés, fuel/gaz au 31/12.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'dec-cloture-regies',
    titre: "Clôture des régies temporaires et restitution des avances",
    categorie: 'Régies',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Clôture des régies temporaires de l'année et restitution de l'avance pour menues dépenses.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'dec-er-transmission-finale',
    titre: "ER : transmission de tous les éléments à l'AC (avant 15/12)",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Respect strict de la date pour permettre l'apurement et l'inventaire.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'dec-taxe-apprentissage',
    titre: "Campagne taxe d'apprentissage",
    categorie: 'Ressources',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Sollicitation des entreprises.",
    responsable: 'ER',
    criticite: 'moyenne',
  },

  // ═══ AVRIL — JUIN spécifique voyages ═══
  {
    id: 'avr-recensement-voyages',
    titre: "Recensement des projets de voyages scolaires",
    categorie: 'Voyages scolaires',
    periodicite: 'annuelle',
    moisDebut: 4,
    moisFin: 6,
    reference: 'circ. n° 2011-117 du 03/08/2011',
    description: "Remontée des projets par les ER en vue du vote de programmation au CA de juin ou juillet (année scolaire suivante).",
    responsable: 'ER',
    criticite: 'haute',
  },

  // ═══ JUIN — Compte financier sur Infocentre ═══
  {
    id: 'jun-cf-infocentre',
    titre: "Envoi du compte financier sur Infocentre — avant fin juin",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 6,
    description: "Délai de rigueur pour la transmission du compte financier sur Infocentre par l'agent comptable.",
    responsable: 'AC',
    criticite: 'haute',
  },

  // ═══ MARS — Bourses T2 ═══
  {
    id: 'mar-bourses-t2',
    titre: "Liquidation et paiement des bourses du 2ᵉ trimestre",
    categorie: 'Bourses',
    periodicite: 'annuelle',
    moisDebut: 3,
    description: "Généralement fin mars.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },

  // ═══ AUDITS ER — toute l'année ═══
  {
    id: 'audit-er-annuel',
    titre: "Audit AC dans chaque ER (au moins 1 fois / an)",
    categorie: 'Audit ER',
    periodicite: 'annuelle',
    moisDebut: 9,
    moisFin: 6,
    description: "Planifié en septembre (conseil de l'agence) et réalisé au moins une fois par an : contrôle de la comptabilité matière, des régies, des pièces justificatives, apurement des engagements.",
    responsable: 'AC',
    criticite: 'haute',
  },

  // ═══ MENSUEL ═══
  {
    id: 'mois-arret-comptes',
    titre: "Arrêt mensuel des comptes et édition des états",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'mensuelle',
    moisDebut: 0,
    description: "Arrêt mensuel des comptes et édition des états nécessaires. Les SG ont accès direct aux balances via Op@le.",
    responsable: 'AC',
    criticite: 'moyenne',
  },

  // ═══ ITEMS COMPLÉMENTAIRES (Chantier 1 — refonte) ═══

  // JANVIER — additions
  {
    id: 'jan-rattachement-cca-pca',
    titre: "Rattachement charges/produits N-1 (CCA / PCA)",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 1,
    reference: 'M9-6 § 4.3',
    description: "Charges constatées d'avance (CCA) et produits constatés d'avance (PCA) pour respecter le principe de rattachement à l'exercice.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'jan-reprise-resultats',
    titre: "Reprise des résultats N-1 en N",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 1,
    description: "Écritures d'à-nouveaux et reprise des résultats de l'exercice précédent.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'jan-dbm-report',
    titre: "Première DBM de l'exercice (report de crédits)",
    categorie: 'Budget',
    periodicite: 'annuelle',
    moisDebut: 1,
    reference: 'GBCP 2012-1246',
    description: "DBM de report de crédits permettant la continuité des opérations engagées.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },

  // FÉVRIER — additions
  {
    id: 'fev-arretes-bourses',
    titre: "Arrêtés de régularisation des bourses (collège/lycée)",
    categorie: 'Bourses',
    periodicite: 'annuelle',
    moisDebut: 2,
    description: "Régularisation des arrêtés bourses suite aux modifications d'effectifs et de quotités.",
    responsable: 'ER',
    criticite: 'moyenne',
  },
  {
    id: 'fev-declaration-taxe-app',
    titre: "Déclaration taxe d'apprentissage N-1",
    categorie: 'Ressources',
    periodicite: 'annuelle',
    moisDebut: 2,
    description: "Déclaration et reversement de la taxe d'apprentissage perçue sur l'exercice précédent.",
    responsable: 'AC',
    criticite: 'moyenne',
  },
  {
    id: 'fev-recouvrements-douteux',
    titre: "Point d'étape sur les recouvrements douteux",
    categorie: 'Recouvrement',
    periodicite: 'trimestrielle',
    moisDebut: 2,
    description: "Identification des créances douteuses, propositions de provisions ou d'admissions en non-valeur.",
    responsable: 'AC',
    criticite: 'moyenne',
  },

  // MARS — additions
  {
    id: 'mar-cf-drfip',
    titre: "Envoi du compte financier aux services de la DRFiP",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 3,
    description: "Transmission du compte financier à la DRFiP dans le cadre du contrôle hiérarchisé.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'mar-rapport-annuel-ac',
    titre: "Préparation du rapport annuel de l'agent comptable",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 3,
    description: "Rédaction du rapport annuel d'activité de l'agence comptable.",
    responsable: 'AC',
    criticite: 'moyenne',
  },
  {
    id: 'mar-rappro-trim',
    titre: "Rapprochement bancaire trimestriel",
    categorie: 'Contrôle interne',
    periodicite: 'trimestrielle',
    moisDebut: 3,
    description: "Rapprochement bancaire formalisé du trimestre, validation de l'absence d'écarts inexpliqués.",
    responsable: 'AC',
    criticite: 'haute',
  },

  // MAI — additions
  {
    id: 'mai-dob-prep',
    titre: "Préparation du débat d'orientation budgétaire (DOB)",
    categorie: 'Budget',
    periodicite: 'annuelle',
    moisDebut: 5,
    description: "Préparation du DOB qui précède le vote du budget primitif N+1.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },
  {
    id: 'mai-cartographie-update',
    titre: "Mise à jour de la cartographie des risques",
    categorie: 'Contrôle interne',
    periodicite: 'annuelle',
    moisDebut: 5,
    reference: 'M9-6 § 5.2',
    description: "Réévaluation annuelle des risques (probabilité × impact × maîtrise) sur les 11 processus Cartop@le.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'mai-supervision-niv2',
    titre: "Contrôle interne comptable : supervision de 2ᵉ niveau",
    categorie: 'Contrôle interne',
    periodicite: 'annuelle',
    moisDebut: 5,
    description: "Revue de second niveau par l'agent comptable des contrôles de premier niveau.",
    responsable: 'AC',
    criticite: 'moyenne',
  },

  // JUIN — additions
  {
    id: 'jun-cloture-pedago',
    titre: "Clôture pédagogique — préparation de la rentrée",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 6,
    description: "Anticipation des opérations de rentrée : tarifs DP, effectifs, dotations.",
    responsable: 'ER',
    criticite: 'moyenne',
  },
  {
    id: 'jun-relances-impayes',
    titre: "Campagne de relance des impayés avant fin d'exercice scolaire",
    categorie: 'Recouvrement',
    periodicite: 'annuelle',
    moisDebut: 6,
    description: "Relances familles avant les congés d'été pour limiter les pertes de contact.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },

  // JUILLET — additions
  {
    id: 'jul-arrete-comptes-3107',
    titre: "Arrêté des comptes au 31/07 (fin d'exercice pédagogique)",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 7,
    description: "Point intermédiaire à la fin de l'année scolaire pour cadrer la suite.",
    responsable: 'AC',
    criticite: 'moyenne',
  },
  {
    id: 'jul-bilan-voyages',
    titre: "Bilan des voyages scolaires de l'année",
    categorie: 'Voyages scolaires',
    periodicite: 'annuelle',
    moisDebut: 7,
    reference: 'circ. 2011-117',
    description: "Bilan financier et pédagogique des voyages réalisés, restitution éventuelle des excédents.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },
  {
    id: 'jul-fonds-sociaux-bilan',
    titre: "Point fonds sociaux : reliquat, reconduction",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 7,
    description: "Bilan d'utilisation des fonds sociaux (FSE, FSL) et anticipation de la reconduction N+1.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },

  // AOÛT — additions
  {
    id: 'aou-tarifs-dp',
    titre: "Préparation rentrée : tarifs DP, forfaits, ventilations",
    categorie: 'Restauration / SRH',
    periodicite: 'annuelle',
    moisDebut: 8,
    description: "Mise à jour des tarifs et ventilations en vue de la rentrée. Vote au CA en septembre.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },
  {
    id: 'aou-opale-rentree',
    titre: "Paramétrage Op@le pour la nouvelle année scolaire",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 8,
    description: "Paramétrages Op@le rentrée : exercices, tiers, signataires, habilitations.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'aou-delegations-signature',
    titre: "Vérification des délégations de signature (rentrée)",
    categorie: 'Pilotage / Conseil AC',
    periodicite: 'annuelle',
    moisDebut: 8,
    reference: 'arrêté 25 juillet 2013',
    description: "Vérification et renouvellement des délégations de signature avant la rentrée.",
    responsable: 'AC',
    criticite: 'haute',
  },

  // SEPTEMBRE — additions
  {
    id: 'sep-deliberation-fonds-sociaux',
    titre: "Délibération CA — modalités d'attribution des fonds sociaux (OBLIGATOIRE)",
    categorie: 'Contrôle interne',
    periodicite: 'annuelle',
    moisDebut: 9,
    reference: 'Code éducation + M9-6 — Circ. 2017-122',
    description: "Délibération obligatoire du CA sur les modalités d'attribution des fonds sociaux. Sans cette délibération, l'agent comptable ne peut valablement payer les aides.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'sep-vote-tarifs-dp',
    titre: "Vote des tarifs de la DP et de l'hébergement",
    categorie: 'Restauration / SRH',
    periodicite: 'annuelle',
    moisDebut: 9,
    reference: 'Code éducation R. 531-52',
    description: "Vote en CA des tarifs annuels de demi-pension et hébergement pour l'année scolaire en cours.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'sep-renouvellement-regies',
    titre: "Renouvellement des régies (arrêtés, IR)",
    categorie: 'Régies',
    periodicite: 'annuelle',
    moisDebut: 9,
    reference: 'décret 2019-798 ; Ord. 2022-408',
    description: "Renouvellement des arrêtés constitutifs et actes de nomination des régisseurs, vérification du versement de l'indemnité de responsabilité (IR) — le cautionnement est supprimé depuis le 1er janvier 2023 (Ord. 2022-408 + Décret 2022-1605).",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'sep-droits-dp',
    titre: "Constat des droits de demi-pension (transfert GFE → Op@le)",
    categorie: 'Restauration / SRH',
    periodicite: 'trimestrielle',
    moisDebut: 9,
    description: "Constat des droits de demi-pension, vérification des transferts GFE/SIECLE → Op@le.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },

  // OCTOBRE — additions
  {
    id: 'oct-prep-budget-n1',
    titre: "Préparation du budget primitif N+1",
    categorie: 'Budget',
    periodicite: 'annuelle',
    moisDebut: 10,
    description: "Préparation du budget primitif N+1 en vue du vote en novembre.",
    responsable: 'AC+ER',
    criticite: 'haute',
  },
  {
    id: 'oct-bilan-bourses-t1',
    titre: "Bilan des bourses (1ᵉʳ trimestre)",
    categorie: 'Bourses',
    periodicite: 'trimestrielle',
    moisDebut: 10,
    description: "Bilan post-liquidation du 1ᵉʳ trimestre des bourses.",
    responsable: 'ER',
    criticite: 'moyenne',
  },

  // NOVEMBRE — additions
  {
    id: 'nov-vote-budget',
    titre: "Vote du budget primitif N+1 en CA",
    categorie: 'Budget',
    periodicite: 'annuelle',
    moisDebut: 11,
    reference: 'art. R. 421-58 Code éducation',
    description: "Vote du budget primitif au CA dans les 30 jours après notification de la subvention.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'nov-transmission-budget',
    titre: "Transmission du budget aux autorités de contrôle",
    categorie: 'Budget',
    periodicite: 'annuelle',
    moisDebut: 11,
    description: "Transmission du budget voté au rectorat et à la collectivité de rattachement.",
    responsable: 'ER',
    criticite: 'haute',
  },
  {
    id: 'nov-engagements-report',
    titre: "Recensement des engagements à reporter",
    categorie: 'Compte financier',
    periodicite: 'annuelle',
    moisDebut: 11,
    description: "Identification des engagements juridiques à reporter sur l'exercice suivant.",
    responsable: 'AC+ER',
    criticite: 'moyenne',
  },
  {
    id: 'nov-inventaire-stocks',
    titre: "Inventaire des stocks denrées et fournitures",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 11,
    description: "Inventaire physique des stocks de denrées et fournitures avant clôture.",
    responsable: 'ER',
    criticite: 'haute',
  },

  // DÉCEMBRE — additions
  {
    id: 'dec-apurement-attente',
    titre: "Apurement des comptes d'attente (C/47, C/46)",
    categorie: 'Cloture / Inventaire',
    periodicite: 'annuelle',
    moisDebut: 12,
    reference: 'M9-6',
    description: "Apurement obligatoire des comptes d'attente (471, 472, 473, 486, 487) avant clôture.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'dec-rappro-bancaire-final',
    titre: "Dernier rapprochement bancaire de l'année",
    categorie: 'Contrôle interne',
    periodicite: 'annuelle',
    moisDebut: 12,
    description: "Rapprochement bancaire formalisé du 31/12 — pré-requis du compte financier.",
    responsable: 'AC',
    criticite: 'haute',
  },
  {
    id: 'dec-pv-caisse-3112',
    titre: "PV de caisse au 31/12",
    categorie: 'Régies',
    periodicite: 'annuelle',
    moisDebut: 12,
    reference: 'décret 2019-798',
    description: "Procès-verbal de caisse du 31/12 pour chaque régie de recettes et d'avances.",
    responsable: 'AC',
    criticite: 'haute',
  },
];

export const CATEGORIES_COULEURS: Record<Categorie, string> = {
  'Cloture / Inventaire': 'bg-red-100 text-red-900 border-red-300',
  'Compte financier': 'bg-orange-100 text-orange-900 border-orange-300',
  'Bourses': 'bg-amber-100 text-amber-900 border-amber-300',
  'Voyages scolaires': 'bg-sky-100 text-sky-900 border-sky-300',
  'Budget': 'bg-emerald-100 text-emerald-900 border-emerald-300',
  'Régies': 'bg-violet-100 text-violet-900 border-violet-300',
  'Contrôle interne': 'bg-indigo-100 text-indigo-900 border-indigo-300',
  'Audit ER': 'bg-rose-100 text-rose-900 border-rose-300',
  'Pilotage / Conseil AC': 'bg-slate-100 text-slate-900 border-slate-300',
  'Restauration / SRH': 'bg-lime-100 text-lime-900 border-lime-300',
  'Recouvrement': 'bg-yellow-100 text-yellow-900 border-yellow-300',
  'Marchés / Achats': 'bg-teal-100 text-teal-900 border-teal-300',
  'Ressources': 'bg-stone-100 text-stone-900 border-stone-300',
};

export const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const MOIS_NOMS_COURT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

```

### FICHIER : src/lib/calendrier-export-portrait.ts

```ts
// PDF Portrait — 1 mois par page (version détaillée pour diffusion aux ER)
// PDF Paysage annuel — vue affiche 1-2 pages (vue synthétique sur l'année)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MOIS_NOMS, CATEGORIES_COULEURS } from './calendrier-activites';
import type { ActiviteCalendrier } from './calendrier-types';
import type { Etablissement } from './types';

interface ExportPortraitContext {
  activites: ActiviteCalendrier[];
  etablissements: Etablissement[];
  agenceComptable?: Etablissement;
  exercice: string;
  agentComptable: string;
  /** Message personnalisable de l'AC en en-tête */
  messageAC?: string;
}

function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  return m >= debut || m <= fin;
}

// Couleurs catégories en RGB pour jsPDF
const CAT_RGB: Record<string, [number, number, number]> = {
  'Cloture / Inventaire': [254, 226, 226],
  'Compte financier': [219, 234, 254],
  'Bourses': [254, 243, 199],
  'Voyages scolaires': [233, 213, 255],
  'Budget': [187, 247, 208],
  'Régies': [254, 215, 170],
  'Contrôle interne': [186, 230, 253],
  'Audit ER': [254, 205, 211],
  'Pilotage / Conseil AC': [226, 232, 240],
  'Restauration / SRH': [217, 249, 157],
  'Recouvrement': [253, 230, 138],
  'Marchés / Achats': [153, 246, 228],
  'Ressources': [231, 229, 228],
};

function critLabel(c: ActiviteCalendrier['criticite']): string {
  return c === 'haute' ? '🔴 OBLIGATOIRE' : c === 'moyenne' ? '🟡 RECOMMANDÉ' : '🔵 OPTIONNEL';
}

// ─── PDF Portrait : 1 mois par page ─────────────────────────────────
export function exportCalendrierPDFPortrait(ctx: ExportPortraitContext) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Page de garde
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('Calendrier annuel', w / 2, 50, { align: 'center' });
  pdf.text("des opérations comptables", w / 2, 60, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text(`Exercice ${ctx.exercice}`, w / 2, 75, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Agence comptable : ${ctx.agenceComptable?.nom || '—'}`, w / 2, 100, { align: 'center' });
  if (ctx.agenceComptable?.uai) pdf.text(`(UAI : ${ctx.agenceComptable.uai})`, w / 2, 107, { align: 'center' });
  pdf.text(`Agent comptable : ${ctx.agentComptable || '—'}`, w / 2, 117, { align: 'center' });

  if (ctx.messageAC) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    const msgLines = pdf.splitTextToSize(ctx.messageAC, w - 40);
    pdf.text(msgLines, w / 2, 145, { align: 'center' });
  }

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(120);
  const avert = "Important : le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir correctement le groupement dans les délais réglementaires. Une coordination rigoureuse entre l'AC et les SG des ER est indispensable.";
  const avertLines = pdf.splitTextToSize(avert, w - 30);
  pdf.text(avertLines, 15, h - 50);
  pdf.setTextColor(0);

  // Une page par mois
  for (let m = 1; m <= 12; m++) {
    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => {
        const ca = a.criticite === 'haute' ? 0 : a.criticite === 'moyenne' ? 1 : 2;
        const cb = b.criticite === 'haute' ? 0 : b.criticite === 'moyenne' ? 1 : 2;
        return ca - cb || a.titre.localeCompare(b.titre);
      });
    if (items.length === 0) continue;

    pdf.addPage();

    // Bandeau mois
    pdf.setFillColor(43, 76, 140);
    pdf.rect(0, 0, w, 22, 'F');
    pdf.setTextColor(255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(MOIS_NOMS[m - 1].toUpperCase(), 15, 15);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${items.length} opération${items.length > 1 ? 's' : ''} à réaliser — Exercice ${ctx.exercice}`, w - 15, 15, { align: 'right' });
    pdf.setTextColor(0);

    // Liste détaillée
    let y = 32;
    pdf.setFontSize(10);
    items.forEach((a, idx) => {
      // Saut de page si plus de place
      if (y > h - 35) {
        pdf.addPage();
        y = 20;
      }

      // Bandeau catégorie
      const rgb = CAT_RGB[a.categorie] || [240, 240, 240];
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.rect(15, y - 4, w - 30, 6, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(`${a.categorie}  •  ${critLabel(a.criticite)}  •  Resp. : ${a.responsable}`, 17, y);
      y += 5;

      // Titre
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      const titreLines = pdf.splitTextToSize(`${idx + 1}. ${a.titre}`, w - 32);
      pdf.text(titreLines, 17, y);
      y += titreLines.length * 4.5;

      // Échéance + ER concernés
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      const echeance = a.dateEcheance
        ? new Date(a.dateEcheance).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'À programmer';
      pdf.text(`📅 Échéance : ${echeance}`, 17, y);
      y += 4;
      const erTxt = a.tousEtablissements
        ? `Tous les ER (${ctx.etablissements.length})`
        : a.etablissementsIds
            .map(id => ctx.etablissements.find(e => e.id === id)?.nom)
            .filter(Boolean)
            .join(', ') || '—';
      const erLines = pdf.splitTextToSize(`🏫 Établissement(s) : ${erTxt}`, w - 32);
      pdf.text(erLines, 17, y);
      y += erLines.length * 4;

      // Description
      if (a.description) {
        const descLines = pdf.splitTextToSize(a.description, w - 32);
        pdf.text(descLines, 17, y);
        y += descLines.length * 4;
      }

      // Référence
      if (a.reference) {
        pdf.setTextColor(43, 76, 140);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`📖 ${a.reference}`, 17, y);
        pdf.setTextColor(0);
        y += 4;
      }

      y += 4;

      // Trait séparateur
      pdf.setDrawColor(220);
      pdf.line(15, y - 2, w - 15, y - 2);
      pdf.setDrawColor(0);
    });
  }

  // Pied de page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(150);
    pdf.text(
      `${ctx.agenceComptable?.nom || ''} — Calendrier annuel ${ctx.exercice} — Page ${i}/${pageCount}`,
      w / 2, h - 8, { align: 'center' }
    );
    pdf.setTextColor(0);
  }

  pdf.save(`calendrier-portrait-${ctx.exercice}.pdf`);
}

// ─── PDF Paysage annuel — vue affiche synthétique ───────────────────
export function exportCalendrierPDFPaysageAffiche(ctx: ExportPortraitContext) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Bandeau
  pdf.setFillColor(43, 76, 140);
  pdf.rect(0, 0, w, 18, 'F');
  pdf.setTextColor(255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(`📅 Calendrier annuel des opérations comptables — Exercice ${ctx.exercice}`, w / 2, 8, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `${ctx.agenceComptable?.nom || ''}${ctx.agenceComptable?.uai ? ' (' + ctx.agenceComptable.uai + ')' : ''}  •  Agent comptable : ${ctx.agentComptable || '—'}`,
    w / 2, 14, { align: 'center' }
  );
  pdf.setTextColor(0);

  // Grille 4 colonnes × 3 lignes (12 mois)
  const startY = 22;
  const cellW = (w - 16) / 4;
  const cellH = (h - startY - 8) / 3;
  for (let m = 1; m <= 12; m++) {
    const col = (m - 1) % 4;
    const row = Math.floor((m - 1) / 4);
    const x = 8 + col * cellW;
    const y = startY + row * cellH;

    // Fond mois
    pdf.setFillColor(248, 250, 252);
    pdf.rect(x, y, cellW - 2, cellH - 2, 'F');
    pdf.setDrawColor(43, 76, 140);
    pdf.setLineWidth(0.4);
    pdf.rect(x, y, cellW - 2, cellH - 2, 'S');
    pdf.setLineWidth(0.2);

    // Titre mois
    pdf.setFillColor(43, 76, 140);
    pdf.rect(x, y, cellW - 2, 6, 'F');
    pdf.setTextColor(255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(MOIS_NOMS[m - 1].toUpperCase(), x + 2, y + 4.3);
    pdf.setTextColor(0);

    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => {
        const ca = a.criticite === 'haute' ? 0 : a.criticite === 'moyenne' ? 1 : 2;
        const cb = b.criticite === 'haute' ? 0 : b.criticite === 'moyenne' ? 1 : 2;
        return ca - cb;
      });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    let cy = y + 9;
    const maxY = y + cellH - 4;
    let truncated = false;
    items.forEach(a => {
      if (cy >= maxY - 2) { truncated = true; return; }
      const dot = a.criticite === 'haute' ? '●' : a.criticite === 'moyenne' ? '◆' : '○';
      const txt = `${dot} ${a.titre}`;
      const lines = pdf.splitTextToSize(txt, cellW - 6);
      const linesToShow = lines.slice(0, Math.max(1, Math.floor((maxY - cy) / 2.4)));
      if (a.criticite === 'haute') pdf.setTextColor(185, 28, 28);
      else if (a.criticite === 'moyenne') pdf.setTextColor(180, 83, 9);
      else pdf.setTextColor(30, 64, 175);
      pdf.text(linesToShow, x + 2, cy);
      pdf.setTextColor(0);
      cy += linesToShow.length * 2.4 + 0.6;
    });
    if (truncated) {
      pdf.setTextColor(120);
      pdf.setFontSize(6);
      pdf.text(`+ autres opérations…`, x + 2, maxY);
      pdf.setTextColor(0);
    }
  }

  // Légende
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Légende :', 8, h - 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(185, 28, 28);
  pdf.text('● Obligatoire réglementaire', 25, h - 4);
  pdf.setTextColor(180, 83, 9);
  pdf.text('◆ Recommandé', 70, h - 4);
  pdf.setTextColor(30, 64, 175);
  pdf.text('○ Optionnel', 100, h - 4);
  pdf.setTextColor(120);
  pdf.text(`Sources : GBCP 2012-1246, M9.6, Code éducation R.421-64+`, w - 8, h - 4, { align: 'right' });
  pdf.setTextColor(0);

  pdf.save(`calendrier-affiche-${ctx.exercice}.pdf`);
}

// ─── Mailto multi-destinataires (ouvre client mail par défaut) ──────
export function buildMailtoLink(opts: {
  recipients: string[];
  subject: string;
  body: string;
}): string {
  const to = encodeURIComponent(opts.recipients.join(','));
  const sub = encodeURIComponent(opts.subject);
  // mailto a une limite ~2000 caractères — on tronque le corps si besoin
  const maxBody = 1500;
  const truncated = opts.body.length > maxBody
    ? opts.body.slice(0, maxBody) + '\n\n[... voir PDF joint pour la version complète ...]'
    : opts.body;
  const body = encodeURIComponent(truncated);
  return `mailto:${to}?subject=${sub}&body=${body}`;
}

```

### FICHIER : src/lib/calendrier-export.ts

```ts
// Export PDF + Word pour le Calendrier annuel de l'agent comptable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, PageOrientation, WidthType, BorderStyle,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import { MOIS_NOMS } from './calendrier-activites';
import type { ActiviteCalendrier } from './calendrier-types';
import type { Etablissement } from './types';

interface ExportContext {
  activites: ActiviteCalendrier[];
  etablissements: Etablissement[];
  agenceComptable?: Etablissement;
  exercice: string;
  agentComptable: string;
}

// ─── PDF (paysage A4) ──────────────────────────────────────────────
export function exportCalendrierPDF(ctx: ExportContext) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  // En-tête
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(`Calendrier annuel des opérations comptables — Exercice ${ctx.exercice}`, pageWidth / 2, 14, { align: 'center' });
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `Agence comptable : ${ctx.agenceComptable?.nom || '—'}${ctx.agenceComptable?.uai ? ' (' + ctx.agenceComptable.uai + ')' : ''}`,
    pageWidth / 2, 20, { align: 'center' }
  );
  pdf.text(`Agent comptable : ${ctx.agentComptable || '—'}`, pageWidth / 2, 25, { align: 'center' });

  // Avertissement
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  const avertissement =
    "Important : le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir correctement le groupement dans les délais réglementaires.";
  const lines = pdf.splitTextToSize(avertissement, pageWidth - 20);
  pdf.text(lines, 10, 31);

  // Tableau récapitulatif par mois
  const monthlyRows: any[] = [];
  for (let m = 1; m <= 12; m++) {
    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => a.titre.localeCompare(b.titre));
    if (items.length === 0) continue;
    items.forEach((a, idx) => {
      const erNoms = a.etablissementsIds
        .map(id => ctx.etablissements.find(e => e.id === id)?.nom)
        .filter(Boolean)
        .join(', ');
      monthlyRows.push([
        idx === 0 ? MOIS_NOMS[m - 1].toUpperCase() : '',
        a.dateEcheance || '',
        a.titre,
        a.categorie,
        a.responsable,
        erNoms || (a.tousEtablissements ? 'Tous les ER' : '—'),
        a.criticite.toUpperCase(),
      ]);
    });
  }

  autoTable(pdf, {
    startY: 40,
    head: [['Mois', 'Échéance', 'Activité', 'Catégorie', 'Resp.', 'Établissement(s)', 'Crit.']],
    body: monthlyRows,
    styles: { fontSize: 7.5, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: [43, 76, 140], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 22 },
      2: { cellWidth: 95 },
      3: { cellWidth: 35 },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 60 },
      6: { cellWidth: 18, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const v = String(data.cell.raw);
        if (v === 'HAUTE') data.cell.styles.fillColor = [254, 226, 226];
        else if (v === 'MOYENNE') data.cell.styles.fillColor = [254, 243, 199];
        else if (v === 'INFO') data.cell.styles.fillColor = [219, 234, 254];
      }
    },
    margin: { left: 8, right: 8 },
  });

  pdf.save(`calendrier-annuel-AC-${ctx.exercice}.pdf`);
}

// ─── Word DOCX (paysage A4) ────────────────────────────────────────
export async function exportCalendrierDOCX(ctx: ExportContext) {
  const headerCell = (text: string, width: number) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: '2B4C8C', type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 16 })],
    })],
  });

  const bodyCell = (text: string, width: number, opts?: { bold?: boolean; fill?: string; align?: typeof AlignmentType[keyof typeof AlignmentType] }) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts?.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: opts?.align || AlignmentType.LEFT,
      children: [new TextRun({ text: text || '—', bold: opts?.bold, size: 14 })],
    })],
  });

  const widths = [1500, 1500, 6500, 2500, 1100, 4000, 1100]; // sum = 18200
  const totalWidth = widths.reduce((a, b) => a + b, 0);

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Mois', widths[0]),
      headerCell('Échéance', widths[1]),
      headerCell('Activité', widths[2]),
      headerCell('Catégorie', widths[3]),
      headerCell('Resp.', widths[4]),
      headerCell('Établissement(s)', widths[5]),
      headerCell('Crit.', widths[6]),
    ],
  });

  const rows: TableRow[] = [headerRow];
  for (let m = 1; m <= 12; m++) {
    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => a.titre.localeCompare(b.titre));
    if (items.length === 0) continue;
    items.forEach((a, idx) => {
      const erNoms = a.etablissementsIds
        .map(id => ctx.etablissements.find(e => e.id === id)?.nom)
        .filter(Boolean)
        .join(', ');
      const crit = a.criticite.toUpperCase();
      const fill = crit === 'HAUTE' ? 'FEE2E2' : crit === 'MOYENNE' ? 'FEF3C7' : 'DBEAFE';
      rows.push(new TableRow({
        children: [
          bodyCell(idx === 0 ? MOIS_NOMS[m - 1].toUpperCase() : '', widths[0], { bold: true, fill: 'F1F5F9' }),
          bodyCell(a.dateEcheance || '', widths[1]),
          bodyCell(a.titre, widths[2]),
          bodyCell(a.categorie, widths[3]),
          bodyCell(a.responsable, widths[4], { align: AlignmentType.CENTER }),
          bodyCell(erNoms || (a.tousEtablissements ? 'Tous les ER' : '—'), widths[5]),
          bodyCell(crit, widths[6], { fill, align: AlignmentType.CENTER, bold: true }),
        ],
      }));
    });
  }

  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
  const table = new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map(r => r),
    borders: {
      top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder,
      insideHorizontal: cellBorder, insideVertical: cellBorder,
    },
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906,
            height: 16838,
            orientation: PageOrientation.LANDSCAPE,
          },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: `Calendrier annuel des opérations comptables — Exercice ${ctx.exercice}`,
            bold: true, size: 28,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: `Agence comptable : ${ctx.agenceComptable?.nom || '—'}${ctx.agenceComptable?.uai ? ' (' + ctx.agenceComptable.uai + ')' : ''}`,
            size: 22,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Agent comptable : ${ctx.agentComptable || '—'}`, size: 22 })],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: "Important : le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir correctement le groupement dans les délais réglementaires.",
            italics: true, size: 18, color: '991B1B',
          })],
          spacing: { after: 240 },
        }),
        table,
        new Paragraph({
          children: [new TextRun({
            text: "Sources : décret n° 2012-1246 (GBCP), art. R. 421-64 et s. Code éducation, M9.6, circ. n° 2011-117 du 03/08/2011, guides DAF A3 / IH2EF, vade-mecum de l'adjoint gestionnaire.",
            italics: true, size: 16, color: '64748B',
          })],
          spacing: { before: 240 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `calendrier-annuel-AC-${ctx.exercice}.docx`);
}

// ─── Helper ─────────────────────────────────────────────────────────
function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  // Plage qui traverse l'année (ex: sept à juin)
  return m >= debut || m <= fin;
}

```

### FICHIER : src/lib/calendrier-mail.ts

```ts
// Génération d'un fichier .eml (RFC 822) — rappel mensuel aux SG des ER
// + détection des activités du mois courant et des activités en retard.
import { saveAs } from 'file-saver';
import { MOIS_NOMS } from './calendrier-activites';
import type { ActiviteCalendrier } from './calendrier-types';
import type { Etablissement } from './types';

export interface MailContext {
  activites: ActiviteCalendrier[];
  etablissements: Etablissement[]; // ER (sans agence comptable)
  agenceComptable?: Etablissement;
  exercice: string;
  agentComptable: string;
  /** Mois cible (1-12). Défaut : mois courant */
  moisCible?: number;
}

export interface ActivitesGroupees {
  duMois: ActiviteCalendrier[];
  enRetard: ActiviteCalendrier[];
}

// Une activité est "du mois" si son moisDebut..moisFin couvre le mois cible
// ET (pas de date d'échéance OU échéance dans ce mois).
function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  return m >= debut || m <= fin;
}

export function getActivitesGroupees(
  activites: ActiviteCalendrier[],
  moisCible: number,
  refDate: Date = new Date(),
): ActivitesGroupees {
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  const duMois = activites.filter(a => {
    if (a.realisee) return false;
    if (!isInMonth(a, moisCible)) return false;
    if (a.dateEcheance) {
      const d = new Date(a.dateEcheance);
      // Garder si l'échéance est dans le mois cible
      return d.getMonth() + 1 === moisCible;
    }
    return true;
  });

  const enRetard = activites.filter(a => {
    if (a.realisee) return false;
    if (!a.dateEcheance) return false;
    const d = new Date(a.dateEcheance);
    return d < today && d.getMonth() + 1 !== moisCible;
  });

  return { duMois, enRetard };
}

function critEmoji(c: ActiviteCalendrier['criticite']): string {
  return c === 'haute' ? '🔴' : c === 'moyenne' ? '🟡' : '🔵';
}

function formatActivite(a: ActiviteCalendrier, etabs: Etablissement[]): string {
  const echeance = a.dateEcheance
    ? new Date(a.dateEcheance).toLocaleDateString('fr-FR')
    : '—';
  const erNoms = a.tousEtablissements
    ? `Tous les ER (${etabs.length})`
    : a.etablissementsIds
        .map(id => etabs.find(e => e.id === id)?.nom)
        .filter(Boolean)
        .join(', ') || '—';
  return [
    `${critEmoji(a.criticite)} ${a.titre}`,
    `   • Échéance : ${echeance}`,
    `   • Catégorie : ${a.categorie}`,
    `   • Responsable : ${a.responsable}`,
    `   • Établissement(s) : ${erNoms}`,
    a.reference ? `   • Référence : ${a.reference}` : null,
    a.description ? `   • ${a.description}` : null,
  ].filter(Boolean).join('\n');
}

export function buildMailBody(ctx: MailContext): { subject: string; body: string; recipients: string[] } {
  const mois = ctx.moisCible ?? (new Date().getMonth() + 1);
  const moisNom = MOIS_NOMS[mois - 1];
  const { duMois, enRetard } = getActivitesGroupees(ctx.activites, mois);

  const subject = `[Agence comptable] Rappel ${moisNom} ${ctx.exercice} — opérations à réaliser`;

  const recipients = ctx.etablissements
    .map(e => e.email)
    .filter((e): e is string => !!e && e.trim().length > 0);

  const lines: string[] = [];
  lines.push(`Mesdames et Messieurs les Secrétaires généraux,`);
  lines.push('');
  lines.push(
    `Dans le cadre du calendrier annuel des opérations comptables de l'agence comptable ` +
    `« ${ctx.agenceComptable?.nom || ''} » (exercice ${ctx.exercice}), ` +
    `vous trouverez ci-dessous les opérations à réaliser au cours du mois de ${moisNom}.`
  );
  lines.push('');
  lines.push(
    `IMPORTANT : le non-respect de ce calendrier met l'agent comptable en difficulté ` +
    `et l'empêche de servir correctement le groupement dans les délais réglementaires. ` +
    `Une coordination rigoureuse est indispensable pour garantir la régularité comptable, ` +
    `la sécurité des fonds et la bonne information de tous.`
  );
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`📅 OPÉRATIONS DU MOIS DE ${moisNom.toUpperCase()} (${duMois.length})`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  if (duMois.length === 0) {
    lines.push('Aucune opération à réaliser ce mois-ci.');
  } else {
    duMois.forEach((a, i) => {
      lines.push(`${i + 1}. ${formatActivite(a, ctx.etablissements)}`);
      lines.push('');
    });
  }

  if (enRetard.length > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`⚠️  OPÉRATIONS EN RETARD (${enRetard.length})`);
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push("Les opérations suivantes étaient échues et n'ont pas été marquées comme réalisées :");
    lines.push('');
    enRetard.forEach((a, i) => {
      lines.push(`${i + 1}. ${formatActivite(a, ctx.etablissements)}`);
      lines.push('');
    });
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(
    `Sources : décret n° 2012-1246 (GBCP), art. R. 421-64 et s. Code de l'éducation, ` +
    `M9.6, circulaire n° 2011-117 du 03/08/2011, guides DAF A3 / IH2EF, ` +
    `vade-mecum de l'adjoint gestionnaire.`
  );
  lines.push('');
  lines.push(`Cordialement,`);
  lines.push(ctx.agentComptable || `L'agent comptable`);
  lines.push(ctx.agenceComptable?.nom || '');

  return { subject, body: lines.join('\n'), recipients };
}

// Encodage MIME quoted-printable basique pour préserver les accents UTF-8
function encodeQuotedPrintable(input: string): string {
  const utf8 = unescape(encodeURIComponent(input));
  let out = '';
  let lineLen = 0;
  for (let i = 0; i < utf8.length; i++) {
    const c = utf8.charCodeAt(i);
    let chunk: string;
    if (c === 0x3D) chunk = '=3D';
    else if (c === 0x0A) { out += '\r\n'; lineLen = 0; continue; }
    else if (c === 0x0D) continue;
    else if ((c >= 0x20 && c <= 0x7E) || c === 0x09) chunk = utf8[i];
    else chunk = '=' + c.toString(16).toUpperCase().padStart(2, '0');

    if (lineLen + chunk.length > 75) {
      out += '=\r\n';
      lineLen = 0;
    }
    out += chunk;
    lineLen += chunk.length;
  }
  return out;
}

function encodeMimeHeader(value: string): string {
  // RFC 2047 encoded-word (UTF-8, base64) si caractères non-ASCII
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  const utf8 = unescape(encodeURIComponent(value));
  // btoa accepte Latin-1, on lui passe l'UTF-8 escapé
  let bin = '';
  for (let i = 0; i < utf8.length; i++) bin += utf8[i];
  const b64 = btoa(bin);
  return `=?UTF-8?B?${b64}?=`;
}

export function downloadEmlFile(ctx: MailContext): void {
  const { subject, body, recipients } = buildMailBody(ctx);
  const date = new Date().toUTCString();
  const from = `"${encodeMimeHeader(ctx.agentComptable || 'Agence comptable')}" <agence.comptable@example.fr>`;
  const to = recipients.length > 0 ? recipients.join(', ') : 'sg.etablissement@example.fr';

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeMimeHeader(subject)}`,
    `Date: ${date}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    `X-Unsent: 1`,
  ].join('\r\n');

  const eml = `${headers}\r\n\r\n${encodeQuotedPrintable(body)}`;
  const blob = new Blob([eml], { type: 'message/rfc822;charset=utf-8' });
  const moisNom = MOIS_NOMS[(ctx.moisCible ?? new Date().getMonth() + 1) - 1];
  saveAs(blob, `rappel-${moisNom}-${ctx.exercice}.eml`);
}

// Calcul global pour le widget Dashboard
export interface AlertesAC {
  duMois: ActiviteCalendrier[];
  proches7j: ActiviteCalendrier[]; // échéance dans <= 7 jours
  enRetard: ActiviteCalendrier[];
  total: number; // pour le badge sidebar (proches + retard)
}

export function getAlertesAC(activites: ActiviteCalendrier[], refDate: Date = new Date()): AlertesAC {
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);
  const mois = today.getMonth() + 1;

  const { duMois, enRetard } = getActivitesGroupees(activites, mois, refDate);

  const proches7j = activites.filter(a => {
    if (a.realisee || !a.dateEcheance) return false;
    const d = new Date(a.dateEcheance);
    return d >= today && d <= in7;
  });

  return {
    duMois,
    proches7j,
    enRetard,
    total: proches7j.length + enRetard.length,
  };
}

```

### FICHIER : src/lib/calendrier-types.ts

```ts
import type { Periodicite, Categorie } from './calendrier-activites';

export interface ActiviteCalendrier {
  id: string;
  modeleId?: string; // référence à ACTIVITES_MODELES si dérivée
  titre: string;
  categorie: Categorie;
  periodicite: Periodicite;
  moisDebut: number;
  moisFin?: number;
  description: string;
  reference?: string;
  responsable: 'AC' | 'ER' | 'AC+ER';
  criticite: 'haute' | 'moyenne' | 'info';
  /** Date d'échéance personnalisable au format YYYY-MM-DD */
  dateEcheance?: string;
  /** IDs des établissements rattachés concernés (vide si tousEtablissements) */
  etablissementsIds: string[];
  /** Si vrai : tous les établissements du groupement */
  tousEtablissements: boolean;
  /** Notes libres */
  notes?: string;
  /** Suivi de réalisation */
  realisee?: boolean;
  realiseeAt?: string; // ISO datetime
  realiseePar?: string; // nom de l'utilisateur
}

```

### FICHIER : src/lib/cockpit-aggregator.ts

```ts
/**
 * Cockpit Aggregator — Moteur d'agrégation centralisé pour le Tableau de Bord intelligent.
 *
 * Scanne tous les modules (calendrier, vérifications, régies, stocks, voyages, marchés,
 * recouvrement, cartographie, BA…) et remonte les alertes typées par criticité + deadline.
 *
 * Conforme aux référentiels : M9-6, GBCP (décret 2012-1246), Code éducation (R.421-*),
 * Code commande publique (seuils 2026), décret régies 2019-798, RGP (ord. 2022-408).
 */
import { loadState } from './store';
import { getModules } from './audit-modules';
import type { ActiviteCalendrier } from './calendrier-types';
import type { CartoRisque, BudgetAnnexe, CreanceItem } from './types';

export type AlerteSeverity = 'critique' | 'majeur' | 'moyen' | 'info';

export interface CockpitAlerte {
  id: string;
  titre: string;
  description?: string;
  severity: AlerteSeverity;
  source: string;          // ex : "Calendrier", "Régies", "Cartographie"
  reference?: string;      // ex : "M9-6 § 3.2"
  modulePath?: string;     // pour le bouton "Voir"
  deadline?: string;       // ISO date si applicable
  joursRestants?: number;  // < 0 = en retard
  etablissementId?: string;
  metric?: string;         // libre — ex : "Score 60", "+450 €"
}

export interface CockpitSummary {
  scoreConformite: number;      // 0-100
  scoreLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  totalAlertes: number;
  critiques: CockpitAlerte[];
  majeurs: CockpitAlerte[];
  moyens: CockpitAlerte[];
  info: CockpitAlerte[];
  topActions: CockpitAlerte[]; // 3 actions prioritaires
  parModule: Record<string, number>; // moduleId → nb alertes
  derniereMaj: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────
function joursEntre(iso: string): number {
  const target = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function severityRank(s: AlerteSeverity): number {
  return { critique: 0, majeur: 1, moyen: 2, info: 3 }[s];
}

// ─── Collecteurs par domaine ─────────────────────────────────────────

function fromCalendrier(): CockpitAlerte[] {
  const acts = loadState<ActiviteCalendrier[]>('calendrier_annuel_v1', []);
  const out: CockpitAlerte[] = [];
  acts.forEach(a => {
    if (a.realisee || !a.dateEcheance) return;
    const j = joursEntre(a.dateEcheance);
    if (j < 0) {
      out.push({
        id: `cal-${a.id}`,
        titre: a.titre,
        description: `Échéance dépassée de ${Math.abs(j)} j (${a.categorie})`,
        severity: a.criticite === 'haute' ? 'critique' : 'majeur',
        source: 'Calendrier annuel AC',
        reference: a.reference,
        modulePath: '/calendrier-annuel',
        deadline: a.dateEcheance,
        joursRestants: j,
      });
    } else if (j <= 7) {
      out.push({
        id: `cal-${a.id}`,
        titre: a.titre,
        description: `Échéance dans ${j} j (${a.categorie})`,
        severity: a.criticite === 'haute' ? 'majeur' : 'moyen',
        source: 'Calendrier annuel AC',
        reference: a.reference,
        modulePath: '/calendrier-annuel',
        deadline: a.dateEcheance,
        joursRestants: j,
      });
    } else if (j <= 30 && a.criticite === 'haute') {
      out.push({
        id: `cal-${a.id}`,
        titre: a.titre,
        description: `Échéance dans ${j} j (haute criticité)`,
        severity: 'moyen',
        source: 'Calendrier annuel AC',
        reference: a.reference,
        modulePath: '/calendrier-annuel',
        deadline: a.dateEcheance,
        joursRestants: j,
      });
    }
  });
  return out;
}

function fromCartographie(): CockpitAlerte[] {
  const risques = loadState<CartoRisque[]>('cartographie', []);
  return risques
    .filter(r => r.probabilite * r.impact * r.maitrise >= 40)
    .sort((a, b) => (b.probabilite * b.impact * b.maitrise) - (a.probabilite * a.impact * a.maitrise))
    .slice(0, 10)
    .map(r => {
      const score = r.probabilite * r.impact * r.maitrise;
      return {
        id: `risk-${r.id}`,
        titre: r.risque,
        description: `${r.processus} — score ${score} — Action : ${r.action || 'à définir'}`,
        severity: score >= 64 ? 'critique' : 'majeur',
        source: 'Cartographie des risques',
        reference: 'P × I × M ≥ 40',
        modulePath: '/cartographie',
        metric: `Score ${score}`,
      } as CockpitAlerte;
    });
}

function fromVerificationQuotidienne(): CockpitAlerte[] {
  const checks = loadState<Record<string, boolean>>('verification_checks', {});
  const out: CockpitAlerte[] = [];
  // Critiques absolues : caisse, rapprochement, comptes d'attente, séparation tâches
  const CRITIQUES = [
    { id: 'vq1', label: 'Caisse AC non comptée', ref: 'M9-6 § 3.2.1' },
    { id: 'vq3', label: 'Rapprochement bancaire en retard', ref: 'M9-6 § 3.1.3' },
    { id: 'vq8', label: "Comptes d'attente 47x non soldés", ref: 'M9-6 § 2.4' },
    { id: 'vq11', label: 'Compte 515 non rapproché DFT', ref: 'M9-6 § 3.1' },
    { id: 'vq24', label: 'Séparation des tâches non vérifiée', ref: 'Art. 9 GBCP' },
  ];
  CRITIQUES.forEach(c => {
    if (!checks[c.id]) {
      out.push({
        id: `verif-${c.id}`,
        titre: c.label,
        severity: 'critique',
        source: 'Vérification quotidienne',
        reference: c.ref,
        modulePath: '/verification',
      });
    }
  });
  return out;
}

function fromRegies(): CockpitAlerte[] {
  const ctrl = loadState<any[]>('ctrl_caisse', []);
  const nomination = loadState<any>('regies_nomination', {});
  const acte = loadState<any>('regies_acte_constitutif', {});
  const out: CockpitAlerte[] = [];

  ctrl.forEach((c, i) => {
    if (c.ecart && c.ecart !== 0) {
      out.push({
        id: `regie-ecart-${i}`,
        titre: `Écart de caisse ${c.regisseur || ''}`,
        description: `${c.date} — Théorique ${c.theorique}€ / Réel ${c.reel}€ / Écart ${c.ecart}€`,
        severity: Math.abs(c.ecart) > 10 ? 'critique' : 'majeur',
        source: 'Régies',
        reference: 'Décret 2019-798 — M9-6 § 3.2',
        modulePath: '/regies',
        metric: `${c.ecart > 0 ? '+' : ''}${c.ecart} €`,
      });
    }
  });

  // Cautionnement supprimé par Ord. 2022-408 + Décret 2022-1605 (au 1er janvier 2023).
  // Contrôle remplacé par : indemnité de responsabilité (IR) due si plafond > 1 220 €.
  if (nomination?.plafondEncaisse > 1220 && !nomination?.indemniteResponsabilite) {
    out.push({
      id: 'regie-ir',
      titre: 'Indemnité de responsabilité régisseur non versée (plafond > 1 220 €)',
      severity: 'majeur',
      source: 'Régies',
      reference: 'Arrêté 28/05/1993 modifié — Ord. 2022-408 (RGP)',
      modulePath: '/regies',
    });
  }
  if (!acte?.referenceArrete) {
    out.push({
      id: 'regie-acte',
      titre: 'Acte constitutif régie sans référence',
      severity: 'majeur',
      source: 'Régies',
      reference: 'Décret 2019-798 art. 1',
      modulePath: '/regies',
    });
  }
  return out;
}

function fromStocks(): CockpitAlerte[] {
  const stocks = loadState<any[]>('stocks', []);
  return stocks
    .filter(s => s.ecart && s.ecart !== 0)
    .map((s, i) => ({
      id: `stock-${s.id || i}`,
      titre: `Écart stock : ${s.nom}`,
      description: `Théo ${s.theo} / Phys ${s.phys} / Écart ${s.ecart}`,
      severity: Math.abs(s.ecart) > 5 ? 'majeur' : 'moyen',
      source: 'Stocks denrées',
      reference: 'M9-6 inventaire',
      modulePath: '/stocks',
      metric: `${s.ecart > 0 ? '+' : ''}${s.ecart}`,
    } as CockpitAlerte));
}

function fromRapprochement(): CockpitAlerte[] {
  const rappro = loadState<any[]>('rapprochement', []);
  return rappro
    .filter(r => r.ecart && r.ecart !== 0)
    .map((r, i) => ({
      id: `rappro-${i}`,
      titre: `Écart rapprochement bancaire`,
      description: `${r.date} — DFT ${r.dft}€ / Compta ${r.compta}€`,
      severity: 'critique' as AlerteSeverity,
      source: 'Rapprochement bancaire',
      reference: 'M9-6 § 4.3.3',
      modulePath: '/rapprochement',
      metric: `${r.ecart > 0 ? '+' : ''}${r.ecart} €`,
    }));
}

function fromVoyages(): CockpitAlerte[] {
  const voyages = loadState<any[]>('voyages', []);
  const out: CockpitAlerte[] = [];
  voyages.forEach(v => {
    if (!v.acteCA_programmation) {
      out.push({
        id: `voy-prog-${v.id}`,
        titre: `${v.intitule || 'Voyage'} — Acte CA programmation manquant`,
        severity: 'majeur',
        source: 'Voyages scolaires',
        reference: 'Circ. 2011-117',
        modulePath: '/voyages',
      });
    }
    if (!v.acteCA_financement) {
      out.push({
        id: `voy-fin-${v.id}`,
        titre: `${v.intitule || 'Voyage'} — Acte CA financement manquant`,
        severity: 'majeur',
        source: 'Voyages scolaires',
        reference: 'Circ. 2011-117',
        modulePath: '/voyages',
      });
    }
    if (v.montantTotal > 0) {
      const recettes = (v.montantEncaisseFamilles || 0) + (v.notificationCollectivites ? (v.montantNotifie || 0) : 0);
      const couverture = recettes / v.montantTotal;
      if (couverture < 0.5) {
        out.push({
          id: `voy-risk-${v.id}`,
          titre: `${v.intitule || 'Voyage'} — Risque financier élevé`,
          description: `Couverture ${Math.round(couverture * 100)}% (${recettes}€/${v.montantTotal}€)`,
          severity: 'critique',
          source: 'Voyages scolaires',
          reference: 'Gestion prudentielle',
          modulePath: '/voyages',
          metric: `${Math.round(couverture * 100)}%`,
        });
      }
    }
  });
  return out;
}

function fromRecouvrement(): CockpitAlerte[] {
  const creances = loadState<CreanceItem[]>('creances', []);
  const out: CockpitAlerte[] = [];
  const today = Date.now();
  creances.forEach(c => {
    if (!c.echeance) return;
    const ageJours = Math.floor((today - new Date(c.echeance).getTime()) / 86_400_000);
    // Prescription quadriennale (loi 31/12/1968) — 4 ans = 1461 jours
    if (ageJours > 1461) {
      out.push({
        id: `crea-presc-${c.id}`,
        titre: `Créance prescrite : ${c.debiteur}`,
        description: `Échéance ${c.echeance} — Montant ${c.montant}€`,
        severity: 'critique',
        source: 'Recouvrement',
        reference: 'Loi 31/12/1968 — déchéance quadriennale',
        modulePath: '/recouvrement',
        metric: `${c.montant} €`,
      });
    } else if (ageJours > 1095) {
      out.push({
        id: `crea-alerte-${c.id}`,
        titre: `Créance proche prescription : ${c.debiteur}`,
        description: `Prescription dans ${1461 - ageJours} j`,
        severity: 'majeur',
        source: 'Recouvrement',
        reference: 'Loi 31/12/1968',
        modulePath: '/recouvrement',
      });
    } else if (ageJours > 60 && c.relances < 1) {
      out.push({
        id: `crea-relance-${c.id}`,
        titre: `Créance > 2 mois sans relance : ${c.debiteur}`,
        severity: 'majeur',
        source: 'Recouvrement',
        reference: 'RGP — Ord. 2022-408',
        modulePath: '/recouvrement',
      });
    }
  });
  return out;
}

function fromBudgetsAnnexes(): CockpitAlerte[] {
  const ba = loadState<BudgetAnnexe[]>('budgets_annexes', []);
  const out: CockpitAlerte[] = [];
  ba.forEach(b => {
    if (b.compte185 && Math.abs(b.compte185) > 0.01) {
      out.push({
        id: `ba-185-${b.id}`,
        titre: `BA ${b.nom} — compte 185000 non équilibré`,
        description: `Solde ${b.compte185}€ — doit être à 0 (compensation parfaite)`,
        severity: 'critique',
        source: 'Budgets Annexes',
        reference: 'M9-6 Tome 2 § 2.1.2.3.2 — Planche 16',
        modulePath: '/budgets-annexes',
        metric: `${b.compte185} €`,
      });
    }
    if (b.tauxExecution && b.tauxExecution < 50) {
      out.push({
        id: `ba-exec-${b.id}`,
        titre: `BA ${b.nom} — exécution faible`,
        description: `Taux ${b.tauxExecution}% — sous-consommation`,
        severity: 'moyen',
        source: 'Budgets Annexes',
        modulePath: '/budgets-annexes',
        metric: `${b.tauxExecution}%`,
      });
    }
  });
  return out;
}

function fromSubventions(): CockpitAlerte[] {
  const subv = loadState<any[]>('subventions', []);
  const out: CockpitAlerte[] = [];
  subv.forEach(s => {
    if (!s.dateVersement) return;
    const ans = (Date.now() - new Date(s.dateVersement).getTime()) / 31_557_600_000;
    if (ans >= 4) {
      out.push({
        id: `sub-presc-${s.id}`,
        titre: `Subvention ${s.type} — déchéance quadriennale atteinte`,
        description: `Versée le ${s.dateVersement}`,
        severity: 'critique',
        source: 'Subventions',
        reference: 'Loi 31/12/1968',
        modulePath: '/subventions',
      });
    } else if (ans >= 3) {
      out.push({
        id: `sub-alerte-${s.id}`,
        titre: `Subvention ${s.type} — déchéance < 1 an`,
        severity: 'majeur',
        source: 'Subventions',
        reference: 'Loi 31/12/1968',
        modulePath: '/subventions',
      });
    }
  });
  return out;
}

// ─── Agrégateur principal ────────────────────────────────────────────

const COLLECTORS: Array<() => CockpitAlerte[]> = [
  fromCalendrier,
  fromCartographie,
  fromVerificationQuotidienne,
  fromRegies,
  fromStocks,
  fromRapprochement,
  fromVoyages,
  fromRecouvrement,
  fromBudgetsAnnexes,
  fromSubventions,
];

export function aggregateCockpit(): CockpitSummary {
  const allAlertes: CockpitAlerte[] = [];
  for (const c of COLLECTORS) {
    try {
      allAlertes.push(...c());
    } catch (e) {
      console.warn('cockpit collector failed', e);
    }
  }

  // Tri par criticité puis deadline
  allAlertes.sort((a, b) => {
    const dr = severityRank(a.severity) - severityRank(b.severity);
    if (dr !== 0) return dr;
    if (a.joursRestants != null && b.joursRestants != null) return a.joursRestants - b.joursRestants;
    return 0;
  });

  const critiques = allAlertes.filter(a => a.severity === 'critique');
  const majeurs = allAlertes.filter(a => a.severity === 'majeur');
  const moyens = allAlertes.filter(a => a.severity === 'moyen');
  const info = allAlertes.filter(a => a.severity === 'info');

  // Score = 100 − pénalités. Critique=15, Majeur=6, Moyen=2 (plafonné à 100)
  const penalite = critiques.length * 15 + majeurs.length * 6 + moyens.length * 2;
  const scoreConformite = Math.max(0, 100 - penalite);
  const scoreLetter: CockpitSummary['scoreLetter'] =
    scoreConformite >= 90 ? 'A' :
    scoreConformite >= 75 ? 'B' :
    scoreConformite >= 55 ? 'C' :
    scoreConformite >= 35 ? 'D' : 'E';

  // Top 3 actions = 3 premières alertes (déjà triées)
  const topActions = allAlertes.slice(0, 3);

  // Par module
  const parModule: Record<string, number> = {};
  allAlertes.forEach(a => {
    parModule[a.source] = (parModule[a.source] || 0) + 1;
  });

  return {
    scoreConformite,
    scoreLetter,
    totalAlertes: allAlertes.length,
    critiques,
    majeurs,
    moyens,
    info,
    topActions,
    parModule,
    derniereMaj: new Date().toISOString(),
  };
}

/** Liste des sources connues pour la matrice ER × Processus */
export const COCKPIT_SOURCES = [
  'Calendrier annuel AC',
  'Cartographie des risques',
  'Vérification quotidienne',
  'Régies',
  'Stocks denrées',
  'Rapprochement bancaire',
  'Voyages scolaires',
  'Recouvrement',
  'Budgets Annexes',
  'Subventions',
] as const;

```

### FICHIER : src/lib/demo-mode.ts

```ts
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

```

### FICHIER : src/lib/doctrine-eple.ts

```ts
/**
 * Doctrine "Expert agent comptable EPLE" — moteur central réutilisable.
 *
 * Centralise :
 *  1. Le LEXIQUE Op@le (helper opaleTerm pour normaliser libellés)
 *  2. Le CATALOGUE de références juridiques par thème métier
 *  3. Les TEMPLATES de livrables (mail ordonnateur, note interne, extrait rapport CA)
 *  4. Le BUILDER d'analyse 5 étapes (reformulation → cadre → analyse → conclusion → source)
 *
 * Cadre : GBCP 2012-1246, M9-6, CCP, Code éducation, Ordonnance 2022-408 (RGP),
 *         décret 2019-798 (régies), arrêté du 25 juillet 2013 (PJ),
 *         circulaires bourses / fonds sociaux / voyages.
 *
 * Logique Op@le : services → domaines → activités (0=fonds propres, 1=État, 2=collectivité),
 *                 plan comptable à 6 chiffres.
 */

// ═══════════════════════════════════════════════════════════════════════
//  1. LEXIQUE Op@le — normalisation du vocabulaire
// ═══════════════════════════════════════════════════════════════════════

/** Substitutions Op@le obligatoires (ordre = priorité). */
const LEXIQUE_OPALE: Array<[RegExp, string]> = [
  // Terminologie Op@le
  [/\bmandatement(s)?\b/gi, 'demande$1 de paiement'],
  [/\bmandater\b/gi, 'émettre une demande de paiement'],
  [/\bmandaté(e?s?)\b/gi, 'demande$1 de paiement émise$1'],
  [/\bordre de payer\b/gi, 'demande de paiement'],
  // ER au lieu de "rattachés" seul
  [/\bles rattachés\b/gi, 'les établissements rattachés'],
  [/\baux rattachés\b/gi, 'aux établissements rattachés (ER)'],
  [/\bdes rattachés\b/gi, 'des établissements rattachés (ER)'],
  // Logique services (jamais "chapitres" pour Op@le)
  [/\b(par|en) chapitres?\b/gi, '$1 services'],
];

/** Normalise une chaîne selon le lexique Op@le (à utiliser dans les libellés UI). */
export function opaleTerm(s: string): string {
  if (!s) return s;
  return LEXIQUE_OPALE.reduce((acc, [re, repl]) => acc.replace(re, repl), s);
}

/** Vocabulaire de référence (à afficher dans la doctrine). */
export const VOCABULAIRE_OPALE = {
  demandePaiement: {
    terme: 'demande de paiement',
    ancien: 'mandatement / mandat',
    note: 'Op@le ne parle plus de "mandat" mais de "demande de paiement" (DP).',
  },
  titreRecette: {
    terme: 'titre de recette',
    ancien: 'ordre de recette',
    note: 'Le titre de recette matérialise la créance prise en charge par l\'agent comptable.',
  },
  er: {
    terme: 'établissements rattachés (ER)',
    ancien: 'rattachés',
    note: 'Toujours dire "établissements rattachés" ou "ER", jamais "les rattachés" seul.',
  },
  service: {
    terme: 'service',
    ancien: 'chapitre',
    note: 'Op@le raisonne par services > domaines > activités, pas par chapitres budgétaires classiques.',
  },
  activites: {
    terme: 'activités',
    note: 'Activité 0 = fonds propres ; activité 1 = État ; activité 2 = collectivité de rattachement.',
  },
  comptes6: {
    terme: 'comptes à 6 chiffres',
    note: 'Le plan comptable Op@le impose 6 chiffres : 416000, 515100, 408100, etc.',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════
//  2. CATALOGUE de références juridiques par thème métier
// ═══════════════════════════════════════════════════════════════════════

export type ThemeMetier =
  | 'verification'
  | 'marches'
  | 'regies'
  | 'bourses'
  | 'fonds-sociaux'
  | 'subventions'
  | 'fonds-roulement'
  | 'annexe-comptable'
  | 'restauration'
  | 'stocks'
  | 'rapprochement'
  | 'voyages'
  | 'depenses'
  | 'droits-constates'
  | 'recouvrement'
  | 'controle-caisse'
  | 'budgets-annexes'
  | 'analyse-financiere'
  | 'ordonnateur'
  | 'organigramme'
  | 'piste-audit'
  | 'pv'
  | 'plan-controle'
  | 'plan-action'
  | 'cartographie-risques'
  | 'calendrier'
  | 'cockpit';

export interface RefDoctrine {
  ref: string;
  citation?: string;
  url?: string;
}

/** Références juridiques principales par thème (3 max par thème, les plus structurantes). */
export const REFS_PAR_THEME: Record<ThemeMetier, RefDoctrine[]> = {
  verification: [
    { ref: 'Art. 19 GBCP — Décret 2012-1246', citation: 'L\'agent comptable est seul chargé du recouvrement des recettes et du paiement des dépenses.' },
    { ref: 'Art. 38 GBCP', citation: 'Cinq motifs légaux de suspension du paiement (crédits, certifications, service fait, caractère libératoire, visa CB).' },
    { ref: 'Ordonnance 2022-408 (RGP)', citation: 'Régime unifié de responsabilité du gestionnaire public depuis le 1er janvier 2023.' },
  ],
  marches: [
    { ref: 'Art. R.2122-8 CCP — Décret 2025-1386', citation: 'Dispense de publicité < 60 000 € HT (fournitures/services), < 100 000 € HT (travaux).' },
    { ref: 'Art. R.2123-1 CCP', citation: 'Procédure adaptée (MAPA) au-delà des seuils de dispense.' },
    { ref: 'Art. R.2124-1 CCP', citation: 'Procédure formalisée obligatoire au-delà des seuils européens (143 000 € fournitures/services, 5 538 000 € travaux).' },
  ],
  regies: [
    { ref: 'Décret 2019-798 du 26 juillet 2019', citation: 'Régime modernisé des régies de recettes et d\'avances des organismes publics.' },
    { ref: 'Décret 2020-128', citation: 'Modifications du régime des régies (cumul, plafonds, contrôles).' },
    { ref: 'Arrêté du 28 mai 1993 modifié', citation: 'Indemnités de responsabilité (IR) des régisseurs.' },
    { ref: 'Ord. 2022-408 + Décret 2022-1605', citation: 'Suppression du cautionnement des régisseurs et des comptables publics au 1er janvier 2023 — instauration du RGP (jugé par la Cour des comptes).' },
  ],
  bourses: [
    { ref: 'Code éducation art. R.531-13 et s.', citation: 'Conditions d\'attribution des bourses nationales de lycée et collège.' },
    { ref: 'Circulaire n° 2017-122', citation: 'Modalités de gestion des bourses et fonds sociaux.' },
    { ref: 'M9-6 Tome 2 — bourses', citation: 'Imputation comptable et reversement DSDEN.' },
  ],
  'fonds-sociaux': [
    { ref: 'Circulaire n° 2017-122 du 24 juillet 2017', citation: 'Fonds social collégien / lycéen / cantine — critères, plafonds, contrôle du responsable légal.' },
    { ref: 'Code éducation art. L.533-2', citation: 'Aides exceptionnelles attribuées par le chef d\'établissement après avis de la commission.' },
    { ref: 'M9-6 — fonds sociaux', citation: 'Bourses + fonds sociaux ne peuvent excéder le montant des frais scolaires dus.' },
  ],
  subventions: [
    { ref: 'Loi n° 68-1250 du 31 décembre 1968', citation: 'Prescription quadriennale des créances sur l\'État et les collectivités.' },
    { ref: 'Code éducation art. L.421-11', citation: 'Subventions d\'État affectées et libres d\'emploi.' },
    { ref: 'M9-6 Tome 2 — subventions', citation: 'Reversement obligatoire des subventions affectées non employées dans le délai de 4 ans.' },
  ],
  'fonds-roulement': [
    { ref: 'M9-6 § 4.5.3 — analyse financière', citation: 'Méthode de calcul du fonds de roulement et appréciation par jours de DRFN (DRFN/365).' },
    { ref: 'Rapport IGAENR 2016-071 (FDRM)', citation: 'Modèle Tableaux A-B-C, diviseur C/360, niveau prudentiel ≥ 30 jours.' },
    { ref: 'Art. 175 GBCP', citation: 'Fonds de roulement, équilibre budgétaire et prélèvement sur fonds de roulement.' },
  ],
  'annexe-comptable': [
    { ref: 'M9-6 Tome 1 — annexe comptable', citation: 'Documents narratifs accompagnant le compte financier (FRNG, BFR, soldes intermédiaires).' },
    { ref: 'Art. 211 GBCP', citation: 'Compte financier voté par le CA avant le 30 avril N+1.' },
    { ref: 'Code éducation art. R.421-77', citation: 'Présentation au CA et transmission à l\'autorité de tutelle.' },
  ],
  restauration: [
    { ref: 'Loi EGalim n° 2018-938', citation: '50 % de produits durables/qualité dont 20 % de bio dans la restauration collective.' },
    { ref: 'Règlement (CE) 852/2004 — HACCP', citation: 'Plan de maîtrise sanitaire obligatoire (DGAL).' },
    { ref: 'M9-6 Tome 2 — SRH', citation: 'Service de restauration et d\'hébergement : tarifs votés par la collectivité, encaissement par le régisseur.' },
  ],
  stocks: [
    { ref: 'M9-6 Tome 1 — stocks', citation: 'Inventaire physique annuel obligatoire avant clôture, valorisation au CMUP ou FIFO.' },
    { ref: 'Art. 168 GBCP', citation: 'Tenue de l\'inventaire physique et comptable des biens.' },
    { ref: 'PCG art. 213-32', citation: 'Méthodes de valorisation et provisions pour dépréciation.' },
  ],
  rapprochement: [
    { ref: 'M9-6 Tome 1 — état de rapprochement', citation: 'Rapprochement mensuel obligatoire compte 515 / relevé Trésor.' },
    { ref: 'Art. 47 GBCP', citation: 'Tenue de la comptabilité des disponibilités et concordance permanente.' },
    { ref: 'Instruction DGFiP — comptes Trésor', citation: 'Justification de tout écart non résorbé sous 30 jours.' },
  ],
  voyages: [
    { ref: 'Circulaire n° 2011-117 du 3 août 2011', citation: 'Sorties et voyages scolaires : encadrement, financement, autorisation.' },
    { ref: 'Circulaire du 16 juillet 2024', citation: 'Mise à jour du cadre des voyages scolaires (sécurité, financement, gratuité).' },
    { ref: 'Code éducation art. R.421-20', citation: 'Compétence du CA sur les voyages organisés par l\'EPLE.' },
  ],
  depenses: [
    { ref: 'Art. 30-33 GBCP', citation: 'Engagement, liquidation, ordonnancement, paiement de la dépense publique.' },
    { ref: 'Arrêté du 25 juillet 2013', citation: 'Liste des pièces justificatives de la dépense des collectivités et EPLE.' },
    { ref: 'Décret 2013-269 — délai de paiement', citation: 'Délai global de paiement de 30 jours, intérêts moratoires automatiques.' },
  ],
  'droits-constates': [
    { ref: 'Art. 22-23 GBCP', citation: 'Constatation et liquidation des recettes par l\'ordonnateur.' },
    { ref: 'M9-6 Tome 1 — droits constatés', citation: 'Émission du titre de recette, prise en charge par l\'agent comptable.' },
    { ref: 'Code éducation art. R.531-13', citation: 'Frais scolaires : tarifs votés par le CA, recouvrement par le comptable.' },
  ],
  recouvrement: [
    { ref: 'Art. 24 GBCP', citation: 'Diligences du comptable pour le recouvrement des créances publiques.' },
    { ref: 'Loi 68-1250', citation: 'Prescription quadriennale opposable aux créances publiques.' },
    { ref: 'Décret 2009-125', citation: 'Admission en non-valeur et remise gracieuse — seuils et procédure.' },
  ],
  'controle-caisse': [
    { ref: 'Art. 47 GBCP', citation: 'Contrôle inopiné de la caisse et des disponibilités.' },
    { ref: 'M9-6 Tome 1 — caisse', citation: 'Plafond de caisse, PV de vérification mensuel.' },
    { ref: 'Décret 2019-798', citation: 'Régies : contrôle obligatoire au moins une fois par an.' },
  ],
  'budgets-annexes': [
    { ref: 'M9-6 Tome 2 § 2.1.2.3.2', citation: 'Budgets annexes (BA) : CFA, GRETA, restauration mutualisée — rattachement à l\'EPLE support.' },
    { ref: 'Compte 185000 — M9-6', citation: 'Compensation parfaite des mouvements de trésorerie entre BP et BA.' },
    { ref: 'Code éducation art. R.421-58', citation: 'Vote du budget annexe par le CA de l\'EPLE support.' },
  ],
  'analyse-financiere': [
    { ref: 'M9-6 § 4.5.3', citation: 'Méthodologie d\'analyse financière des EPLE : DRFN, FDR, BFR, trésorerie.' },
    { ref: 'IGAENR 2016-071', citation: 'Indicateurs FDRM, ratios prudentiels et seuils d\'alerte.' },
    { ref: 'Art. 211 GBCP', citation: 'Compte financier et capacité d\'autofinancement (CAF).' },
  ],
  ordonnateur: [
    { ref: 'Code éducation art. R.421-13', citation: 'Le chef d\'établissement est ordonnateur de l\'EPLE.' },
    { ref: 'Arrêté du 25 juillet 2013 — accréditation', citation: 'Accréditation de l\'ordonnateur et des délégataires auprès du comptable.' },
    { ref: 'Art. 10 GBCP', citation: 'Séparation des fonctions ordonnateur / comptable.' },
  ],
  organigramme: [
    { ref: 'Code éducation art. R.421-9', citation: 'Compétences du chef d\'établissement et délégations.' },
    { ref: 'M9-6 — organisation des services', citation: 'Organigramme fonctionnel de l\'agence comptable.' },
    { ref: 'Décret 2011-1716 — adjoints gestionnaires', citation: 'Statut et missions du SG / adjoint gestionnaire.' },
  ],
  'piste-audit': [
    { ref: 'Décret 2011-775 — CICF', citation: 'Contrôle interne comptable et financier : piste d\'audit obligatoire.' },
    { ref: 'M9-6 — qualité comptable', citation: 'Traçabilité chronologique des contrôles et anomalies.' },
    { ref: 'ISA 230 — auditing', citation: 'Documentation des travaux d\'audit.' },
  ],
  pv: [
    { ref: 'Art. 47 GBCP', citation: 'Procès-verbal de vérification des comptes par l\'agent comptable.' },
    { ref: 'M9-6 — PV de contrôle', citation: 'Modèle de PV consolidé annuel, transmission à la collectivité.' },
    { ref: 'Code éducation art. R.421-77', citation: 'Présentation des PV au CA et au conseil d\'administration.' },
  ],
  'plan-controle': [
    { ref: 'Décret 2011-775 — CICF', citation: 'Plan annuel de contrôle interne, hiérarchisation des risques.' },
    { ref: 'M9-6 — nomenclature des contrôles', citation: 'Bibliothèque des contrôles types (caisse, dépenses, recettes, régies).' },
    { ref: 'Cartop@le / ODICé', citation: 'Cartographie des risques nationale des EPLE.' },
  ],
  'plan-action': [
    { ref: 'Décret 2011-775 — CICF', citation: 'Plan d\'action correctif : suivi des anomalies et délais de résorption.' },
    { ref: 'M9-6 — qualité comptable', citation: 'Démarche d\'amélioration continue de la qualité comptable.' },
  ],
  'cartographie-risques': [
    { ref: 'Cartop@le / ODICé', citation: 'Cartographie de référence : 11 processus métier des EPLE.' },
    { ref: 'Décret 2011-775', citation: 'Obligation d\'identifier, hiérarchiser et traiter les risques (P x I x M).' },
    { ref: 'M9-6 — contrôle interne', citation: 'Risques critiques (score ≥ 40) : plan d\'action immédiat.' },
  ],
  calendrier: [
    { ref: 'Code éducation art. R.421-77', citation: 'Compte financier voté avant le 30 avril N+1.' },
    { ref: 'Art. 175 GBCP', citation: 'Vote du budget initial avant le 1er janvier N.' },
    { ref: 'M9-6 — calendrier annuel', citation: 'Échéances obligatoires : DSN, TVA, inventaire, PV de caisse.' },
  ],
  cockpit: [
    { ref: 'Décret 2011-775 — CICF', citation: 'Pilotage centralisé du contrôle interne et des risques.' },
    { ref: 'M9-6 — tableau de bord', citation: 'Indicateurs clés de qualité comptable.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════
//  3. TEMPLATES de livrables (mail / note / extrait rapport CA)
// ═══════════════════════════════════════════════════════════════════════

export interface MailOrdonnateurInput {
  objet: string;
  etablissement?: string;
  constat: string;
  ref: string;
  demande: string;
  signataire?: string;
}

export function mailOrdonnateur(i: MailOrdonnateurInput): string {
  const etab = i.etablissement ? ` — ${i.etablissement}` : '';
  return `Objet : ${i.objet}${etab}

Madame, Monsieur l'Ordonnateur,

Dans le cadre du contrôle interne comptable et financier, je vous informe du constat suivant :

${i.constat}

Cadre réglementaire : ${i.ref}

À ce titre, je vous demande de bien vouloir :
${i.demande}

Je reste à votre disposition pour tout complément d'information et vous prie d'agréer, Madame, Monsieur l'Ordonnateur, l'expression de ma considération distinguée.

${i.signataire || "L'agent comptable"}`;
}

export interface NoteInterneInput {
  titre: string;
  contexte: string;
  analyse: string;
  recommandation: string;
  ref?: string;
}

export function noteInterne(i: NoteInterneInput): string {
  return `NOTE INTERNE — ${i.titre}

CONTEXTE
${i.contexte}

ANALYSE
${i.analyse}

RECOMMANDATION
${i.recommandation}
${i.ref ? `\nRÉFÉRENCE\n${i.ref}` : ''}

— Service de l'agence comptable`;
}

export interface ExtraitRapportCAInput {
  section: string;
  constat: string;
  ref: string;
  conclusion: string;
}

export function extraitRapportCA(i: ExtraitRapportCAInput): string {
  return `${i.section}

Constat
${i.constat}

Cadre juridique
${i.ref}

Conclusion de l'agent comptable
${i.conclusion}`;
}

// ═══════════════════════════════════════════════════════════════════════
//  4. BUILDER d'analyse 5 étapes
// ═══════════════════════════════════════════════════════════════════════

export interface Analyse5Etapes {
  /** 1. Reformulation brève du problème ou du contexte */
  reformulation: string;
  /** 2. Cadre juridique mobilisé (article, décret, paragraphe M9-6) */
  cadre: string;
  /** 3. Analyse appliquée à la situation */
  analyse: string;
  /** 4. Conclusion + recommandation opérationnelle */
  conclusion: string;
  /** 5. Source précise (référence courte) */
  source: string;
}

/** Sérialise une analyse 5 étapes en Markdown structuré (pour copier ou afficher). */
export function analyse5EtapesMarkdown(a: Analyse5Etapes): string {
  return `**1. Reformulation**
${a.reformulation}

**2. Cadre juridique**
${a.cadre}

**3. Analyse**
${a.analyse}

**4. Conclusion & recommandation**
${a.conclusion}

**Source** : ${a.source}`;
}

```

### FICHIER : src/lib/doctrine-livrables.ts

```ts
/**
 * Doctrine EPLE — analyses 5 étapes & livrables pré-rédigés par thème métier.
 *
 * Pour chaque thème (Régies, Marchés, Bourses, etc.) :
 *  - Une analyse structurée 5 étapes (Reformulation → Cadre → Analyse → Conclusion → Source)
 *  - 1 à 3 livrables prêts à l'emploi (mail ordonnateur / note interne / extrait rapport CA)
 *
 * Utilisé par <DoctrineEPLE /> pour habiller chaque module avec la doctrine d'agent comptable EPLE.
 */
import {
  type Analyse5Etapes,
  type ThemeMetier,
  mailOrdonnateur,
  noteInterne,
  extraitRapportCA,
} from '@/lib/doctrine-eple';
import type { LivrableType } from '@/components/LivrableCopiable';
// re-export pour les composants consommateurs
export type { LivrableType };

interface Livrable {
  type: LivrableType;
  titre: string;
  contenu: string;
  promptIA?: string;
}

interface DoctrineTheme {
  analyse: Analyse5Etapes;
  livrables: Livrable[];
}

const ETAB_PLACEHOLDER = '[Établissement]';

/** Construit la doctrine pour un thème donné, paramétrée par l'établissement actif. */
export function getDoctrineForTheme(theme: ThemeMetier, etablissement?: string): DoctrineTheme {
  const etab = etablissement || ETAB_PLACEHOLDER;
  return DOCTRINE[theme]?.(etab) ?? { analyse: VOID_ANALYSE, livrables: [] };
}

const VOID_ANALYSE: Analyse5Etapes = {
  reformulation: '',
  cadre: '',
  analyse: '',
  conclusion: '',
  source: '',
};

type Builder = (etab: string) => DoctrineTheme;

const DOCTRINE: Partial<Record<ThemeMetier, Builder>> = {
  // ════════════════════════════════════════════════════════════════════
  verification: (etab) => ({
    analyse: {
      reformulation:
        "Vérification quotidienne par l'agent comptable des demandes de paiement (DP) émises par l'ordonnateur avant prise en charge et règlement.",
      cadre:
        "Article 19 GBCP : l'agent comptable est seul chargé du paiement. Article 38 GBCP : 5 motifs légaux de suspension (insuffisance de crédits, inexactitude des certifications, absence de service fait, caractère non libératoire, absence de visa CB).",
      analyse:
        "Pour chaque DP : contrôle de la disponibilité des crédits sur le service/domaine/activité, exactitude de la liquidation, justification du service fait (PJ conformes à l'arrêté du 25 juillet 2013), qualité du créancier et RIB.",
      conclusion:
        "Toute anomalie justifie une suspension motivée et la rédaction d'un mail à l'ordonnateur citant l'article 38 GBCP et la nature précise du manquement. La responsabilité personnelle du comptable est engagée (Ordonnance 2022-408 — RGP).",
      source: 'Décret 2012-1246 (GBCP) art. 19 et 38 ; Ordonnance 2022-408 ; Arrêté du 25 juillet 2013 (PJ).',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Suspension de paiement — motif 38 GBCP',
        contenu: mailOrdonnateur({
          objet: 'Suspension de paiement — DP n° [N°]',
          etablissement: etab,
          constat:
            "La demande de paiement n° [N°] du [date] présente une anomalie : [préciser le motif — service fait non justifié / crédits insuffisants / pièce manquante / RIB invalide].",
          ref:
            'Article 38 du décret n° 2012-1246 du 7 novembre 2012 (GBCP), motif n° [1 à 5], et arrêté du 25 juillet 2013 fixant la liste des pièces justificatives.',
          demande:
            "- régulariser la pièce justificative manquante ou erronée ;\n- m'adresser une nouvelle DP rectifiée ;\n- accuser réception de la présente suspension.",
        }),
      },
      {
        type: 'note',
        titre: 'Note interne — synthèse hebdomadaire des suspensions',
        contenu: noteInterne({
          titre: 'Synthèse hebdomadaire — suspensions de paiement',
          contexte:
            "Bilan des DP suspendues sur la période du [début] au [fin] dans le cadre du contrôle hiérarchisé de la dépense (CHD).",
          analyse:
            "Sur [N] DP contrôlées, [n] suspensions ont été émises, dont [n1] pour absence de service fait, [n2] pour PJ manquantes, [n3] pour erreur de liquidation. Délai moyen de régularisation : [X] jours.",
          recommandation:
            "Sensibiliser les services prescripteurs à la complétude des PJ dès l'engagement et automatiser le contrôle de la cohérence engagement/liquidation dans Op@le.",
          ref: 'Art. 38 GBCP ; Décret 2011-775 (CICF).',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  marches: (etab) => ({
    analyse: {
      reformulation:
        "Suivi des achats publics de l'EPLE : respect des seuils CCP, choix de la procédure adaptée à la nature et au montant, traçabilité de la mise en concurrence.",
      cadre:
        "Décrets 2025-1386 et 2025-1383 du 18 décembre 2025 (seuils 2026) : dispense de publicité < 60 000 € HT (fournitures/services) ou < 100 000 € HT (travaux) ; MAPA jusqu'aux seuils européens (143 000 € HT services, 5 538 000 € HT travaux) ; procédure formalisée au-delà.",
      analyse:
        "Pour chaque marché : vérifier l'adéquation procédure/montant prévisionnel, l'existence de devis (3 devis recommandés ≥ 25 000 € HT), la publicité au profil acheteur ≥ 60 000 € HT, la transmission au contrôle de légalité ≥ 90 000 € HT, le respect du délai global de paiement de 30 jours (décret 2013-269).",
      conclusion:
        "Tout dépassement de seuil sans procédure adéquate ou défaut de publicité expose l'EPLE à un recours et engage la responsabilité de l'ordonnateur. L'agent comptable contrôle la régularité formelle au moment de la prise en charge de la DP (visa du marché, conformité aux clauses).",
      source: 'CCP art. R.2122-8, R.2123-1, R.2124-1 ; Décrets 2025-1386 et 2025-1383 ; Décret 2013-269.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Alerte dépassement de seuil sans procédure',
        contenu: mailOrdonnateur({
          objet: 'Alerte commande publique — dépassement de seuil',
          etablissement: etab,
          constat:
            "L'engagement n° [N°] portant sur [objet] pour un montant prévisionnel de [montant] € HT dépasse le seuil de [60 000 / 90 000 / 143 000] € HT sans qu'une procédure de [MAPA / MAPA avec publicité renforcée / procédure formalisée] ait été engagée.",
          ref: "Article R.2122-8, R.2123-1 ou R.2124-1 du Code de la commande publique (CCP) ; décrets 2025-1386 et 2025-1383 du 18 décembre 2025.",
          demande:
            "- justifier la procédure suivie ou régulariser par publication au profil acheteur (BOAMP / JOUE selon le seuil) ;\n- transmettre les pièces du marché (avis de publicité, rapport d'analyse des offres, notification) ;\n- à défaut, surseoir à toute nouvelle DP relative à ce marché.",
        }),
      },
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — exécution de la commande publique',
        contenu: extraitRapportCA({
          section: 'Section — Exécution de la commande publique (exercice [N])',
          constat:
            "L'établissement a passé [N] marchés sur l'exercice, dont [n1] en dispense de publicité, [n2] en MAPA, [n3] en procédure formalisée. Délai moyen de paiement : [X] jours (objectif réglementaire : 30 jours).",
          ref: "Articles R.2122-8 à R.2124-1 du CCP ; décrets 2025-1386 et 2025-1383 (seuils 2026) ; décret 2013-269 (délais de paiement).",
          conclusion:
            "L'agent comptable atteste la régularité formelle des marchés contrôlés au stade de la DP. [Ajouter mention : aucune anomalie / X anomalies relevées et mail de suspension transmis à l'ordonnateur].",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  regies: (etab) => ({
    analyse: {
      reformulation:
        "Contrôle de la régularité des régies de recettes et d'avances : actes constitutifs, nomination du régisseur, plafonds, contrôles inopinés, reversements, indemnité de responsabilité (IR).",
      cadre:
        "Décret 2019-798 du 26 juillet 2019 modernisé par 2020-128 : régime unifié des régies. Arrêté du 28 mai 1993 modifié : indemnités de responsabilité du régisseur. Ordonnance 2022-408 + Décret 2022-1605 du 22/12/2022 : suppression du cautionnement (régisseurs et comptables publics) et instauration du Régime de responsabilité des gestionnaires publics (RGP) au 1er janvier 2023. Obligation de contrôle au moins une fois par an par l'agent comptable.",
      analyse:
        "Pour chaque régie : vérifier l'arrêté constitutif, l'acte de nomination du régisseur, le plafond d'encaisse et de la régie d'avances, la fréquence des reversements (≥ 1/mois), la concordance comptabilité régisseur / comptabilité du comptable, la tenue des journaux et bordereaux, et le versement de l'indemnité de responsabilité (IR) due dès lors que le plafond dépasse 1 220 €.",
      conclusion:
        "Toute irrégularité (régie sans acte constitutif, plafond dépassé, IR non versée, reversement tardif) doit faire l'objet d'un PV de contrôle et d'une mise en demeure. Le régisseur relève désormais du RGP (Régime de responsabilité des gestionnaires publics — Ord. 2022-408) jugé par la Cour des comptes : le cautionnement n'est plus exigé.",
      source: 'Décret 2019-798 ; Décret 2020-128 ; Arrêté du 28 mai 1993 modifié ; Ordonnance 2022-408 ; Décret 2022-1605.',
    },
    livrables: [
      {
        type: 'note',
        titre: 'PV de contrôle inopiné de régie',
        contenu: noteInterne({
          titre: 'PV de contrôle inopiné — Régie [intitulé]',
          contexte:
            "Contrôle effectué le [date] au sein de la régie [recettes / avances] [intitulé] de l'établissement " +
            etab +
            ", conformément à l'article 18 du décret 2019-798.",
          analyse:
            "Vérifications réalisées :\n- existence de l'acte constitutif et de l'arrêté de nomination : [conforme / à régulariser]\n- cautionnement du régisseur : [montant, organisme]\n- encaisse théorique : [montant] € — encaisse constatée : [montant] € — écart : [montant] €\n- dernier reversement : [date]\n- tenue des journaux et pièces : [conforme / observations]",
          recommandation:
            "[Aucune anomalie relevée / Régulariser sous [délai] : préciser]. Le régisseur s'engage à [actions correctives].",
          ref: 'Décret 2019-798 art. 18 ; Arrêté du 28 mai 1993 modifié.',
        }),
      },
      {
        type: 'mail',
        titre: 'Mise en demeure — reversement tardif',
        contenu: mailOrdonnateur({
          objet: 'Mise en demeure — reversement de régie',
          etablissement: etab,
          constat:
            "Le régisseur de la régie [intitulé] n'a pas procédé au reversement de l'encaisse depuis le [date], en infraction avec l'obligation de reversement mensuel.",
          ref: 'Décret 2019-798 du 26 juillet 2019 ; arrêté constitutif de la régie.',
          demande:
            "- procéder sans délai au reversement de l'encaisse au comptable ;\n- justifier le motif du retard ;\n- en cas de récidive, je serai conduit à proposer le retrait de l'acte de nomination du régisseur.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  bourses: (etab) => ({
    analyse: {
      reformulation:
        "Gestion et reversement des bourses nationales de collège et de lycée : attribution sur critères, paiement trimestriel, reversement au DSDEN des bourses non distribuées.",
      cadre:
        "Code de l'éducation art. R.531-13 et suivants ; circulaire n° 2017-122 du 24 juillet 2017 ; M9-6 Tome 2 (imputation comptable bourses).",
      analyse:
        "Vérifier : la régularité des notifications d'attribution, la concordance bénéficiaires/montants/trimestres, l'imputation au compte 4411 (bourses à payer) puis 4671/4672 selon les cas, le reversement au DSDEN des montants non distribués (élève parti, refus famille), le respect du plafond bourses + fonds sociaux ≤ frais scolaires dus.",
      conclusion:
        "Toute bourse non distribuée doit être reversée au DSDEN dans les meilleurs délais. La conservation indue expose l'EPLE à un risque de réclamation et engage la responsabilité du comptable.",
      source: 'Code éducation art. R.531-13 ; Circulaire 2017-122 ; M9-6 Tome 2.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Reversement bourses non distribuées au DSDEN',
        contenu: mailOrdonnateur({
          objet: 'Reversement de bourses non distribuées — trimestre [T]',
          etablissement: etab,
          constat:
            "À l'issue du trimestre [T] de l'année [N], un montant de [X] € de bourses nationales n'a pas pu être distribué (élèves partis, refus famille, dossiers incomplets).",
          ref: 'Code éducation art. R.531-13 et s. ; circulaire n° 2017-122 du 24 juillet 2017.',
          demande:
            "- valider l'état détaillé des bourses non distribuées ;\n- autoriser le reversement au DSDEN dans les délais réglementaires ;\n- mettre à jour les notifications individuelles aux familles concernées.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'fonds-sociaux': (etab) => ({
    analyse: {
      reformulation:
        "Attribution et contrôle des fonds sociaux collégien / lycéen / cantine : aides exceptionnelles aux familles en difficulté, soumises à conditions et à plafond.",
      cadre:
        "Circulaire n° 2017-122 du 24 juillet 2017 ; Code de l'éducation art. L.533-2 ; M9-6 (imputation et plafond bourses + FSC ≤ frais scolaires dus).",
      analyse:
        "Pour chaque dossier : vérifier l'existence d'une demande motivée, l'avis de la commission des fonds sociaux, la décision du chef d'établissement, l'identité du responsable légal payeur (le bénéficiaire est l'élève, le paiement au responsable légal). Plafonner : bourses + FSC ≤ montant des frais scolaires effectivement dus.",
      conclusion:
        "Toute attribution non motivée, sans avis de la commission ou versée à un tiers non habilité doit être suspendue. La traçabilité des décisions est essentielle en cas de contrôle.",
      source: 'Circulaire 2017-122 ; Code éducation art. L.533-2 ; M9-6.',
    },
    livrables: [
      {
        type: 'note',
        titre: 'PV de commission des fonds sociaux',
        contenu: noteInterne({
          titre: 'Commission des fonds sociaux — séance du [date]',
          contexte:
            'Examen des [N] demandes d\'aides FSC déposées au titre de la période [période] pour ' + etab + '.',
          analyse:
            "Sur [N] demandes : [n1] aides accordées (montant total [X] €), [n2] refus motivés, [n3] mises en attente. Plafond bourses + FSC respecté pour 100 % des bénéficiaires.",
          recommandation:
            "Validation par le chef d'établissement et imputation comptable au compte [préciser]. Notification aux familles sous [délai].",
          ref: 'Circulaire 2017-122 ; Code éducation art. L.533-2.',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  subventions: (etab) => ({
    analyse: {
      reformulation:
        "Suivi des subventions affectées reçues par l'EPLE : utilisation conforme à l'objet, justification de l'emploi, prescription quadriennale et reversement du solde non employé.",
      cadre:
        "Loi 68-1250 du 31 décembre 1968 (prescription quadriennale) ; Code éducation art. L.421-11 ; M9-6 Tome 2 (subventions).",
      analyse:
        "Pour chaque subvention : vérifier la convention ou notification d'attribution, l'objet précis, le montant et le calendrier d'emploi. Suivre l'imputation au compte 4419 (subventions à reverser) si non employée. Au-delà de 4 ans après le versement, la subvention est forclose et doit être reversée à l'autorité ayant attribué.",
      conclusion:
        "Toute subvention affectée non employée dans le délai de 4 ans doit être reversée. Le défaut de reversement engage la responsabilité du comptable et de l'ordonnateur.",
      source: 'Loi 68-1250 ; Code éducation art. L.421-11 ; M9-6 Tome 2.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Reversement subvention prescrite',
        contenu: mailOrdonnateur({
          objet: 'Reversement de subvention prescrite (déchéance quadriennale)',
          etablissement: etab,
          constat:
            "La subvention [intitulé], versée le [date], d'un montant initial de [X] €, présente un solde non employé de [Y] € dépassant le délai de 4 ans (forclose au [date]).",
          ref: 'Loi n° 68-1250 du 31 décembre 1968 relative à la prescription des créances ; M9-6 Tome 2.',
          demande:
            "- ordonner le reversement du solde de [Y] € à l'autorité ayant attribué la subvention ;\n- établir le titre de recette correspondant ;\n- adresser un courrier de justification à l'autorité.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'fonds-roulement': (etab) => ({
    analyse: {
      reformulation:
        "Analyse du fonds de roulement (FDR) de l'EPLE : niveau prudentiel, capacité à couvrir les charges courantes, équilibre avec le BFR et la trésorerie.",
      cadre:
        "M9-6 § 4.5.3 (méthode d'analyse financière) ; Rapport IGAENR 2016-071 (modèle FDRM Tableaux A-B-C, diviseur C/360) ; Article 175 GBCP.",
      analyse:
        "Calculer FDR = ressources stables - emplois stables. Apprécier en jours de DRFN (Dépenses Réelles de Fonctionnement Nettes) : FDR / DRFN × 365. Niveau prudentiel : ≥ 30 jours. Niveau d'alerte : < 15 jours. Comparer évolution N-2 / N-1 / N et tester la soutenabilité d'un éventuel prélèvement.",
      conclusion:
        "Un FDR < 30 jours appelle un plan de redressement (limitation des engagements, reconstitution sur 2-3 exercices). Un FDR > 90 jours peut justifier un prélèvement après vote du CA. Toute évolution majeure doit être documentée dans l'annexe au compte financier.",
      source: 'M9-6 § 4.5.3 ; IGAENR 2016-071 ; Art. 175 GBCP.',
    },
    livrables: [
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — situation du fonds de roulement',
        contenu: extraitRapportCA({
          section: 'Section — Situation du fonds de roulement (exercice [N])',
          constat:
            "Au 31/12/[N], le fonds de roulement de " +
            etab +
            " s'établit à [X] €, soit [Y] jours de DRFN (DRFN = [Z] €). Évolution sur 3 ans : [N-2 → N-1 → N].",
          ref: 'M9-6 § 4.5.3 ; IGAENR 2016-071 (modèle FDRM) ; Article 175 GBCP.',
          conclusion:
            "Le FDR se situe [au-dessus / en-dessous] du seuil prudentiel de 30 jours. [Recommandation : maintien / reconstitution / prélèvement à proposer au CA]. La capacité d'autofinancement (CAF) de [X] € soutient cette trajectoire.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'annexe-comptable': (etab) => ({
    analyse: {
      reformulation:
        "Production de l'annexe au compte financier : documents narratifs et tableaux complémentaires explicitant les comptes au CA et à l'autorité de tutelle.",
      cadre:
        "M9-6 Tome 1 (annexe comptable) ; Article 211 GBCP (compte financier voté avant le 30 avril N+1) ; Code éducation art. R.421-77.",
      analyse:
        "Construire l'annexe en 3 volets : (1) annexe explicative des résultats et soldes intermédiaires (FRNG, BFR, trésorerie, CAF) ; (2) tableaux de financement et d'évolution patrimoniale ; (3) faits marquants de l'exercice et événements postérieurs à la clôture.",
      conclusion:
        "L'annexe doit être cohérente avec le compte financier et signée conjointement par l'ordonnateur et l'agent comptable. Elle est jointe au PV du CA et transmise à la collectivité de rattachement.",
      source: 'M9-6 Tome 1 ; Art. 211 GBCP ; Code éducation art. R.421-77.',
    },
    livrables: [
      {
        type: 'rapport',
        titre: 'Trame — annexe au compte financier',
        contenu: extraitRapportCA({
          section: 'Annexe au compte financier — exercice [N]',
          constat:
            "Présentation des résultats de " +
            etab +
            " : résultat de fonctionnement [X] €, résultat d'investissement [Y] €, FRNG [Z] € ([W] jours de DRFN), BFR [A] €, trésorerie nette [B] €.",
          ref: 'M9-6 Tome 1 ; Article 211 GBCP.',
          conclusion:
            "Les comptes traduisent fidèlement la situation financière de l'établissement. Faits marquants : [préciser]. Événements postérieurs : [préciser]. L'agent comptable atteste la sincérité et la régularité des comptes.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'droits-constates': (etab) => ({
    analyse: {
      reformulation:
        "Constatation et liquidation des recettes par l'ordonnateur, prise en charge des titres de recette par l'agent comptable, suivi des créances sur les familles.",
      cadre:
        "Articles 22-23 GBCP (constatation et liquidation des recettes) ; M9-6 Tome 1 (droits constatés) ; Code éducation art. R.531-13 (frais scolaires).",
      analyse:
        "Pour chaque titre de recette : vérifier la pièce justificative (notification, contrat, délibération), l'exactitude de la liquidation (tarif voté, durée, quantité), l'identification précise du débiteur et de son responsable légal, l'imputation au compte 411 ou 416 selon ancienneté.",
      conclusion:
        "Toute recette non titrée constitue une perte potentielle. L'agent comptable doit alerter l'ordonnateur sur les recettes non émises avant la clôture (rattachement obligatoire des produits à recevoir).",
      source: 'Art. 22-23 GBCP ; M9-6 Tome 1 ; Code éducation art. R.531-13.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Alerte produits à recevoir avant clôture',
        contenu: mailOrdonnateur({
          objet: 'Rattachement des produits à recevoir — clôture [N]',
          etablissement: etab,
          constat:
            "Avant clôture de l'exercice [N], certains droits sont constatés mais non titrés : [détail — locations, conventions, prestations facturées en N+1 mais relatives à N].",
          ref: 'Articles 22-23 du décret 2012-1246 (GBCP) ; principe de rattachement à l\'exercice (M9-6 Tome 1).',
          demande:
            "- émettre les titres de recette correspondants avant le [date de clôture] ;\n- ou m'autoriser à comptabiliser un produit à recevoir (compte 4181) avec contrepartie de produit (compte 70[X]).",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  recouvrement: (etab) => ({
    analyse: {
      reformulation:
        "Diligences de recouvrement amiable et contentieux des créances de l'EPLE (frais scolaires, conventions, locations) et gestion des admissions en non-valeur.",
      cadre:
        "Article 24 GBCP (diligences du comptable) ; Loi 68-1250 (prescription quadriennale) ; Décret 2009-125 (admission en non-valeur).",
      analyse:
        "Pour chaque créance : adresser relances graduées (J+30, J+60, J+90), mettre en demeure, engager si nécessaire une action contentieuse (huissier, juge). Tenir un état des créances par âge, identifier les créances prescrites ou irrécouvrables et préparer les ANV pour vote du CA.",
      conclusion:
        "L'absence de diligences de recouvrement engage la responsabilité personnelle de l'agent comptable (Ordonnance 2022-408). L'ANV doit être motivée (insolvabilité, disparition, décès) et votée par le CA.",
      source: 'Art. 24 GBCP ; Loi 68-1250 ; Décret 2009-125 ; Ordonnance 2022-408.',
    },
    livrables: [
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — admission en non-valeur',
        contenu: extraitRapportCA({
          section: 'Section — Admission en non-valeur (exercice [N])',
          constat:
            "L'agent comptable de " +
            etab +
            " a effectué les diligences réglementaires sur [N] créances pour un montant total de [X] €. Malgré les actions engagées (relances, mises en demeure, [recours huissier/juge]), [Y] créances pour un montant de [Z] € restent irrécouvrables.",
          ref: 'Article 24 GBCP ; Loi 68-1250 ; Décret 2009-125.',
          conclusion:
            "Il est proposé au Conseil d'administration d'admettre en non-valeur les créances détaillées en annexe, motifs : [insolvabilité / disparition / décès / minime importance]. Cette admission ne fait pas obstacle à un recouvrement ultérieur si la situation du débiteur évolue.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  restauration: (etab) => ({
    analyse: {
      reformulation:
        "Pilotage du service de restauration et d'hébergement (SRH) : conformité EGalim, sécurité sanitaire (HACCP), équilibre recettes/dépenses et titres de recettes encaissés via régie.",
      cadre:
        "Loi EGalim n° 2018-938 (50 % durables dont 20 % bio) ; Règlement (CE) 852/2004 et arrêté du 21/12/2009 (HACCP, agrément sanitaire dès 80 repas/jour livrés vers tiers) ; M9-6 Tome 2 (SRH) ; tarifs votés par la collectivité.",
      analyse:
        "Suivre mensuellement : taux d'achats durables et bio (objectifs EGalim), grammage par convive, ratio ventes / achats denrées, conformité du PMS et de la traçabilité, encaissement régulier des titres par le régisseur, respect du tarif voté par la collectivité, équilibre du SRH.",
      conclusion:
        "Tout déséquilibre durable du SRH ou défaut de conformité EGalim/sanitaire doit être signalé à l'ordonnateur et porté à l'ordre du jour du CA. L'agent comptable contrôle la concordance régisseur/comptabilité et la prise en charge des titres.",
      source: 'Loi EGalim 2018-938 ; Règlement (CE) 852/2004 ; Arrêté 21/12/2009 ; M9-6 Tome 2.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Alerte EGalim — seuils non atteints',
        contenu: mailOrdonnateur({
          objet: 'Restauration scolaire — non-conformité loi EGalim',
          etablissement: etab,
          constat:
            "Le suivi des achats du SRH au [date] fait apparaître [X] % de produits durables/qualité (objectif 50 %) dont [Y] % de bio (objectif 20 %), en deçà des obligations légales.",
          ref: 'Loi n° 2018-938 du 30 octobre 2018 (EGalim) ; Code rural art. L.230-5-1.',
          demande:
            "- transmettre un plan d'action pour atteindre les seuils sur l'exercice ;\n- mettre à jour le marché de denrées avec exigences EGalim chiffrées ;\n- présenter un point d'étape au CA.",
        }),
      },
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — équilibre du SRH',
        contenu: extraitRapportCA({
          section: 'Section — Service de restauration et d\'hébergement (exercice [N])',
          constat:
            "Le SRH de " + etab + " a servi [N] repas, pour des recettes de [X] € et des dépenses de [Y] €, soit un résultat de [Z] €. Coût matière par repas : [C] €. Taux EGalim : [%].",
          ref: 'M9-6 Tome 2 — SRH ; Loi EGalim 2018-938.',
          conclusion:
            "Le SRH présente un équilibre [excédentaire / déficitaire / à surveiller]. Recommandations : [maintien du tarif / ajustement / négociation marché denrées].",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  stocks: (etab) => ({
    analyse: {
      reformulation:
        "Tenue de l'inventaire physique et comptable des stocks de denrées et fournitures, valorisation au CMUP, identification des stocks dormants et des dépréciations.",
      cadre:
        "Article 168 GBCP (inventaire) ; M9-6 Tome 1 (stocks) ; PCG art. 213-32 (valorisation) ; règle interne : article sans mouvement > 12 mois = stock dormant à déclasser.",
      analyse:
        "Réaliser un inventaire physique annuel avant clôture, rapprocher avec le stock théorique (Op@le), valoriser au CMUP, identifier les écarts (vols, casses, périmés), provisionner les stocks dormants ou périmés, justifier toute mise au rebut par un PV signé.",
      conclusion:
        "Tout écart inventaire > seuil de tolérance doit faire l'objet d'une investigation et d'un PV de constat. Les stocks dormants > 12 mois doivent être déclassés et provisionnés. La sincérité du compte de stock conditionne la sincérité du compte de résultat.",
      source: 'Art. 168 GBCP ; M9-6 Tome 1 ; PCG art. 213-32.',
    },
    livrables: [
      {
        type: 'note',
        titre: 'PV d\'inventaire physique — clôture',
        contenu: noteInterne({
          titre: 'PV d\'inventaire physique des stocks — exercice [N]',
          contexte:
            "Inventaire physique réalisé le [date] au sein de " + etab + ", en présence de [noms et qualités], conformément à l'article 168 GBCP.",
          analyse:
            "Stock comptable théorique : [X] € — stock physique constaté : [Y] € — écart : [Z] €. [N] articles dormants identifiés (> 12 mois sans mouvement) pour [V] €. Articles périmés ou détériorés : [détail].",
          recommandation:
            "Constatation de l'écart en compte 603 / 7037, déclassement et mise au rebut des articles dormants/périmés sur PV, provisionnement éventuel. Signature conjointe ordonnateur / agent comptable.",
          ref: 'Art. 168 GBCP ; M9-6 Tome 1.',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  rapprochement: (etab) => ({
    analyse: {
      reformulation:
        "État de rapprochement mensuel entre le solde du compte au Trésor (DFT — relevé 515) et la comptabilité Op@le de l'EPLE, justification de tous les suspens.",
      cadre:
        "Article 47 GBCP (concordance permanente des disponibilités) ; M9-6 Tome 1 § 3.1.3 (état de rapprochement) ; instructions DGFiP — comptes Trésor.",
      analyse:
        "Établir mensuellement l'état de rapprochement : solde DFT, solde compte 515100 Op@le, recettes/dépenses non encore enregistrées d'un côté ou de l'autre, identification de chaque suspens par date et nature. Tout écart non justifié sous 30 jours doit faire l'objet d'une note d'investigation.",
      conclusion:
        "Un rapprochement non fait ou un suspens non justifié engage la responsabilité de l'agent comptable (Ordonnance 2022-408). Le PV de rapprochement mensuel est une pièce constitutive de la qualité comptable.",
      source: 'Art. 47 GBCP ; M9-6 Tome 1 § 3.1.3.',
    },
    livrables: [
      {
        type: 'note',
        titre: 'Note d\'investigation — suspens > 30 jours',
        contenu: noteInterne({
          titre: 'Investigation suspens bancaire — compte 515100',
          contexte:
            "Lors du rapprochement bancaire de " + etab + " au [date], un suspens d'un montant de [X] € (sens : [débit/crédit]) demeure non résorbé depuis plus de 30 jours.",
          analyse:
            "Origine probable : [virement non identifié / chèque non débité / opération comptable non passée]. Recherches effectuées : [historique DFT, contact services prescripteurs]. Risque : [encaissement non titré / dépense non comptabilisée].",
          recommandation:
            "Régulariser sous [délai] par [titre de recette / DP / écriture d'attente compte 471 ou 472 documentée]. Tracer dans la piste d'audit.",
          ref: 'Art. 47 GBCP ; M9-6 Tome 1 § 3.1.3.',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  voyages: (etab) => ({
    analyse: {
      reformulation:
        "Encadrement comptable et financier des sorties et voyages scolaires : autorisation CA, budget équilibré, encaissement des participations familles, gratuité des accompagnateurs, fonds sociaux pour familles en difficulté.",
      cadre:
        "Circulaire n° 2011-117 du 3 août 2011 et circulaire du 16 juillet 2024 (mise à jour) ; Code éducation art. R.421-20 (compétence du CA) ; principe de gratuité des accompagnateurs ; loi EGalim et CCP pour les marchés > seuils.",
      analyse:
        "Pour chaque voyage : vérifier l'acte du CA autorisant la programmation et le financement, le budget prévisionnel équilibré (recettes familles + subventions = dépenses), la liste nominative des participants, la souscription d'une assurance, l'absence de coût supporté par les accompagnateurs, le traitement des familles en difficulté (FSL/FSC).",
      conclusion:
        "Tout déséquilibre du budget voyage doit être absorbé par les fonds propres ou refusé. Les voyages > seuils CCP doivent suivre une procédure adaptée. Un suivi distinct par voyage (compte ad hoc) facilite la lisibilité et l'audit.",
      source: 'Circulaires 2011-117 et 16/07/2024 ; Code éducation art. R.421-20 ; CCP.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Alerte — déséquilibre budgétaire voyage',
        contenu: mailOrdonnateur({
          objet: 'Voyage scolaire [intitulé] — déséquilibre budgétaire',
          etablissement: etab,
          constat:
            "Le budget prévisionnel du voyage [intitulé] présente un déficit de [X] € (recettes familles + subventions = [R] € ; dépenses prévisionnelles = [D] €).",
          ref: 'Circulaire 2011-117 du 3 août 2011 ; circulaire du 16 juillet 2024 ; Code éducation art. R.421-20.',
          demande:
            "- équilibrer le budget par une subvention complémentaire ou une révision des dépenses ;\n- présenter au CA un acte budgétaire rectificatif ;\n- à défaut, surseoir à l'engagement des dépenses.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  depenses: (etab) => ({
    analyse: {
      reformulation:
        "Chaîne de la dépense publique : engagement, liquidation, ordonnancement par l'ordonnateur ; visa et paiement par l'agent comptable. Contrôle des pièces justificatives et des seuils CCP.",
      cadre:
        "Articles 30-33 GBCP (chaîne de la dépense) ; arrêté du 25 juillet 2013 (PJ obligatoires) ; décret 2013-269 (délai global de paiement 30 jours, intérêts moratoires) ; décrets 2025-1386 et 2025-1383 (seuils CCP 2026).",
      analyse:
        "Pour chaque demande de paiement (DP) : vérifier l'engagement préalable, la liquidation (service fait + montant), la PJ conforme à l'arrêté du 25/07/2013, le créancier et le RIB, le respect du seuil de procédure CCP, le délai de paiement de 30 jours. Suspendre toute DP irrégulière (art. 38 GBCP).",
      conclusion:
        "Le dépassement du DGP de 30 jours déclenche automatiquement les intérêts moratoires (à charge de l'EPLE). Tout paiement irrégulier engage la responsabilité du comptable. La traçabilité de la chaîne (engagement → DP → paiement) est essentielle pour l'audit.",
      source: 'Art. 30-33 GBCP ; Arrêté du 25/07/2013 ; Décret 2013-269 ; Décrets 2025-1386/1383.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Alerte délai global de paiement (DGP)',
        contenu: mailOrdonnateur({
          objet: 'Dépassement du délai global de paiement — risque d\'intérêts moratoires',
          etablissement: etab,
          constat:
            "Au [date], [N] demandes de paiement de " + etab + " présentent un délai global supérieur à 30 jours, exposant l'établissement à des intérêts moratoires automatiques (estimation : [X] €).",
          ref: 'Décret n° 2013-269 du 29 mars 2013 ; article L.2192-13 du Code de la commande publique.',
          demande:
            "- accélérer la transmission des DP par les services prescripteurs ;\n- automatiser dans Op@le la notification J-25 ;\n- présenter un état mensuel du DGP au CODIR.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'controle-caisse': (etab) => ({
    analyse: {
      reformulation:
        "Contrôle inopiné de la caisse et des disponibilités du comptable et des régisseurs : vérification du billetage, concordance encaisse théorique / encaisse constatée, respect du plafond.",
      cadre:
        "Article 47 GBCP (contrôle inopiné des disponibilités) ; M9-6 Tome 1 (caisse, plafond, PV mensuel) ; Décret 2019-798 (régies, contrôle annuel obligatoire).",
      analyse:
        "Réaliser au moins un contrôle inopiné par an (régie) et mensuel (caisse comptable) : compter physiquement billets et pièces, comparer à l'encaisse théorique du journal de caisse, vérifier le plafond réglementaire, contrôler la sécurisation (coffre, accès), établir un PV signé contradictoirement.",
      conclusion:
        "Tout écart de caisse doit être justifié immédiatement ou inscrit en compte d'attente (476/477) puis investigué. Le plafond dépassé entraîne reversement immédiat. Un manque de caisse non justifié engage la responsabilité personnelle du régisseur (Ordonnance 2022-408).",
      source: 'Art. 47 GBCP ; M9-6 Tome 1 ; Décret 2019-798.',
    },
    livrables: [
      {
        type: 'note',
        titre: 'PV de contrôle inopiné de caisse',
        contenu: noteInterne({
          titre: 'PV de contrôle inopiné — caisse [régie/comptable]',
          contexte:
            "Contrôle inopiné effectué le [date] à [heure] dans " + etab + ", en présence de [régisseur/agent comptable] et de [témoin].",
          analyse:
            "Encaisse théorique (journal de caisse) : [X] € — encaisse constatée (billetage) : [Y] € — écart : [Z] €. Plafond réglementaire : [P] €. Sécurisation : [coffre fermé / clés / accès limité].",
          recommandation:
            "[Aucune anomalie / Régularisation par compte d'attente 476 ou 477 et investigation sous [délai]]. PV signé contradictoirement et joint au registre des contrôles.",
          ref: 'Art. 47 GBCP ; M9-6 Tome 1 ; Décret 2019-798 art. 18.',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'budgets-annexes': (etab) => ({
    analyse: {
      reformulation:
        "Gestion des budgets annexes (CFA, GRETA, restauration mutualisée, mission de formation continue) rattachés à l'EPLE support : vote, exécution, compensation des mouvements de trésorerie via le compte 185000.",
      cadre:
        "M9-6 Tome 2 § 2.1.2.3.2 (budgets annexes) ; compte 185000 (compensation parfaite des mouvements BP/BA) ; Code éducation art. R.421-58 (vote par le CA de l'EPLE support).",
      analyse:
        "Pour chaque BA : vérifier l'acte de rattachement, le vote par le CA, l'autonomie d'exécution budgétaire, le suivi distinct des résultats, la compensation parfaite du compte 185000 (somme des mouvements = 0 à tout moment), la qualité des conventions de mutualisation.",
      conclusion:
        "Un compte 185000 non équilibré traduit une erreur de comptabilisation à corriger immédiatement. Tout BA en déficit récurrent doit faire l'objet d'un plan de redressement présenté au CA. La séparation des résultats BA/BP est essentielle.",
      source: 'M9-6 Tome 2 § 2.1.2.3.2 ; Compte 185000 ; Code éducation art. R.421-58.',
    },
    livrables: [
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — situation des budgets annexes',
        contenu: extraitRapportCA({
          section: 'Section — Budgets annexes (exercice [N])',
          constat:
            "L'EPLE support " + etab + " porte [N] budget(s) annexe(s) : [liste]. Résultats N : [détail par BA]. Solde compte 185000 au 31/12 : [X] € (objectif : 0 €).",
          ref: 'M9-6 Tome 2 § 2.1.2.3.2 ; compte 185000 ; Code éducation art. R.421-58.',
          conclusion:
            "Les BA sont [équilibrés / un BA en déficit nécessite un plan de redressement]. La compensation du compte 185000 est [parfaite / à régulariser]. L'agent comptable atteste la séparation des résultats.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'analyse-financiere': (etab) => ({
    analyse: {
      reformulation:
        "Analyse financière de l'EPLE selon la méthodologie M9-6 § 4.5.3 : FDR, BFR, trésorerie, DRFN, CAF, ratios prudentiels et tendances pluriannuelles.",
      cadre:
        "M9-6 § 4.5.3 (méthodologie) ; rapport IGAENR 2016-071 (modèle FDRM, indicateurs, seuils) ; article 211 GBCP (compte financier et CAF).",
      analyse:
        "Calculer FDR, BFR, trésorerie en valeur absolue ET en jours de DRFN (× 365 / DRFN). Apprécier la relation fondamentale FDR = BFR + Trésorerie. Comparer à N-1, N-2. Analyser la CAF comme indicateur de soutenabilité. Seuils prudentiels : FDR ≥ 30 jours (alerte < 15 jours).",
      conclusion:
        "Une trajectoire dégradée (FDR en baisse, CAF négative) appelle un plan de redressement présenté au CA et à la collectivité. Une trésorerie surabondante peut justifier un prélèvement après vote du CA. L'analyse doit éclairer les décisions budgétaires.",
      source: 'M9-6 § 4.5.3 ; IGAENR 2016-071 ; Art. 211 GBCP.',
    },
    livrables: [
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — analyse financière annuelle',
        contenu: extraitRapportCA({
          section: 'Section — Analyse financière (exercice [N])',
          constat:
            "Au 31/12/[N], " + etab + " présente : FDR = [X] € ([J1] j de DRFN) ; BFR = [Y] € ([J2] j) ; Trésorerie = [Z] € ([J3] j) ; CAF = [C] €. Évolution N-2/N-1/N : [tendance].",
          ref: 'M9-6 § 4.5.3 ; IGAENR 2016-071.',
          conclusion:
            "La situation financière est [solide / fragile / en alerte]. Recommandations : [maintien / reconstitution du FDR / prélèvement / plan de redressement]. La relation FDR = BFR + Trésorerie est [vérifiée / écart de [E] € à investiguer].",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  ordonnateur: (etab) => ({
    analyse: {
      reformulation:
        "Contrôle de la qualité d'ordonnateur du chef d'établissement et de ses délégataires : accréditation auprès de l'agent comptable, signatures, séparation des fonctions, actes budgétaires.",
      cadre:
        "Article 10 GBCP (séparation ordonnateur/comptable) ; Code éducation art. R.421-13 (le chef d'établissement est ordonnateur) ; arrêté du 25 juillet 2013 (formulaire d'accréditation et spécimens de signature).",
      analyse:
        "Vérifier : la production des actes d'accréditation (ordonnateur principal et délégataires), les spécimens de signature à jour, l'absence de cumul ordonnateur/comptable (séparation stricte), la régularité des actes budgétaires (BI, DBM, vote CA, transmission tutelle), la mise à jour à chaque changement de personne.",
      conclusion:
        "Toute DP signée par une personne non accréditée doit être suspendue (art. 38 GBCP — défaut de qualité). Tout changement d'ordonnateur ou de délégataire impose la transmission immédiate d'une nouvelle accréditation à l'agent comptable.",
      source: 'Art. 10 GBCP ; Code éducation art. R.421-13 ; Arrêté du 25 juillet 2013.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Demande d\'accréditation — nouvel ordonnateur/délégataire',
        contenu: mailOrdonnateur({
          objet: 'Accréditation ordonnateur/délégataire — formalisation requise',
          etablissement: etab,
          constat:
            "Suite au changement intervenu le [date] ([prise de fonction / délégation], M./Mme [Nom Prénom]), l'agent comptable n'a pas réceptionné l'acte d'accréditation et le spécimen de signature.",
          ref: 'Article 10 du décret 2012-1246 (GBCP) ; arrêté du 25 juillet 2013 ; Code éducation art. R.421-13.',
          demande:
            "- transmettre sans délai le formulaire officiel d'accréditation signé ;\n- joindre le spécimen de signature et l'acte de nomination/délégation ;\n- dans l'attente, les DP signées par cette personne seront suspendues.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  organigramme: (etab) => ({
    analyse: {
      reformulation:
        "Organisation du service de l'agence comptable : organigramme fonctionnel, fiches de poste, séparation des tâches, délégations internes, plan de continuité.",
      cadre:
        "Code éducation art. R.421-9 (compétences du chef d'établissement et délégations) ; M9-6 (organisation des services) ; décret 2011-1716 (statut SG / adjoint gestionnaire) ; principe CICF de séparation des tâches.",
      analyse:
        "Vérifier : l'existence d'un organigramme à jour, la définition claire des rôles (ordonnateur, SG, agent comptable, fondés de pouvoir, régisseurs), la séparation effective des tâches incompatibles (engagement / liquidation / paiement), la formalisation des délégations, l'identification d'un suppléant pour chaque poste critique.",
      conclusion:
        "Un cumul de tâches incompatibles ou l'absence de suppléant fragilise le contrôle interne et expose à des fraudes. L'organigramme doit être actualisé à chaque mouvement et porté à la connaissance des services prescripteurs.",
      source: 'Code éducation art. R.421-9 ; M9-6 ; Décret 2011-1716 ; CICF.',
    },
    livrables: [
      {
        type: 'note',
        titre: 'Note interne — actualisation de l\'organigramme',
        contenu: noteInterne({
          titre: 'Actualisation de l\'organigramme fonctionnel — agence comptable',
          contexte:
            "À la suite des mouvements intervenus dans l'équipe de " + etab + " ([liste]), l'organigramme fonctionnel est mis à jour au [date].",
          analyse:
            "Répartition des fonctions : [ordonnateur, SG, agent comptable, fondés de pouvoir, régisseurs]. Séparation des tâches incompatibles : [vérifiée]. Suppléances identifiées pour [postes critiques]. Délégations formalisées : [liste].",
          recommandation:
            "Diffuser l'organigramme actualisé aux services prescripteurs et l'afficher dans l'agence. Mettre à jour les profils Op@le et les habilitations en cohérence.",
          ref: 'Code éducation art. R.421-9 ; M9-6 — organisation des services.',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'piste-audit': (etab) => ({
    analyse: {
      reformulation:
        "Tenue d'une piste d'audit chronologique : traçabilité de tous les contrôles effectués, anomalies relevées et actions correctives par l'agent comptable.",
      cadre:
        "Décret 2011-775 (CICF) : obligation de tracer les contrôles. M9-6 (qualité comptable) : journal des opérations. ISA 230 : documentation des travaux d'audit. Ordonnance 2022-408 (RGP) : la traçabilité est une preuve de diligence du comptable.",
      analyse:
        "Chaque événement (contrôle, anomalie, action corrective, document vérifié, suspension de paiement) est horodaté, rattaché à un module et à un auditeur. La piste alimente directement le PV contradictoire et permet à l'AC de démontrer les diligences accomplies en cas de mise en cause.",
      conclusion:
        "Une piste d'audit incomplète prive l'AC de moyens de défense devant le juge financier. Elle doit être tenue en continu, exportée mensuellement (CSV) et archivée avec le compte financier.",
      source: 'Décret 2011-775 ; M9-6 ; ISA 230 ; Ordonnance 2022-408.',
    },
    livrables: [
      {
        type: 'note',
        titre: "Note interne — protocole de tenue de la piste d'audit",
        contenu: noteInterne({
          titre: "Protocole de tenue de la piste d'audit — agence comptable",
          contexte:
            "Pour répondre aux obligations CICF et garantir la traçabilité des diligences de l'AC sur " + etab + ", un protocole unique de saisie de la piste d'audit est arrêté.",
          analyse:
            "Tout contrôle effectué (caisse, rapprochement, vérification DP, contrôle régie...) est saisi le jour même : type d'action, module concerné, détail, auteur. Toute anomalie ou irrégularité est saisie sous le type approprié et donne lieu à une action corrective tracée.",
          recommandation:
            "Export CSV mensuel archivé avec le compte financier. Revue trimestrielle par l'AC. Le défaut de saisie expose l'AC en cas de contentieux RGP.",
          ref: 'Décret 2011-775 ; M9-6 ; Ordonnance 2022-408.',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  pv: (etab) => ({
    analyse: {
      reformulation:
        "Production du procès-verbal contradictoire d'audit : synthèse des constats, observations de l'audité, recommandations et plan d'action.",
      cadre:
        "Article 47 GBCP (PV de vérification) ; M9-6 (modèle de PV consolidé annuel) ; Code éducation art. R.421-77 (présentation au CA) ; principe du contradictoire (obligation de recueillir les observations de l'ordonnateur avant clôture).",
      analyse:
        "Le PV recense les anomalies par module (collecteur centralisé), expose le cadre juridique violé, formule des recommandations opérationnelles et fixe des délais. Phase provisoire → phase contradictoire (15 jours pour observations) → phase définitive signée par AC + ordonnateur.",
      conclusion:
        "Un PV non contradictoire ou non transmis au CA est inopposable. Le PV définitif est transmis à la collectivité de rattachement et conservé 10 ans avec le compte financier.",
      source: 'Art. 47 GBCP ; M9-6 ; Code éducation art. R.421-77.',
    },
    livrables: [
      {
        type: 'mail',
        titre: "Transmission du PV provisoire à l'ordonnateur (phase contradictoire)",
        contenu: mailOrdonnateur({
          objet: "Transmission du PV d'audit provisoire — observations sous 15 jours",
          etablissement: etab,
          constat:
            "Vous trouverez ci-joint le procès-verbal d'audit provisoire portant sur l'exercice [N]. Il comporte [X] constats dont [Y] anomalies appelant régularisation.",
          ref: "Article 47 du décret n° 2012-1246 (GBCP) et M9-6 (modèle de PV) ; principe du contradictoire.",
          demande:
            "- examiner les constats détaillés en annexe ;\n- formuler vos observations écrites sous 15 jours ;\n- accuser réception de la présente transmission.\n\nÀ l'issue du délai, je clôturerai le PV en phase définitive et le présenterai au CA.",
        }),
      },
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — Présentation du PV définitif',
        contenu: extraitRapportCA({
          section: "PV d'audit définitif — exercice [N]",
          constat:
            "Le PV d'audit a recensé [X] constats, dont [Y] anomalies majeures. La phase contradictoire a permis [résorber Z anomalies / acter Z anomalies persistantes].",
          ref: "Article 47 GBCP ; M9-6 ; Code éducation art. R.421-77.",
          conclusion:
            "Le CA prend acte du PV définitif. Le plan d'action correctif annexé fixe les délais de régularisation. Le PV est transmis à la collectivité de rattachement.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'plan-controle': (etab) => ({
    analyse: {
      reformulation:
        "Élaboration du plan annuel de contrôle interne comptable et financier : hiérarchisation des contrôles selon les risques identifiés, fréquence et responsables.",
      cadre:
        "Décret 2011-775 (CICF) : obligation pour le comptable d'établir un plan de contrôle annuel. M9-6 : nomenclature des contrôles types. Cartop@le / ODICé : référentiel de risques EPLE. Articles 168-172 GBCP.",
      analyse:
        "Pour chaque processus à risque, définir : nature du contrôle (caisse, rapprochement, DP, régie...), fréquence (permanent / mensuel / trimestriel / annuel), niveau de risque, responsable, planning prévisionnel et critères de réalisation.",
      conclusion:
        "Le plan de contrôle est arrêté chaque année par l'AC avant le 31 janvier. Il est piloté en continu, ajusté en fonction des anomalies relevées et alimente le PV annuel.",
      source: 'Décret 2011-775 ; M9-6 ; Cartop@le ; Art. 168-172 GBCP.',
    },
    livrables: [
      {
        type: 'note',
        titre: 'Note interne — adoption du plan de contrôle annuel',
        contenu: noteInterne({
          titre: "Plan annuel de contrôle interne comptable et financier — exercice [N]",
          contexte:
            "En application du décret 2011-775 et de la M9-6, le plan annuel de contrôle de l'agence comptable de " + etab + " est arrêté pour l'exercice [N].",
          analyse:
            "Hiérarchisation des contrôles par niveau de risque (Cartop@le) : contrôles permanents (caisse, DP) ; contrôles mensuels (rapprochement bancaire, régies) ; contrôles trimestriels (stocks, voyages) ; contrôles annuels (inventaire, subventions).",
          recommandation:
            "Diffuser le plan aux services prescripteurs et aux ER. Suivi mensuel du taux de réalisation. Révision en septembre selon les anomalies relevées.",
          ref: 'Décret 2011-775 ; M9-6 ; Cartop@le.',
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'plan-action': (etab) => ({
    analyse: {
      reformulation:
        "Pilotage du plan d'action correctif issu de la cartographie des risques et des anomalies relevées en audit : recommandations, responsables, échéances et suivi de mise en œuvre.",
      cadre:
        "Décret 2011-775 (CICF) : obligation de traiter les risques identifiés. M9-6 : démarche d'amélioration continue de la qualité comptable. Cartop@le : actions correctives liées aux risques critiques (score ≥ 40).",
      analyse:
        "Chaque action est rattachée à un risque coté (P×I×M), avec recommandation opérationnelle, responsable nommément désigné, échéance datée et statut (À lancer / En cours / Réalisé). Les risques critiques imposent un délai court.",
      conclusion:
        "Une action en retard ou non suivie aggrave le risque résiduel et expose l'AC. Le plan d'action est revu en CA et alimente le PV. Les actions réalisées doivent être documentées (preuves archivées).",
      source: 'Décret 2011-775 ; M9-6 ; Cartop@le.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Rappel — actions correctives en retard',
        contenu: mailOrdonnateur({
          objet: "Plan d'action CICF — actions en retard à régulariser",
          etablissement: etab,
          constat:
            "Le suivi du plan d'action correctif fait apparaître [X] actions arrivées à échéance et non réalisées, dont [Y] portant sur des risques critiques (score ≥ 40).",
          ref: 'Décret 2011-775 (CICF) ; M9-6 — démarche qualité comptable.',
          demande:
            "- procéder à la mise en œuvre des actions listées en annexe ;\n- m'adresser un compte rendu écrit avec preuves de réalisation ;\n- proposer une nouvelle échéance pour les actions ne pouvant être tenues.\n\nLes actions non régularisées seront mentionnées dans le PV annuel.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  'cartographie-risques': (etab) => ({
    analyse: {
      reformulation:
        "Cartographie des risques comptables et financiers : identification, cotation (P × I × M) et hiérarchisation des risques sur les 11 processus métier des EPLE.",
      cadre:
        "Cartop@le / ODICé : référentiel national des 11 processus EPLE (caisse, dépenses, recettes, régies, stocks, voyages, restauration, bourses, fonds sociaux, marchés, immobilisations). Décret 2011-775 (CICF) : obligation d'identifier, hiérarchiser et traiter les risques. M9-6.",
      analyse:
        "Pour chaque risque : Probabilité (1-5), Impact (1-5), Maîtrise actuelle (1-5). Score = P × I × M. Risque critique ≥ 40 → plan d'action immédiat. Risque majeur 20-39 → action sous 3 mois. Risque moyen 10-19 → surveillance renforcée.",
      conclusion:
        "La cartographie est revue chaque année avant le plan de contrôle, et après chaque incident significatif. Elle est partagée avec l'ordonnateur et présentée au CA. Tout risque critique non traité expose la responsabilité de l'AC.",
      source: 'Cartop@le ; ODICé ; Décret 2011-775 ; M9-6.',
    },
    livrables: [
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — Cartographie des risques',
        contenu: extraitRapportCA({
          section: 'Cartographie des risques comptables et financiers — exercice [N]',
          constat:
            "La cartographie de " + etab + " recense [X] risques sur les 11 processus Cartop@le. [Y] risques critiques (score ≥ 40), [Z] risques majeurs (score 20-39). Processus les plus exposés : [lister].",
          ref: 'Cartop@le ; ODICé ; Décret 2011-775 ; M9-6.',
          conclusion:
            "Le plan d'action correctif annexé traite l'ensemble des risques critiques avec des échéances datées. La cartographie sera révisée fin [N+1] et après tout incident significatif.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  calendrier: (etab) => ({
    analyse: {
      reformulation:
        "Tenue du calendrier annuel de l'agent comptable : opérations à réaliser par mois (BI, BR, CF, DSN, TVA, inventaire, PV de caisse, contrôles régies...) à destination des ER.",
      cadre:
        "Code éducation art. R.421-77 (CF voté avant 30 avril N+1) ; Art. 175 GBCP (BI voté avant 1er janvier N) ; M9-6 (échéances obligatoires : DSN, TVA, inventaire, PV de caisse) ; circulaire 2011-117 (voyages).",
      analyse:
        "Chaque activité est paramétrée par : titre, catégorie, périodicité, mois de début/fin, échéance, responsable (AC / ER / AC+ER), criticité, ER affectés. Le suivi de réalisation horodaté permet d'identifier les retards.",
      conclusion:
        "Le non-respect du calendrier met l'AC en difficulté : retard de CF, défaut de DSN, contrôle DGFiP. Le calendrier est diffusé en septembre N-1 aux SG des ER, suivi mensuellement et révisé à mi-exercice.",
      source: 'Code éducation art. R.421-77 ; Art. 175 GBCP ; M9-6 ; Circ. 2011-117.',
    },
    livrables: [
      {
        type: 'mail',
        titre: 'Diffusion du calendrier aux SG des établissements rattachés',
        contenu: mailOrdonnateur({
          objet: "Calendrier annuel de l'agence comptable — exercice [N]",
          etablissement: etab,
          constat:
            "Vous trouverez ci-joint le calendrier annuel de l'agence comptable pour l'exercice [N], applicable à l'ensemble des établissements rattachés (ER).",
          ref: "Code éducation art. R.421-77 ; Art. 175 GBCP ; M9-6 ; circulaire n° 2011-117 (voyages).",
          demande:
            "- prendre connaissance des échéances applicables à votre établissement ;\n- intégrer ces dates dans votre calendrier de gestion ;\n- m'alerter sans délai en cas d'impossibilité de tenir une échéance.\n\nLe non-respect de ce calendrier met l'agent comptable en difficulté et fragilise la qualité comptable du groupement.",
        }),
      },
    ],
  }),

  // ════════════════════════════════════════════════════════════════════
  cockpit: (etab) => ({
    analyse: {
      reformulation:
        "Pilotage centralisé du contrôle interne via le cockpit : score de conformité, alertes cross-modules, suivi des risques critiques, parcours d'audit.",
      cadre:
        "Décret 2011-775 (CICF) : pilotage du dispositif de contrôle interne. M9-6 : indicateurs clés de qualité comptable (DSO, taux de recouvrement, retards de DP, anomalies caisse).",
      analyse:
        "Le cockpit agrège en temps réel : nombre d'anomalies par module, risques critiques non traités, actions correctives en retard, échéances calendrier proches, taux de réalisation du plan de contrôle. Il permet à l'AC de prioriser ses interventions.",
      conclusion:
        "Le cockpit doit être consulté quotidiennement par l'AC. Les indicateurs sont remontés mensuellement au SG et présentés trimestriellement en CA. Toute alerte rouge appelle une action documentée dans la piste d'audit.",
      source: 'Décret 2011-775 ; M9-6 ; Cartop@le.',
    },
    livrables: [
      {
        type: 'rapport',
        titre: 'Extrait rapport CA — Tableau de bord du contrôle interne',
        contenu: extraitRapportCA({
          section: 'Pilotage du contrôle interne comptable et financier — exercice [N]',
          constat:
            "Le tableau de bord de " + etab + " présente : score global de conformité [X %], [Y] risques critiques actifs, [Z] anomalies en cours, taux de réalisation du plan de contrôle [W %].",
          ref: 'Décret 2011-775 (CICF) ; M9-6 ; Cartop@le.',
          conclusion:
            "L'agence comptable assure un pilotage continu du dispositif. Les actions correctives prioritaires sont engagées et tracées dans la piste d'audit. Présentation trimestrielle au CA.",
        }),
      },
    ],
  }),
};

```

### FICHIER : src/lib/document-store.ts

```ts
// Stockage de documents (PDF, CSV) en base64 dans localStorage
const DOC_PREFIX = 'cic_expert_doc_';

export interface StoredDocument {
  id: string;
  nom: string;
  type: string;
  taille: number;
  date: string;
  base64: string;
  categorie: string;
}

export function saveDocument(doc: StoredDocument): void {
  try {
    localStorage.setItem(DOC_PREFIX + doc.id, JSON.stringify(doc));
  } catch { console.warn('Stockage document échoué (quota?)'); }
}

export function loadDocuments(categorie?: string): StoredDocument[] {
  const docs: StoredDocument[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DOC_PREFIX)) continue;
    try {
      const doc = JSON.parse(localStorage.getItem(key)!) as StoredDocument;
      if (!categorie || doc.categorie === categorie) docs.push(doc);
    } catch {}
  }
  return docs.sort((a, b) => b.date.localeCompare(a.date));
}

export function deleteDocument(id: string): void {
  localStorage.removeItem(DOC_PREFIX + id);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

```

### FICHIER : src/lib/export.ts

```ts
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

```

### FICHIER : src/lib/icon-map.ts

```ts
import {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp,
  Landmark, Package, Scale, GraduationCap, Heart, UtensilsCrossed,
  AlertTriangle, Target, Building, Building2, Map, GitFork, ListChecks,
  Calendar, CalendarDays, ClipboardList, BarChart3, Wallet,
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ElementType> = {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp,
  Landmark, Package, Scale, GraduationCap, Heart, UtensilsCrossed,
  AlertTriangle, Target, Building, Building2, Map, GitFork, ListChecks,
  Calendar, CalendarDays, ClipboardList, BarChart3, Wallet,
};

```

### FICHIER : src/lib/mapping-audit-risque-seed.ts

```ts
/**
 * Seed du mapping audit ↔ risque (Chantier 1).
 *
 * Couvre les ~45 points d'audit des 8 domaines et les rattache à un risque
 * de la cartographie + à une rubrique de scoring CICF.
 *
 * Domaines (cf. src/lib/audit-parcours.ts) :
 *   gouvernance-si · depenses · recettes · tresorerie ·
 *   comptes-tiers · stocks-immo · paie-rh · services-speciaux
 *
 * Rubriques de scoring (8) :
 *   cycle-depenses · cycle-recettes · tresorerie · comptes-tiers ·
 *   stocks-immos · paie-rh · services-speciaux · gouvernance-si
 */

export type RubriqueScoring =
  | 'cycle-depenses'
  | 'cycle-recettes'
  | 'tresorerie'
  | 'comptes-tiers'
  | 'stocks-immos'
  | 'paie-rh'
  | 'services-speciaux'
  | 'gouvernance-si';

export const RUBRIQUES_SCORING: { id: RubriqueScoring; label: string; couleur: string }[] = [
  { id: 'cycle-depenses', label: 'Cycle dépenses', couleur: 'hsl(var(--destructive))' },
  { id: 'cycle-recettes', label: 'Cycle recettes', couleur: 'hsl(var(--primary))' },
  { id: 'tresorerie', label: 'Trésorerie', couleur: 'hsl(220 75% 50%)' },
  { id: 'comptes-tiers', label: 'Comptes de tiers', couleur: 'hsl(280 60% 50%)' },
  { id: 'stocks-immos', label: 'Stocks & immos', couleur: 'hsl(35 85% 50%)' },
  { id: 'paie-rh', label: 'Paie & RH', couleur: 'hsl(160 70% 40%)' },
  { id: 'services-speciaux', label: 'Services spéciaux', couleur: 'hsl(20 80% 50%)' },
  { id: 'gouvernance-si', label: 'Gouvernance & SI', couleur: 'hsl(240 50% 40%)' },
];

export interface MappingSeed {
  domaine_id: string;
  point_index: number;
  point_libelle: string;
  risque_processus: string;
  risque_libelle: string;
  rubrique: RubriqueScoring;
  ponderation: number;
}

/**
 * Seed couvrant les principaux points d'audit.
 * Si le libellé exact n'est pas connu côté DB, le moteur fallback sur
 * domaine_id + point_index pour la correspondance.
 */
export const MAPPING_SEED: MappingSeed[] = [
  // ─── DÉPENSES ──────────────────────────────────────────────
  { domaine_id: 'depenses', point_index: 0, point_libelle: 'Validité de la liquidation', risque_processus: 'P05 — Cycle dépenses', risque_libelle: 'Liquidation erronée', rubrique: 'cycle-depenses', ponderation: 1.5 },
  { domaine_id: 'depenses', point_index: 1, point_libelle: 'Vérification des pièces justificatives', risque_processus: 'P05 — Cycle dépenses', risque_libelle: 'Pièces justificatives incomplètes', rubrique: 'cycle-depenses', ponderation: 1.2 },
  { domaine_id: 'depenses', point_index: 2, point_libelle: 'Disponibilité des crédits', risque_processus: 'P05 — Cycle dépenses', risque_libelle: 'Insuffisance de crédits (art. 38 GBCP)', rubrique: 'cycle-depenses', ponderation: 1.5 },
  { domaine_id: 'depenses', point_index: 3, point_libelle: 'Imputation budgétaire', risque_processus: 'P05 — Cycle dépenses', risque_libelle: 'Imputation budgétaire erronée', rubrique: 'cycle-depenses', ponderation: 1.0 },
  { domaine_id: 'depenses', point_index: 4, point_libelle: 'Demande de paiement (Op@le)', risque_processus: 'P05 — Cycle dépenses', risque_libelle: 'Paiement indu', rubrique: 'cycle-depenses', ponderation: 1.5 },
  { domaine_id: 'depenses', point_index: 5, point_libelle: 'Marchés et commande publique', risque_processus: 'P05 — Cycle dépenses', risque_libelle: 'Non-respect du CCP / saucissonnage', rubrique: 'cycle-depenses', ponderation: 1.3 },

  // ─── RECETTES ──────────────────────────────────────────────
  { domaine_id: 'recettes', point_index: 0, point_libelle: 'Constatation des droits', risque_processus: 'P02 — Cycle recettes', risque_libelle: 'Recette non constatée', rubrique: 'cycle-recettes', ponderation: 1.3 },
  { domaine_id: 'recettes', point_index: 1, point_libelle: 'Bourses nationales', risque_processus: 'P02 — Cycle recettes', risque_libelle: 'Paiement indu d\'une bourse', rubrique: 'cycle-recettes', ponderation: 1.5 },
  { domaine_id: 'recettes', point_index: 2, point_libelle: 'Fonds sociaux', risque_processus: 'P02 — Cycle recettes', risque_libelle: 'Aide sociale non justifiée', rubrique: 'cycle-recettes', ponderation: 1.2 },
  { domaine_id: 'recettes', point_index: 3, point_libelle: 'Restauration scolaire', risque_processus: 'P02 — Cycle recettes', risque_libelle: 'Différentiel ventes/encaissements restauration', rubrique: 'cycle-recettes', ponderation: 1.2 },
  { domaine_id: 'recettes', point_index: 4, point_libelle: 'Voyages scolaires', risque_processus: 'P02 — Cycle recettes', risque_libelle: 'Détournement sur voyages scolaires', rubrique: 'cycle-recettes', ponderation: 1.4 },
  { domaine_id: 'recettes', point_index: 5, point_libelle: 'Recouvrement des créances', risque_processus: 'P02 — Cycle recettes', risque_libelle: 'Non-recouvrement / déchéance quadriennale', rubrique: 'cycle-recettes', ponderation: 1.3 },
  { domaine_id: 'recettes', point_index: 6, point_libelle: 'Subventions', risque_processus: 'P02 — Cycle recettes', risque_libelle: 'Subvention non justifiée / perdue', rubrique: 'cycle-recettes', ponderation: 1.2 },

  // ─── TRÉSORERIE ────────────────────────────────────────────
  { domaine_id: 'tresorerie', point_index: 0, point_libelle: 'Rapprochement bancaire', risque_processus: 'P07 — Trésorerie', risque_libelle: 'Non-apurement des comptes financiers', rubrique: 'tresorerie', ponderation: 1.5 },
  { domaine_id: 'tresorerie', point_index: 1, point_libelle: 'Régies de recettes', risque_processus: 'P07 — Trésorerie', risque_libelle: 'Détournement de fonds en régie', rubrique: 'tresorerie', ponderation: 1.5 },
  { domaine_id: 'tresorerie', point_index: 2, point_libelle: 'Régies d\'avances', risque_processus: 'P07 — Trésorerie', risque_libelle: 'Régie d\'avances non justifiée', rubrique: 'tresorerie', ponderation: 1.4 },
  { domaine_id: 'tresorerie', point_index: 3, point_libelle: 'Contrôle de caisse', risque_processus: 'P07 — Trésorerie', risque_libelle: 'Écart de caisse', rubrique: 'tresorerie', ponderation: 1.3 },
  { domaine_id: 'tresorerie', point_index: 4, point_libelle: 'Suivi du compte 185000', risque_processus: 'P07 — Trésorerie', risque_libelle: 'Déséquilibre 185000 — BA', rubrique: 'tresorerie', ponderation: 1.2 },

  // ─── COMPTES DE TIERS ──────────────────────────────────────
  { domaine_id: 'comptes-tiers', point_index: 0, point_libelle: 'Comptes d\'attente (471/472/473)', risque_processus: 'P09 — Comptes de tiers', risque_libelle: 'Comptes d\'attente non apurés', rubrique: 'comptes-tiers', ponderation: 1.5 },
  { domaine_id: 'comptes-tiers', point_index: 1, point_libelle: 'Comptes de régularisation (486/487)', risque_processus: 'P09 — Comptes de tiers', risque_libelle: 'Charges/produits constatés d\'avance non régularisés', rubrique: 'comptes-tiers', ponderation: 1.2 },
  { domaine_id: 'comptes-tiers', point_index: 2, point_libelle: 'Justification des soldes', risque_processus: 'P09 — Comptes de tiers', risque_libelle: 'Soldes de tiers non justifiés', rubrique: 'comptes-tiers', ponderation: 1.3 },

  // ─── STOCKS & IMMOBILISATIONS ──────────────────────────────
  { domaine_id: 'stocks-immo', point_index: 0, point_libelle: 'Inventaire des stocks denrées', risque_processus: 'P08 — Stocks & immos', risque_libelle: 'Stocks denrées non inventoriés', rubrique: 'stocks-immos', ponderation: 1.3 },
  { domaine_id: 'stocks-immo', point_index: 1, point_libelle: 'Suivi des immobilisations', risque_processus: 'P08 — Stocks & immos', risque_libelle: 'Immobilisations non recensées', rubrique: 'stocks-immos', ponderation: 1.2 },
  { domaine_id: 'stocks-immo', point_index: 2, point_libelle: 'Amortissements', risque_processus: 'P08 — Stocks & immos', risque_libelle: 'Plan d\'amortissement non appliqué', rubrique: 'stocks-immos', ponderation: 1.0 },

  // ─── PAIE & RH ─────────────────────────────────────────────
  { domaine_id: 'paie-rh', point_index: 0, point_libelle: 'Liquidation paie', risque_processus: 'P06 — Paie / RH', risque_libelle: 'Paiement indu d\'une rémunération', rubrique: 'paie-rh', ponderation: 1.5 },
  { domaine_id: 'paie-rh', point_index: 1, point_libelle: 'Charges sociales', risque_processus: 'P06 — Paie / RH', risque_libelle: 'Charges sociales mal liquidées', rubrique: 'paie-rh', ponderation: 1.2 },
  { domaine_id: 'paie-rh', point_index: 2, point_libelle: 'Indemnités et primes', risque_processus: 'P06 — Paie / RH', risque_libelle: 'Indemnité versée sans pièce', rubrique: 'paie-rh', ponderation: 1.3 },

  // ─── SERVICES SPÉCIAUX (BA, CFA, GRETA) ───────────────────
  { domaine_id: 'services-speciaux', point_index: 0, point_libelle: 'Budget annexe — équilibre', risque_processus: 'P10 — Services spéciaux', risque_libelle: 'BA déséquilibré', rubrique: 'services-speciaux', ponderation: 1.4 },
  { domaine_id: 'services-speciaux', point_index: 1, point_libelle: 'CFA / GRETA — comptes', risque_processus: 'P10 — Services spéciaux', risque_libelle: 'Comptes CFA / GRETA non justifiés', rubrique: 'services-speciaux', ponderation: 1.3 },

  // ─── GOUVERNANCE & SI ──────────────────────────────────────
  { domaine_id: 'gouvernance-si', point_index: 0, point_libelle: 'Délégations de signature', risque_processus: 'P01 — Gouvernance', risque_libelle: 'Acte signé sans délégation', rubrique: 'gouvernance-si', ponderation: 1.5 },
  { domaine_id: 'gouvernance-si', point_index: 1, point_libelle: 'Accréditation de l\'ordonnateur', risque_processus: 'P01 — Gouvernance', risque_libelle: 'Ordonnateur non accrédité', rubrique: 'gouvernance-si', ponderation: 1.5 },
  { domaine_id: 'gouvernance-si', point_index: 2, point_libelle: 'Habilitations Op@le', risque_processus: 'P11 — Système d\'information', risque_libelle: 'Habilitations SI non maîtrisées', rubrique: 'gouvernance-si', ponderation: 1.2 },
  { domaine_id: 'gouvernance-si', point_index: 3, point_libelle: 'Piste d\'audit', risque_processus: 'P01 — Gouvernance', risque_libelle: 'Piste d\'audit incomplète', rubrique: 'gouvernance-si', ponderation: 1.3 },
];

```

### FICHIER : src/lib/maturite-cicf.ts

```ts
/**
 * Calcul du score de maturité CICF (Contrôle Interne Comptable et Financier).
 * Inspiré de la grille AMUE / DGFiP / IGAENR pour les EPLE :
 *   - 5 axes pondérés (gouvernance, périmètre, contrôles, traçabilité, restitution)
 *   - 4 niveaux : Initial · Reproductible · Maîtrisé · Optimisé
 *   - Score global 0-100 dérivé d'agrégats Supabase (audits, points, PV).
 */
import { supabase } from '@/integrations/supabase/client';

export type NiveauMaturite = 'initial' | 'reproductible' | 'maitrise' | 'optimise';

export interface MaturiteAxe {
  id: string;
  label: string;
  score: number; // 0-100
  description: string;
  poids: number;
}

export interface MaturiteCICF {
  scoreGlobal: number; // 0-100
  niveau: NiveauMaturite;
  axes: MaturiteAxe[];
  kpis: {
    auditsTotal: number;
    auditsClotures: number;
    pointsAudites: number;
    pointsTotal: number;
    tauxCouverture: number; // %
    anomaliesOuvertes: number;
    pvEnAttente: number;
    pvFinalises: number;
    agentsActifs: number;
    etablissementsCouverts: number;
  };
}

export const NIVEAU_LABEL: Record<NiveauMaturite, { label: string; color: string; bg: string; description: string }> = {
  initial: { label: 'Initial', color: 'text-destructive', bg: 'bg-destructive/10', description: 'Contrôles non formalisés, démarche à structurer.' },
  reproductible: { label: 'Reproductible', color: 'text-amber-600', bg: 'bg-amber-500/10', description: 'Procédures en place mais perfectibles.' },
  maitrise: { label: 'Maîtrisé', color: 'text-blue-600', bg: 'bg-blue-500/10', description: 'CICF opérationnel et tracé. Cible M9-6.' },
  optimise: { label: 'Optimisé', color: 'text-emerald-600', bg: 'bg-emerald-500/10', description: 'Excellence : pilotage continu et amélioration permanente.' },
};

function niveauFromScore(s: number): NiveauMaturite {
  if (s >= 80) return 'optimise';
  if (s >= 60) return 'maitrise';
  if (s >= 35) return 'reproductible';
  return 'initial';
}

export async function computeMaturiteCICF(groupementId: string): Promise<MaturiteCICF> {
  // Charge les agrégats nécessaires en parallèle
  const [auditsRes, pointsRes, pvRes, agentsRes, etabsRes] = await Promise.all([
    supabase.from('audits').select('id,status').eq('groupement_id', groupementId),
    supabase.from('audit_points_results').select('id,status,audit_id'),
    supabase.from('pv_contradictoires').select('id,status').eq('groupement_id', groupementId),
    supabase.from('agents').select('id,actif,role').eq('groupement_id', groupementId),
    supabase.from('etablissements').select('id,actif').eq('groupement_id', groupementId),
  ]);

  const audits = auditsRes.data ?? [];
  const auditIds = new Set(audits.map(a => a.id));
  const points = (pointsRes.data ?? []).filter(p => auditIds.has(p.audit_id));
  const pvs = pvRes.data ?? [];
  const agents = agentsRes.data ?? [];
  const etabs = etabsRes.data ?? [];

  const auditsClotures = audits.filter(a => a.status !== 'en_cours').length;
  const pointsAudites = points.filter(p => p.status !== 'non_audite').length;
  const pointsTotal = points.length;
  const anomaliesOuvertes = points.filter(p => p.status === 'anomalie_majeure' || p.status === 'anomalie_mineure').length;
  const pvEnAttente = pvs.filter(p => p.status === 'envoye').length;
  const pvFinalises = pvs.filter(p => p.status === 'finalise').length;
  const agentsActifs = agents.filter(a => a.actif).length;
  const etablissementsCouverts = etabs.filter(e => e.actif).length;
  const auditedEtab = new Set(audits.map((a: any) => a.etablissement_id)).size;

  const tauxCouverture = pointsTotal > 0 ? Math.round((pointsAudites / pointsTotal) * 100) : 0;

  // Axes pondérés
  const hasGouvernance = ['agent_comptable', 'ordonnateur'].every(r => agents.some(a => a.role === r && a.actif));
  const axeGouvernance = Math.min(100,
    (hasGouvernance ? 50 : 0) +
    Math.min(50, agentsActifs * 8),
  );

  const axePerimetre = etabs.length === 0 ? 0 : Math.round((auditedEtab / Math.max(1, etablissementsCouverts)) * 100);

  const axeControles = tauxCouverture;

  const axeTracabilite = pointsTotal === 0 ? 0 :
    Math.round(((pointsAudites - anomaliesOuvertes * 0.3) / Math.max(1, pointsTotal)) * 100);

  const axeRestitution = audits.length === 0 ? 0 :
    Math.round(((pvFinalises * 100 + pvEnAttente * 60 + auditsClotures * 30) /
      Math.max(1, audits.length * 100)) * 100) / 1;

  const axes: MaturiteAxe[] = [
    { id: 'gouvernance', label: 'Gouvernance & équipe', score: Math.round(axeGouvernance), poids: 0.20, description: 'AC, ordonnateur, équipe dans Paramètres.' },
    { id: 'perimetre', label: "Périmètre d'audit", score: Math.round(axePerimetre), poids: 0.15, description: 'Couverture des établissements du groupement.' },
    { id: 'controles', label: 'Exécution des contrôles', score: Math.round(axeControles), poids: 0.30, description: 'Points M9-6 audités sur la période.' },
    { id: 'tracabilite', label: 'Traçabilité & qualité', score: Math.max(0, Math.round(axeTracabilite)), poids: 0.20, description: 'Anomalies documentées et corrigées.' },
    { id: 'restitution', label: 'Restitution contradictoire', score: Math.min(100, Math.round(axeRestitution)), poids: 0.15, description: 'PV envoyés et finalisés.' },
  ];

  const scoreGlobal = Math.round(axes.reduce((s, a) => s + a.score * a.poids, 0));

  return {
    scoreGlobal,
    niveau: niveauFromScore(scoreGlobal),
    axes,
    kpis: {
      auditsTotal: audits.length,
      auditsClotures,
      pointsAudites,
      pointsTotal,
      tauxCouverture,
      anomaliesOuvertes,
      pvEnAttente,
      pvFinalises,
      agentsActifs,
      etablissementsCouverts,
    },
  };
}

```

### FICHIER : src/lib/maturite-pdf.ts

```ts
/**
 * Export du rapport exécutif "Maturité CICF" au format PDF A4 portrait.
 * 1 page de garde + 1 page synthèse (KPI + axes + recommandations).
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type MaturiteCICF, NIVEAU_LABEL } from './maturite-cicf';

export async function exportMaturitePDF(data: MaturiteCICF, groupementLabel: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18;
  const niveau = NIVEAU_LABEL[data.niveau];

  // ─── Page 1 : page de garde ───────────────────────────────
  doc.setFillColor(30, 64, 175); // primary
  doc.rect(0, 0, W, 70, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RAPPORT EXÉCUTIF', M, 20);
  doc.setFontSize(24);
  doc.text('Maturité CICF', M, 32);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Contrôle Interne Comptable et Financier — EPLE', M, 42);
  doc.text(String(groupementLabel), M, 50);
  doc.setFontSize(9);
  doc.text('Édité le ' + new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), M, 58);

  // Bandeau score
  doc.setFillColor(255, 255, 255);
  doc.setTextColor(30, 64, 175);
  doc.roundedRect(M, 90, W - 2 * M, 60, 4, 4, 'F');
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, 90, W - 2 * M, 60, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('SCORE GLOBAL', M + 8, 102);

  doc.setFontSize(56);
  doc.setTextColor(30, 64, 175);
  doc.text(`${data.scoreGlobal}`, M + 8, 130);
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('/ 100', M + 8 + doc.getTextWidth(`${data.scoreGlobal}`) + 4, 130);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(`Niveau ${niveau.label}`, W - M - 8, 110, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const desc = doc.splitTextToSize(niveau.description, 80);
  doc.text(desc, W - M - 8, 120, { align: 'right' });

  // KPI synthèse
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicateurs clés', M, 170);

  autoTable(doc, {
    startY: 175,
    margin: { left: M, right: M },
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Taux de couverture des contrôles', `${data.kpis.tauxCouverture} %`],
      ['Points audités / total', `${data.kpis.pointsAudites} / ${data.kpis.pointsTotal}`],
      ['Anomalies ouvertes', `${data.kpis.anomaliesOuvertes}`],
      ['Audits réalisés', `${data.kpis.auditsTotal} (dont ${data.kpis.auditsClotures} clôturés)`],
      ['PV en attente / finalisés', `${data.kpis.pvEnAttente} / ${data.kpis.pvFinalises}`],
      ['Établissements couverts', `${data.kpis.etablissementsCouverts}`],
      ['Agents actifs', `${data.kpis.agentsActifs}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });

  // Footer page 1
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Référentiel : Décret GBCP 2012-1246 · Instruction codificatrice M9-6 · CIC Expert Pro', W / 2, H - 10, { align: 'center' });

  // ─── Page 2 : axes & recommandations ─────────────────────
  doc.addPage();
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, W, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Détail des 5 axes — ${groupementLabel}`, M, 12);

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  autoTable(doc, {
    startY: 28,
    margin: { left: M, right: M },
    head: [['Axe', 'Score', 'Poids', 'Description']],
    body: data.axes.map(a => [a.label, `${a.score}/100`, `${Math.round(a.poids * 100)} %`, a.description]),
    theme: 'striped',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9, valign: 'middle' },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' }, 2: { halign: 'center' } },
  });

  // Recommandations dérivées
  const reco = buildRecommandations(data);
  const yReco = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Recommandations prioritaires", M, yReco);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let y = yReco + 6;
  reco.forEach((r, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${r}`, W - 2 * M);
    doc.text(lines, M, y);
    y += lines.length * 4 + 2;
  });

  // Footer page 2
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Page 2/2 — Édité le ${new Date().toLocaleString('fr-FR')}`, W / 2, H - 10, { align: 'center' });

  doc.save(`maturite-cicf-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function buildRecommandations(d: MaturiteCICF): string[] {
  const r: string[] = [];
  d.axes.sort((a, b) => a.score - b.score).slice(0, 3).forEach(a => {
    if (a.id === 'gouvernance' && a.score < 80) r.push("Compléter la fiche Gouvernance dans Paramètres : Agent comptable, Ordonnateur, équipe permanente et délégations de signature.");
    if (a.id === 'perimetre' && a.score < 80) r.push("Étendre le périmètre d'audit aux établissements du groupement non encore couverts (cycle annuel obligatoire M9-6).");
    if (a.id === 'controles' && a.score < 80) r.push("Augmenter le taux de couverture en lançant un audit minimal M9-6 (2 points par domaine) sur les EPLE non audités.");
    if (a.id === 'tracabilite' && a.score < 80) r.push("Documenter chaque anomalie majeure avec un constat, une action corrective, un responsable et un délai (Plan d'action).");
    if (a.id === 'restitution' && a.score < 80) r.push("Finaliser les PV en envoyant la procédure contradictoire à l'ordonnateur (lien magique sécurisé) puis clore le PV.");
  });
  if (d.kpis.anomaliesOuvertes > 5) r.push(`${d.kpis.anomaliesOuvertes} anomalies restent ouvertes : prioriser leur traitement dans le Plan d'action.`);
  if (d.scoreGlobal >= 80) r.push("Excellent niveau : maintenir la dynamique par une supervision continue et un audit thématique trimestriel.");
  return r.length ? r : ['Aucune recommandation prioritaire — continuez sur cette dynamique.'];
}

```

### FICHIER : src/lib/plan-action-engine.ts

```ts
/**
 * Plan d'Action — Moteur de règles métier extensible
 *
 * Génère automatiquement les actions correctives à partir :
 *   1. de la cartographie des risques (criticité ≥ Moyenne, score ≥ 20)
 *   2. des anomalies détectées dans les PV d'audit (mineures et majeures)
 *
 * Réf. : M9-6, Décret GBCP 2012-1246, Code de l'éducation, CCP.
 *
 * Le moteur est extensible : `LIBRARY_REGLES` peut être enrichie par l'AC via
 * l'interface (table miroir `regles_plan_action_custom` en localStorage).
 */
import { CartoRisque } from './types';
import { loadState, saveState } from './store';

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export type CriticiteAction = 'critique' | 'majeure' | 'moyenne' | 'faible';
export type StatutAction = 'a_faire' | 'en_cours' | 'fait' | 'abandonne' | 'archive';
export type OrigineAction = 'risque' | 'audit' | 'regle' | 'manuelle';

export interface ActionPlan {
  id: string;
  origine: OrigineAction;
  origineRef: string;        // ex : `risque:abc-123`, `audit:xyz/point:5`, `regle:R07`
  origineLabel: string;      // libellé lisible : "Risque cartographié — Recouvrement"
  libelle: string;
  description?: string;
  criticite: CriticiteAction;
  responsable: string;       // depuis table `agents`
  responsableRole?: string;  // ex : 'agent_comptable', 'ordonnateur'
  echeance: string;          // YYYY-MM-DD
  statut: StatutAction;
  reference: string;         // M9-6, GBCP art X, etc.
  cycle?: string;            // Recettes / Dépenses / Trésorerie / RH / CICF / Régies
  commentaires: string;
  createdAt: string;
  updatedAt: string;
  alerteEnvoyee?: string;    // YYYY-MM-DD : date du dernier mail J-15
}

export interface RegleMetier {
  code: string;              // R01, R02…
  libelle: string;           // Condition métier
  action: string;            // Texte de l'action
  reference: string;
  criticite: CriticiteAction;
  responsableRole: string;   // 'agent_comptable' | 'ordonnateur' | 'sg' | 'regisseur'
  cycle: string;
  detection: (ctx: PlanActionContext) => boolean;
  custom?: boolean;
}

export interface PlanActionContext {
  risques: CartoRisque[];
  rapprochementBancaireDateLast?: string;       // YYYY-MM-DD
  fondsSociauxDelibCA?: boolean;
  arreteRegieAJour?: boolean;
  pvCaisseRegieDateLast?: string;
  organigrammeDateLast?: string;
  lettrage411AJour?: boolean;
  dgpDepasseMandats?: number;
  soldesAnormaux?: string[];                    // ex : ['C/411 créditeur', 'C/47 non soldé']
  achatsRepetitifsFournisseur?: { fournisseur: string; montant: number }[];
  modalitesFseFormalisees?: boolean;
  comptesAttentePerimees?: string[];
  signatureDelegationsAJour?: boolean;
  inventaireAnnuelFait?: boolean;
  tauxRecouvrement411?: number;                 // %
  bourses_versees_a_temps?: boolean;
  controleInterneSupervision2?: boolean;
  rapportAcAnnuelTransmis?: boolean;
  rattachementChargesProduitsClos?: boolean;
  marchesReconductionsRevues?: boolean;
}

// ════════════════════════════════════════════════════════════════════
// CALCUL ÉCHÉANCE
// ════════════════════════════════════════════════════════════════════

export function calculerEcheance(criticite: CriticiteAction, base = new Date()): string {
  const d = new Date(base);
  const mois = criticite === 'critique' ? 1 : criticite === 'majeure' ? 3 : criticite === 'moyenne' ? 6 : 12;
  d.setMonth(d.getMonth() + mois);
  return d.toISOString().slice(0, 10);
}

export function criticiteFromScore(score: number): CriticiteAction {
  if (score >= 40) return 'critique';
  if (score >= 27) return 'majeure';
  if (score >= 20) return 'moyenne';
  return 'faible';
}

// ════════════════════════════════════════════════════════════════════
// BIBLIOTHÈQUE — 20 RÈGLES MÉTIER M9-6 / GBCP / Code éducation
// ════════════════════════════════════════════════════════════════════

export const LIBRARY_REGLES: RegleMetier[] = [
  {
    code: 'R01',
    libelle: 'Absence de délibération du CA sur les modalités d\'attribution des fonds sociaux',
    action: 'Faire voter en CA les modalités d\'attribution des fonds sociaux. Sans cette délibération, l\'agent comptable ne peut valablement payer les aides.',
    reference: 'Code éducation art. R421-20 + Circulaire 2017-122',
    criticite: 'critique',
    responsableRole: 'ordonnateur',
    cycle: 'Aides sociales',
    detection: ctx => ctx.fondsSociauxDelibCA === false,
  },
  {
    code: 'R02',
    libelle: 'Absence d\'arrêté de régie à jour',
    action: 'Prendre/actualiser l\'arrêté constitutif de la régie et le transmettre au comptable assignataire.',
    reference: 'Décret 2019-798 + GBCP art. 22',
    criticite: 'majeure',
    responsableRole: 'ordonnateur',
    cycle: 'Régies',
    detection: ctx => ctx.arreteRegieAJour === false,
  },
  {
    code: 'R03',
    libelle: 'Rapprochement bancaire non effectué depuis plus de 30 jours',
    action: 'Procéder au rapprochement bancaire du mois, justifier les écarts, viser l\'état.',
    reference: 'M9-6 § 3.4 — Trésorerie',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Trésorerie',
    detection: ctx => {
      if (!ctx.rapprochementBancaireDateLast) return true;
      const diff = (Date.now() - new Date(ctx.rapprochementBancaireDateLast).getTime()) / 86400000;
      return diff > 30;
    },
  },
  {
    code: 'R04',
    libelle: 'Soldes anormaux détectés en balance (C/411 créditeur, C/515 créditeur, C/47 non soldé…)',
    action: 'Analyser et corriger les soldes anormaux identifiés, justifier chaque écart en commentaire de balance.',
    reference: 'M9-6 § 4.2 — Contrôles comptables quotidiens',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Comptabilité',
    detection: ctx => (ctx.soldesAnormaux?.length ?? 0) > 0,
  },
  {
    code: 'R05',
    libelle: 'Délai global de paiement dépassé sur plusieurs mandats',
    action: 'Analyser les causes de dépassement du DGP, prévoir le paiement des intérêts moratoires (décret 2013-269).',
    reference: 'Décret 2013-269 + CCP art. R2192-10',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Dépenses',
    detection: ctx => (ctx.dgpDepasseMandats ?? 0) > 0,
  },
  {
    code: 'R06',
    libelle: 'Absence de PV de caisse récent pour une régie',
    action: 'Réaliser un contrôle inopiné de la régie et établir le PV de caisse contradictoire.',
    reference: 'GBCP art. 22 + Décret 2019-798 art. 13',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Régies',
    detection: ctx => {
      if (!ctx.pvCaisseRegieDateLast) return true;
      const diff = (Date.now() - new Date(ctx.pvCaisseRegieDateLast).getTime()) / 86400000;
      return diff > 180;
    },
  },
  {
    code: 'R07',
    libelle: 'Modalités de fonctionnement du FSE / fonds sociaux non formalisées',
    action: 'Formaliser les modalités de fonctionnement dans une commission fonds sociaux et faire délibérer le CA.',
    reference: 'Circulaire 2017-122 + Code éducation R421-20',
    criticite: 'majeure',
    responsableRole: 'sg',
    cycle: 'Aides sociales',
    detection: ctx => ctx.modalitesFseFormalisees === false,
  },
  {
    code: 'R08',
    libelle: 'Commande publique : achats répétés chez un même fournisseur dépassant les seuils',
    action: 'Mettre en place un marché formalisé — risque de saucissonnage caractérisé. Vérifier les seuils 2026 (40k€ HT travaux/fournitures, 143k€ HT pour collectivités).',
    reference: 'CCP art. R2122-8 + Décret 2025-XXX seuils 2026',
    criticite: 'critique',
    responsableRole: 'ordonnateur',
    cycle: 'Commande publique',
    detection: ctx => (ctx.achatsRepetitifsFournisseur?.some(f => f.montant > 40000) ?? false),
  },
  {
    code: 'R09',
    libelle: 'Absence de lettrage C/411 à jour',
    action: 'Procéder au lettrage des comptes familles, identifier les impayés et engager les relances graduées.',
    reference: 'M9-6 § 4.5 — Recouvrement',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'Recettes',
    detection: ctx => ctx.lettrage411AJour === false,
  },
  {
    code: 'R10',
    libelle: 'Organigramme fonctionnel non à jour',
    action: 'Mettre à jour l\'organigramme fonctionnel CICF en lien avec les paramètres agents et le faire viser par l\'AC.',
    reference: 'M9-6 § 2 — Organisation comptable + GBCP art. 215',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => {
      if (!ctx.organigrammeDateLast) return true;
      const diff = (Date.now() - new Date(ctx.organigrammeDateLast).getTime()) / 86400000;
      return diff > 365;
    },
  },
  {
    code: 'R11',
    libelle: 'Comptes d\'attente non apurés en fin d\'exercice (C/471, C/472, C/473, C/486)',
    action: 'Apurer les comptes d\'attente, justifier les soldes restants par pièce et inscrire les régularisations sur l\'exercice.',
    reference: 'M9-6 § 4.2.3 + GBCP art. 65',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Comptabilité',
    detection: ctx => (ctx.comptesAttentePerimees?.length ?? 0) > 0,
  },
  {
    code: 'R12',
    libelle: 'Délégations de signature non à jour pour la rentrée',
    action: 'Renouveler les arrêtés de délégation de signature de l\'ordonnateur et de l\'AC, les transmettre aux services concernés.',
    reference: 'GBCP art. 10 + Code éducation R421-13',
    criticite: 'majeure',
    responsableRole: 'ordonnateur',
    cycle: 'CICF',
    detection: ctx => ctx.signatureDelegationsAJour === false,
  },
  {
    code: 'R13',
    libelle: 'Inventaire physique annuel non réalisé',
    action: 'Procéder à l\'inventaire physique des immobilisations et des stocks, rapprocher avec la comptabilité, ajuster.',
    reference: 'M9-6 § 4.6 — Inventaire + GBCP art. 53',
    criticite: 'majeure',
    responsableRole: 'sg',
    cycle: 'Comptabilité',
    detection: ctx => ctx.inventaireAnnuelFait === false,
  },
  {
    code: 'R14',
    libelle: 'Taux de recouvrement C/411 inférieur à 90%',
    action: 'Renforcer la procédure de recouvrement : relances, mise en demeure, OTI à transmettre à l\'huissier des finances publiques.',
    reference: 'M9-6 § 4.5.3 — Recouvrement',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Recettes',
    detection: ctx => (ctx.tauxRecouvrement411 ?? 100) < 90,
  },
  {
    code: 'R15',
    libelle: 'Bourses non versées dans les délais réglementaires',
    action: 'Procéder à la régularisation des bourses, vérifier les listes de bénéficiaires (TS) avec le rectorat.',
    reference: 'Code éducation D531-1 et suivants',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Aides sociales',
    detection: ctx => ctx.bourses_versees_a_temps === false,
  },
  {
    code: 'R16',
    libelle: 'Supervision de 2ᵉ niveau du contrôle interne non assurée',
    action: 'Mettre en place la supervision documentée de 2ᵉ niveau (revue par l\'AC des contrôles de 1ᵉʳ niveau).',
    reference: 'M9-6 § 2.3 — CICF',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => ctx.controleInterneSupervision2 === false,
  },
  {
    code: 'R17',
    libelle: 'Rapport annuel de l\'agent comptable non transmis aux autorités',
    action: 'Établir et transmettre le rapport annuel de l\'AC au conseil d\'administration et au rectorat.',
    reference: 'GBCP art. 215 + Code éducation R421-77',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => ctx.rapportAcAnnuelTransmis === false,
  },
  {
    code: 'R18',
    libelle: 'Rattachement charges/produits non clôturé en fin d\'exercice',
    action: 'Procéder aux opérations de rattachement (PCA / CCA), constater les produits à recevoir et charges à payer.',
    reference: 'M9-6 § 4.4 — Opérations d\'inventaire + GBCP art. 65',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Comptabilité',
    detection: ctx => ctx.rattachementChargesProduitsClos === false,
  },
  {
    code: 'R19',
    libelle: 'Reconductions de marchés non revues avant échéance',
    action: 'Recenser les marchés en cours, statuer sur les reconductions, anticiper les nouvelles consultations.',
    reference: 'CCP art. R2112-4 + R2122-8',
    criticite: 'moyenne',
    responsableRole: 'ordonnateur',
    cycle: 'Commande publique',
    detection: ctx => ctx.marchesReconductionsRevues === false,
  },
  {
    code: 'R20',
    libelle: 'Risque cartographié de criticité ≥ Moyenne sans action associée',
    action: 'Définir le plan de traitement du risque (mitigation, transfert, acceptation) et formaliser l\'action corrective.',
    reference: 'M9-6 § 2.2 — Cartographie des risques',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => ctx.risques.some(r => r.probabilite * r.impact * r.maitrise >= 20 && !r.action),
  },
];

// ════════════════════════════════════════════════════════════════════
// MOTEUR DE GÉNÉRATION
// ════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'plan_action_v2';
const REGLES_CUSTOM_KEY = 'plan_action_regles_custom';

export function loadActions(): ActionPlan[] {
  return loadState<ActionPlan[]>(STORAGE_KEY, []);
}

export function saveActions(actions: ActionPlan[]): void {
  saveState(STORAGE_KEY, actions);
}

export function loadReglesCustom(): RegleMetier[] {
  return loadState<RegleMetier[]>(REGLES_CUSTOM_KEY, []).map(r => ({
    ...r,
    custom: true,
    detection: () => false, // les règles custom sont déclenchables manuellement uniquement
  }));
}

export function saveReglesCustom(regles: RegleMetier[]): void {
  saveState(REGLES_CUSTOM_KEY, regles.map(({ detection, ...rest }) => rest as any));
}

export function getAllRegles(): RegleMetier[] {
  return [...LIBRARY_REGLES, ...loadReglesCustom()];
}

/**
 * Génère les actions à partir du contexte + cartographie + anomalies PV.
 * Idempotent : ne duplique pas une action déjà existante (clé sur origineRef).
 */
export function genererActions(
  ctx: PlanActionContext,
  pvAnomalies: { auditId: string; pointId: string; libelle: string; severity: 'mineure' | 'majeure'; cycle?: string }[] = [],
  existing: ActionPlan[] = loadActions(),
): ActionPlan[] {
  const map = new Map(existing.map(a => [a.origineRef, a]));
  const now = new Date().toISOString();

  // 1) Règles métier
  for (const regle of LIBRARY_REGLES) {
    try {
      if (!regle.detection(ctx)) continue;
    } catch {
      continue;
    }
    const ref = `regle:${regle.code}`;
    if (map.has(ref) && map.get(ref)!.statut !== 'archive') continue;
    map.set(ref, {
      id: crypto.randomUUID(),
      origine: 'regle',
      origineRef: ref,
      origineLabel: `Règle ${regle.code} — ${regle.libelle}`,
      libelle: regle.action,
      criticite: regle.criticite,
      responsable: '',
      responsableRole: regle.responsableRole,
      echeance: calculerEcheance(regle.criticite),
      statut: 'a_faire',
      reference: regle.reference,
      cycle: regle.cycle,
      commentaires: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2) Cartographie des risques (criticité ≥ Moyenne, score ≥ 20)
  for (const r of ctx.risques) {
    const score = r.probabilite * r.impact * r.maitrise;
    if (score < 20) continue;
    const crit = criticiteFromScore(score);
    const ref = `risque:${r.id}`;
    const existing = map.get(ref);
    if (existing && existing.statut !== 'archive') {
      // Mise à jour de la criticité si elle a changé
      if (existing.criticite !== crit) {
        existing.criticite = crit;
        existing.updatedAt = now;
      }
      continue;
    }
    map.set(ref, {
      id: crypto.randomUUID(),
      origine: 'risque',
      origineRef: ref,
      origineLabel: `Risque cartographié [${r.processus}] — ${r.risque}`,
      libelle: r.action || `Traiter le risque "${r.risque}" identifié dans le processus ${r.processus}.`,
      description: `Score : ${score} (P=${r.probabilite} × I=${r.impact} × M=${r.maitrise})`,
      criticite: crit,
      responsable: r.responsable || '',
      echeance: r.echeance || calculerEcheance(crit),
      statut: 'a_faire',
      reference: 'M9-6 § 2.2 — Cartographie des risques',
      cycle: r.processus,
      commentaires: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  // 3) Anomalies PV audit
  for (const a of pvAnomalies) {
    const ref = `audit:${a.auditId}/point:${a.pointId}`;
    if (map.has(ref) && map.get(ref)!.statut !== 'archive') continue;
    const crit: CriticiteAction = a.severity === 'majeure' ? 'majeure' : 'moyenne';
    map.set(ref, {
      id: crypto.randomUUID(),
      origine: 'audit',
      origineRef: ref,
      origineLabel: `PV audit — ${a.libelle}`,
      libelle: `Corriger l'anomalie ${a.severity} relevée : "${a.libelle}".`,
      criticite: crit,
      responsable: '',
      echeance: calculerEcheance(crit),
      statut: 'a_faire',
      reference: 'M9-6 — Audit sur place',
      cycle: a.cycle || 'CICF',
      commentaires: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  // 4) Archivage des risques disparus / criticité tombée
  const refsActifs = new Set([
    ...ctx.risques.filter(r => r.probabilite * r.impact * r.maitrise >= 20).map(r => `risque:${r.id}`),
  ]);
  for (const a of map.values()) {
    if (a.origine === 'risque' && a.statut !== 'archive' && a.statut !== 'fait' && !refsActifs.has(a.origineRef)) {
      a.statut = 'archive';
      a.commentaires = (a.commentaires ? a.commentaires + '\n' : '') + `Archivée auto le ${now.slice(0, 10)} — risque retiré ou criticité < Moyenne.`;
      a.updatedAt = now;
    }
  }

  return Array.from(map.values()).sort((x, y) => {
    const orderCrit = { critique: 0, majeure: 1, moyenne: 2, faible: 3 };
    if (orderCrit[x.criticite] !== orderCrit[y.criticite]) return orderCrit[x.criticite] - orderCrit[y.criticite];
    return x.echeance.localeCompare(y.echeance);
  });
}

// ════════════════════════════════════════════════════════════════════
// ALERTES J-15
// ════════════════════════════════════════════════════════════════════

export function getActionsJ15(actions: ActionPlan[] = loadActions()): ActionPlan[] {
  const today = new Date();
  const j15 = new Date(today.getTime() + 15 * 86400000);
  return actions.filter(a => {
    if (a.statut === 'fait' || a.statut === 'abandonne' || a.statut === 'archive') return false;
    if (!a.echeance) return false;
    const ech = new Date(a.echeance);
    return ech <= j15 && ech >= today;
  });
}

export function getActionsEnRetard(actions: ActionPlan[] = loadActions()): ActionPlan[] {
  const today = new Date().toISOString().slice(0, 10);
  return actions.filter(a => a.echeance && a.echeance < today && a.statut !== 'fait' && a.statut !== 'abandonne' && a.statut !== 'archive');
}

export function buildMailtoAlerteJ15(action: ActionPlan, emailResp: string): string {
  const subject = encodeURIComponent(`[Plan d'action CICF] Échéance dans 15 jours — ${action.origineLabel}`);
  const body = encodeURIComponent(
    `Bonjour,\n\n` +
    `Cette action du plan d'action CICF arrive à échéance le ${action.echeance} (dans moins de 15 jours).\n\n` +
    `▶ Action : ${action.libelle}\n` +
    `▶ Origine : ${action.origineLabel}\n` +
    `▶ Criticité : ${action.criticite.toUpperCase()}\n` +
    `▶ Référence : ${action.reference}\n\n` +
    `Merci de mettre à jour le statut dans l'application ou de me notifier des éventuels obstacles.\n\n` +
    `Cordialement,\nL'agent comptable`
  );
  return `mailto:${emailResp}?subject=${subject}&body=${body}`;
}

// ════════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════════

export interface PlanActionStats {
  total: number;
  parStatut: Record<StatutAction, number>;
  parCriticite: Record<CriticiteAction, number>;
  enRetard: number;
  j15: number;
  tauxAvancement: number;
}

export function computeStats(actions: ActionPlan[] = loadActions()): PlanActionStats {
  const actifs = actions.filter(a => a.statut !== 'archive');
  const parStatut: Record<StatutAction, number> = { a_faire: 0, en_cours: 0, fait: 0, abandonne: 0, archive: 0 };
  const parCriticite: Record<CriticiteAction, number> = { critique: 0, majeure: 0, moyenne: 0, faible: 0 };
  for (const a of actions) {
    parStatut[a.statut]++;
    if (a.statut !== 'archive') parCriticite[a.criticite]++;
  }
  const total = actifs.length;
  const fait = parStatut.fait;
  return {
    total,
    parStatut,
    parCriticite,
    enRetard: getActionsEnRetard(actions).length,
    j15: getActionsJ15(actions).length,
    tauxAvancement: total > 0 ? Math.round((fait / total) * 100) : 0,
  };
}

// ════════════════════════════════════════════════════════════════════
// LIBELLÉS
// ════════════════════════════════════════════════════════════════════

export const STATUT_LABELS: Record<StatutAction, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  fait: 'Fait',
  abandonne: 'Abandonné',
  archive: 'Archivée',
};

export const CRITICITE_LABELS: Record<CriticiteAction, string> = {
  critique: 'Critique',
  majeure: 'Majeure',
  moyenne: 'Moyenne',
  faible: 'Faible',
};

export const CRITICITE_COLORS: Record<CriticiteAction, string> = {
  critique: 'bg-destructive text-destructive-foreground',
  majeure: 'bg-orange-500 text-white',
  moyenne: 'bg-amber-400 text-amber-950',
  faible: 'bg-muted text-muted-foreground',
};

```

### FICHIER : src/lib/rapport-maturite-pdf.ts

```ts
/**
 * Génération du Rapport de Maturité CICF — PDF officiel A4 portrait.
 * Charte République française. Marianne (fallback Helvetica).
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ScoreGroupement, ScoreEtablissement } from './scoring-engine';
import { niveauScoring } from './scoring-engine';

interface RapportContext {
  groupementLabel: string;
  academie: string;
  lyceeSiegeNom?: string;
  logoLyceeUrl?: string;
  signatureAcUrl?: string;
  agentComptableNom: string;
  destinataires: string[];
  periodeDebut: string;
  periodeFin: string;
  messageAc?: string;
  estConsolide: boolean;
  etablissementCible?: ScoreEtablissement;
  pvNum?: number;
  actionsCritiques?: { libelle: string; criticite: string; echeance?: string; responsable?: string; reference?: string }[];
  inclureAnnexes?: boolean;
}

const RF_BLUE: [number, number, number] = [30, 64, 175];
const RF_RED: [number, number, number] = [220, 38, 38];
const FOOTER_GREY: [number, number, number] = [110, 110, 110];

async function imgToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise(r => {
      const reader = new FileReader();
      reader.onloadend = () => r(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

function header(doc: jsPDF, ctx: RapportContext, logoData?: string) {
  const W = 210;
  doc.setFillColor(...RF_BLUE);
  doc.rect(0, 0, W, 22, 'F');
  if (logoData) {
    try { doc.addImage(logoData, 'PNG', 8, 4, 14, 14); } catch { /* ignore */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold').setFontSize(9);
  doc.text('RÉPUBLIQUE FRANÇAISE', 26, 9);
  doc.setFont('helvetica', 'normal').setFontSize(8);
  doc.text(`Ministère de l'Éducation nationale · Académie de ${ctx.academie}`, 26, 14);
  doc.text(ctx.groupementLabel, 26, 18.5);
  doc.setFont('helvetica', 'bold').setFontSize(7);
  doc.text('CICF', W - 12, 12, { align: 'right' });
}

function footer(doc: jsPDF, ctx: RapportContext, pageNum: number, total: number) {
  const W = 210, H = 297;
  doc.setDrawColor(...RF_BLUE).setLineWidth(0.3).line(15, H - 14, W - 15, H - 14);
  doc.setFont('helvetica', 'italic').setFontSize(7).setTextColor(...FOOTER_GREY);
  doc.text(`Document confidentiel — destiné à l'ordonnateur et au rectorat`, W / 2, H - 10, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(7);
  doc.text(`${ctx.groupementLabel} · ${new Date().toLocaleDateString('fr-FR')}`, 15, H - 6);
  doc.text(`Page ${pageNum}/${total}`, W - 15, H - 6, { align: 'right' });
}

export async function genererRapportMaturite(score: ScoreGroupement, ctx: RapportContext): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18;

  const logoData = ctx.logoLyceeUrl ? await imgToDataUrl(ctx.logoLyceeUrl) : null;
  const sigData = ctx.signatureAcUrl ? await imgToDataUrl(ctx.signatureAcUrl) : null;

  const cible = ctx.estConsolide ? null : ctx.etablissementCible!;
  const scoreCible = cible ? cible.score_global : score.score_global;
  const rubriquesCible = cible ? cible.rubriques : score.rubriques;
  const niveau = niveauScoring(scoreCible);

  // ─── PAGE DE GARDE ──────────────────────────────────────────
  // Bandeau bleu ministériel
  doc.setFillColor(...RF_BLUE).rect(0, 0, W, 36, 'F');
  doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(11);
  doc.text('RÉPUBLIQUE FRANÇAISE', M, 14);
  doc.setFont('helvetica', 'normal').setFontSize(9);
  doc.text(`Ministère de l'Éducation nationale, de l'Enseignement supérieur et de la Recherche`, M, 21);
  doc.text(`Académie de ${ctx.academie}`, M, 26);
  doc.text(ctx.groupementLabel, M, 31);
  // Liseré rouge
  doc.setFillColor(...RF_RED).rect(0, 36, W, 1.5, 'F');

  // Logo lycée siège centré
  if (logoData) {
    try { doc.addImage(logoData, 'PNG', W / 2 - 22, 56, 44, 44); } catch { /* ignore */ }
  } else {
    doc.setDrawColor(180, 180, 180).setFillColor(245, 245, 250).roundedRect(W / 2 - 22, 56, 44, 44, 3, 3, 'FD');
    doc.setFont('helvetica', 'italic').setFontSize(8).setTextColor(120, 120, 120);
    doc.text('Logo lycée siège', W / 2, 80, { align: 'center' });
  }
  if (ctx.lyceeSiegeNom) {
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(80, 80, 80);
    doc.text(ctx.lyceeSiegeNom, W / 2, 108, { align: 'center' });
  }

  // Titre
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...RF_BLUE);
  const titre = doc.splitTextToSize('RAPPORT DE MATURITÉ DU CONTRÔLE INTERNE COMPTABLE ET FINANCIER', W - 40);
  doc.text(titre, W / 2, 130, { align: 'center' });

  // Sous-titre
  doc.setFont('helvetica', 'normal').setFontSize(13).setTextColor(60, 60, 60);
  doc.text(ctx.estConsolide ? 'Groupement comptable consolidé' : (cible?.etablissement_label ?? ''), W / 2, 152, { align: 'center' });

  // Score en avant
  doc.setFillColor(...RF_BLUE).roundedRect(W / 2 - 35, 165, 70, 38, 4, 4, 'F');
  doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(40);
  doc.text(String(scoreCible), W / 2 - 8, 192);
  doc.setFont('helvetica', 'normal').setFontSize(12);
  doc.text('/100', W / 2 + 14, 192);
  doc.setFontSize(10);
  doc.text(niveau.label, W / 2, 200, { align: 'center' });

  // Métadonnées
  doc.setTextColor(40, 40, 40).setFont('helvetica', 'normal').setFontSize(10);
  const metaY = 220;
  doc.text(`Période couverte : du ${new Date(ctx.periodeDebut).toLocaleDateString('fr-FR')} au ${new Date(ctx.periodeFin).toLocaleDateString('fr-FR')}`, M, metaY);
  doc.text(`Auteur : ${ctx.agentComptableNom}`, M, metaY + 6);
  doc.text(`Destinataires : ${ctx.destinataires.join(' · ') || '—'}`, M, metaY + 12);
  doc.text(`Date d'édition : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, M, metaY + 18);

  // Devise pied de page
  doc.setFont('helvetica', 'italic').setFontSize(10).setTextColor(...RF_BLUE);
  doc.text('Liberté · Égalité · Fraternité', W / 2, H - 18, { align: 'center' });
  doc.setDrawColor(...RF_RED).setLineWidth(0.5).line(W / 2 - 30, H - 16, W / 2 + 30, H - 16);
  footer(doc, ctx, 1, 4);

  // ─── PAGE 2 — SYNTHÈSE EXÉCUTIVE ─────────────────────────────
  doc.addPage();
  header(doc, ctx, logoData ?? undefined);
  let y = 32;
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(16);
  doc.text('Synthèse exécutive', M, y); y += 4;
  doc.setDrawColor(...RF_BLUE).setLineWidth(0.4).line(M, y, M + 50, y); y += 8;

  // Score
  doc.setFillColor(245, 245, 250).roundedRect(M, y, W - 2 * M, 32, 3, 3, 'F');
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(28);
  doc.text(`${scoreCible}`, M + 8, y + 22);
  doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(80, 80, 80);
  doc.text('/ 100', M + 8 + doc.getTextWidth(`${scoreCible}`) + 2, y + 22);
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...RF_BLUE);
  doc.text(`Niveau : ${niveau.label}`, W - M - 8, y + 14, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(80, 80, 80);
  doc.text(ctx.estConsolide ? `Moyenne pondérée des ${score.etablissements.length} établissements du groupement.` : '', W - M - 8, y + 22, { align: 'right' });
  y += 38;

  // 3 forts / 3 vigilances
  const sortedRub = [...rubriquesCible].sort((a, b) => b.score - a.score);
  const forts = sortedRub.slice(0, 3);
  const fragiles = [...sortedRub].reverse().slice(0, 3);

  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(40, 40, 40);
  doc.text('Points forts', M, y);
  doc.text('Points de vigilance', W / 2 + 4, y);
  y += 5;
  forts.forEach((r, i) => {
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(16, 122, 87);
    doc.text(`✓ ${r.label} — ${r.score}/100`, M, y + i * 5);
  });
  fragiles.forEach((r, i) => {
    doc.setFontSize(9).setTextColor(...RF_RED);
    doc.text(`✗ ${r.label} — ${r.score}/100`, W / 2 + 4, y + i * 5);
  });
  y += 22;

  // Message AC
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(40, 40, 40);
  doc.text("Mot de l'agent comptable", M, y); y += 5;
  doc.setFont('helvetica', 'italic').setFontSize(9).setTextColor(60, 60, 60);
  const msg = ctx.messageAc?.trim() ||
    "Le présent rapport synthétise l'état du contrôle interne comptable et financier sur la période visée. Il s'inscrit dans la démarche de maîtrise des risques exigée par l'article 170 du décret GBCP du 7 novembre 2012 et par l'instruction codificatrice M9-6.";
  const msgLines = doc.splitTextToSize(msg, W - 2 * M);
  doc.text(msgLines, M, y);
  y += msgLines.length * 4 + 8;

  // Signature AC
  if (sigData) {
    try { doc.addImage(sigData, 'PNG', W - M - 50, y, 50, 20); } catch { /* ignore */ }
  }
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(80, 80, 80);
  doc.text(`L'agent comptable, ${ctx.agentComptableNom}`, W - M, y + 24, { align: 'right' });

  footer(doc, ctx, 2, 4);

  // ─── PAGE 3 — DÉTAIL DES 8 RUBRIQUES ─────────────────────────
  doc.addPage();
  header(doc, ctx, logoData ?? undefined);
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(16);
  doc.text('Détail par rubrique CICF', M, 32);

  autoTable(doc, {
    startY: 40,
    margin: { left: M, right: M },
    head: [['Rubrique', 'Score', 'Niveau', 'Anomalies maj.', 'Anomalies min.', 'Actions OK', 'Retard']],
    body: rubriquesCible.map(r => [
      r.label,
      `${r.score}/100`,
      niveauScoring(r.score).label,
      String(r.details.anomalies_majeures),
      String(r.details.anomalies_mineures),
      String(r.details.actions_cloturees),
      String(r.details.actions_retard),
    ]),
    theme: 'grid',
    headStyles: { fillColor: RF_BLUE, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
  });

  let yRubAfter = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(60, 60, 60);
  doc.text(`Méthode : score 100 − pénalités anomalies (maj × 5, min × 2) − actions en retard × 3 − PV non finalisés × 2 + actions clôturées × 1, borné à [0;100].`,
    M, yRubAfter, { maxWidth: W - 2 * M });

  footer(doc, ctx, 3, 4);

  // ─── PAGE 4 — PLAN D'ACTION PRIORITAIRE ─────────────────────
  doc.addPage();
  header(doc, ctx, logoData ?? undefined);
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(16);
  doc.text("Plan d'action prioritaire", M, 32);

  const actions = ctx.actionsCritiques ?? [];
  if (actions.length === 0) {
    doc.setFont('helvetica', 'italic').setFontSize(10).setTextColor(120, 120, 120);
    doc.text('Aucune action critique ou haute en cours sur la période.', M, 44);
  } else {
    autoTable(doc, {
      startY: 40,
      margin: { left: M, right: M },
      head: [['Action', 'Criticité', 'Échéance', 'Responsable', 'Référence']],
      body: actions.slice(0, 25).map(a => [
        a.libelle,
        a.criticite,
        a.echeance ? new Date(a.echeance).toLocaleDateString('fr-FR') : '—',
        a.responsable ?? '—',
        a.reference ?? '—',
      ]),
      theme: 'striped',
      headStyles: { fillColor: RF_BLUE, textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, valign: 'middle' },
      columnStyles: { 1: { halign: 'center' } },
    });
  }

  // Filigrane
  doc.setTextColor(220, 220, 220).setFont('helvetica', 'bold').setFontSize(40);
  doc.text('CONFIDENTIEL', W / 2, H / 2 + 60, { align: 'center', angle: -25 });

  footer(doc, ctx, 4, 4);

  return doc.output('blob');
}

export function pdfFileName(ctx: { estConsolide: boolean; libelle: string }): string {
  const slug = ctx.libelle.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40);
  return `rapport-maturite-cicf-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`;
}

```

### FICHIER : src/lib/regulatory-data.ts

```ts
/**
 * Données réglementaires — CIC Expert Pro
 * 
 * Sources :
 * - M9-6 (instruction comptable M9-6 des EPLE)
 * - Décret 2012-1246 du 7 novembre 2012 (GBCP)
 * - Code de l'Éducation (articles R.421-*)
 * - Décret n°2019-798 du 26 juillet 2019 (régies de recettes et d'avances)
 * - Décret n°2020-128 du 14 février 2020 (Modification du régime des régies de recettes et d'avances des organismes publics)
 * - Circulaire du 16 juillet 2024 (voyages scolaires)
 * - Décrets n°2025-1386 et 2025-1383 (seuils commande publique 2026)
 * - Ordonnance n°2022-408 du 21 mars 2022 (RGP - remplace RPP)
 * - Cartop@le / ODICé (cartographie des risques CICF)
 * - Arrêté du 25 juillet 2013 (pièces justificatives)
 */

// ═══ SEUILS COMMANDE PUBLIQUE 2026 ═══
// Décrets n°2025-1386 et 2025-1383 du 18 décembre 2025
export const SEUILS_MARCHES_2026 = [
  {
    seuil: 0,
    label: 'Achat < 60 000 € HT (fournitures/services) — < 100 000 € HT (travaux)',
    consigne: 'Dispense de publicité et de mise en concurrence (Décret 2025-1386 — seuil relevé). L\'acheteur veille au bon usage des deniers publics et choisit une offre pertinente. Recommandation : 3 devis dès 25 000 € HT.',
    ref: 'Art. R.2122-8 CCP — Décret 2025-1386',
  },
  {
    seuil: 60_000,
    label: '60 000 € HT',
    consigne: 'Marché à procédure adaptée (MAPA). Publicité et mise en concurrence adaptées au montant et à la nature du marché. Obligation de publicité sur le profil acheteur.',
    ref: 'Art. R.2123-1 CCP',
  },
  {
    seuil: 90_000,
    label: '90 000 € HT',
    consigne: 'MAPA avec publicité renforcée. Publication au BOAMP ou dans un JAL + profil acheteur. Transmission au contrôle de légalité (art. L.421-14 Code Éducation).',
    ref: 'Art. R.2131-12 CCP',
  },
  {
    seuil: 143_000,
    label: '143 000 € HT — Seuil européen fournitures/services',
    consigne: 'Procédure formalisée obligatoire pour les fournitures et services : appel d\'offres ouvert, restreint ou procédure concurrentielle avec négociation. Publication au JOUE + BOAMP.',
    ref: 'Art. R.2124-1 CCP — Seuils européens 2026',
  },
  {
    seuil: 5_538_000,
    label: '5 538 000 € HT — Seuil européen travaux',
    consigne: 'Procédure formalisée pour les marchés de travaux. Publication au JOUE + BOAMP.',
    ref: 'Art. R.2124-1 CCP — Seuils européens 2026',
  },
];

// ═══ MOTIFS DE SUSPENSION DE PAIEMENT ═══
// Article 38 du décret n°2012-1246 du 7 novembre 2012 (GBCP)
export const MOTIFS_SUSPENSION_GBCP = [
  {
    motif: 'Insuffisance de crédits disponibles',
    ref: 'Art. 38 1° GBCP',
    detail: 'L\'agent comptable vérifie la disponibilité des crédits au moment de la prise en charge de la demande de paiement.',
    severity: 'critique' as const,
  },
  {
    motif: 'Inexactitude des certifications de l\'ordonnateur',
    ref: 'Art. 38 2° GBCP',
    detail: 'Certification du service fait, exactitude des calculs de liquidation, application des règles de prescription et de déchéance.',
    severity: 'critique' as const,
  },
  {
    motif: 'Absence de justification du service fait',
    ref: 'Art. 38 3° GBCP',
    detail: 'Vérification de la production des justifications (facture, attestation de service fait, bon de livraison).',
    severity: 'critique' as const,
  },
  {
    motif: 'Caractère non libératoire du règlement',
    ref: 'Art. 38 4° GBCP',
    detail: 'Absence de qualité du créancier ou de son représentant pour recevoir le paiement. Vérification du RIB et de l\'identité.',
    severity: 'majeur' as const,
  },
  {
    motif: 'Absence de visa du contrôleur budgétaire le cas échéant',
    ref: 'Art. 38 5° GBCP',
    detail: 'Pour les EPLE, concerne les dépassements sur un chapitre limitatif ou les dépenses soumises à un visa préalable.',
    severity: 'majeur' as const,
  },
];

// ═══ CONTRÔLES DE L'AGENT COMPTABLE (art. 19-20 GBCP) ═══
export const CONTROLES_AGENT_COMPTABLE = {
  depenses: [
    { id: 'ac1', label: 'Qualité de l\'ordonnateur ou de son délégué', ref: 'Art. 19 1° GBCP', severity: 'critique' as const },
    { id: 'ac2', label: 'Exacte imputation budgétaire des dépenses', ref: 'Art. 19 2° GBCP', severity: 'majeur' as const },
    { id: 'ac3', label: 'Disponibilité des crédits', ref: 'Art. 19 3° GBCP', severity: 'critique' as const },
    { id: 'ac4', label: 'Validité de la dette (justification du service fait, liquidation)', ref: 'Art. 19 4° GBCP', severity: 'critique' as const },
    { id: 'ac5', label: 'Caractère libératoire du paiement (qualité du créancier, RIB)', ref: 'Art. 19 5° GBCP', severity: 'majeur' as const },
    { id: 'ac6', label: 'Application des règles de prescription et de déchéance', ref: 'Art. 19 6° GBCP', severity: 'majeur' as const },
    { id: 'ac7', label: 'Production des pièces justificatives (arrêté du 25 juillet 2013)', ref: 'Art. 19 GBCP + Arrêté PJ', severity: 'critique' as const },
  ],
  recettes: [
    { id: 'ar1', label: 'Autorisation de percevoir les recettes (base légale ou réglementaire)', ref: 'Art. 19 GBCP', severity: 'critique' as const },
    { id: 'ar2', label: 'Mise en recouvrement des créances dans les délais', ref: 'Art. 20 GBCP', severity: 'majeur' as const },
    { id: 'ar3', label: 'Exactitude des calculs de liquidation des droits', ref: 'Art. 19 GBCP', severity: 'majeur' as const },
    { id: 'ar4', label: 'Application des règles de prescription', ref: 'Art. 19 GBCP', severity: 'majeur' as const },
  ],
};

// ═══ PIÈCES JUSTIFICATIVES DE DÉPENSES ═══
// Arrêté du 25 juillet 2013 — Liste des pièces justificatives
export const PIECES_JUSTIFICATIVES_DEPENSES = [
  { id: 'pj1', label: 'Facture originale ou mémoire', obligatoire: true, ref: 'Arrêté PJ — rubrique 4' },
  { id: 'pj2', label: 'Bon de commande signé par l\'ordonnateur', obligatoire: true, ref: 'Arrêté PJ — rubrique 4' },
  { id: 'pj3', label: 'Certification du service fait par l\'ordonnateur', obligatoire: true, ref: 'Art. 10 GBCP' },
  { id: 'pj4', label: 'Bon de livraison ou attestation de service fait', obligatoire: true, ref: 'Arrêté PJ — rubrique 4' },
  { id: 'pj5', label: 'RIB du créancier', obligatoire: true, ref: 'Art. 38 4° GBCP' },
  { id: 'pj6', label: 'Pièces de marché (acte d\'engagement, CCAP, CCTP)', obligatoire: false, ref: 'Si montant > seuil MAPA' },
  { id: 'pj7', label: 'Rapport de présentation / fiche de procédure', obligatoire: false, ref: 'Si marché ≥ 60 000 € HT' },
  { id: 'pj8', label: 'Acte du CA ou convention habilitante', obligatoire: false, ref: 'Art. R.421-20 Code Éducation' },
];

// ═══ RÉGIES — Décrets 2019-798 et 2020-922 ═══
export const REGIES_REGLEMENTATION = {
  // Décret n°2019-798 du 26 juillet 2019
  decret2019: {
    ref: 'Décret n°2019-798 du 26 juillet 2019',
    objet: 'Régies de recettes et d\'avances des organismes publics',
  },
  // Décret n°2020-128 du 14 février 2020
  decret2020: {
    ref: 'Décret n°2020-128 du 14 février 2020',
    objet: 'Modification du régime des régies de recettes et d\'avances des organismes publics',
  },
  plafonds: {
    avances_fonctionnement: { montant: 2_000, label: 'Plafond régie d\'avances — Fonctionnement', ref: 'Art. 4 Décrets 2019-798 et 2020-128' },
    avances_restauration: { montant: 3_000, label: 'Plafond régie d\'avances — Restauration', ref: 'Art. 4 Décrets 2019-798 et 2020-128' },
    recettes: { montant: 10_000, label: 'Plafond encaisse régie de recettes', ref: 'Art. 12 Décrets 2019-798 et 2020-128' },
    delai_versement: { jours: 7, label: 'Délai maximum de versement au comptable', ref: 'Art. 13 Décret 2019-798' },
  },
  controles_obligatoires: [
    { id: 'reg1', label: 'Existence de l\'acte constitutif de la régie (arrêté de création)', severity: 'critique' as const, ref: 'Art. 1 Décrets 2019-798 et 2020-128' },
    { id: 'reg2', label: 'Acte de nomination du régisseur (arrêté de nomination signé par l\'agent comptable)', severity: 'critique' as const, ref: 'Art. 8 Décret 2019-798' },
    { id: 'reg3', label: 'Plafond de l\'avance respecté (régie d\'avances) — Fonctionnement : 2 000 €, Restauration : 3 000 €', severity: 'critique' as const, ref: 'Art. 4 Décrets 2019-798 et 2020-128' },
    { id: 'reg4', label: 'Plafond de l\'encaisse respecté (régie de recettes) — max 10 000 €', severity: 'critique' as const, ref: 'Art. 12 Décrets 2019-798 et 2020-128' },
    { id: 'reg5', label: 'Respect du délai de versement au comptable (7 jours)', severity: 'majeur' as const, ref: 'Art. 13 Décret 2019-798' },
    { id: 'reg6', label: 'Tenue du journal de caisse à jour', severity: 'critique' as const, ref: 'M9-6 § 3.2.1' },
    { id: 'reg7', label: 'Rapprochement solde théorique / solde réel (comptage inopiné)', severity: 'critique' as const, ref: 'M9-6 § 3.2.1' },
    { id: 'reg8', label: 'Interdiction d\'utiliser les fonds de la régie pour un usage personnel ou non autorisé', severity: 'critique' as const, ref: 'Art. 17 Décret 2019-798 — Engage la responsabilité (RGP)' },
    { id: 'reg9', label: 'Suppléance du régisseur formalisée en cas d\'absence (mandataire nommé)', severity: 'majeur' as const, ref: 'Art. 10 Décret 2019-798' },
    { id: 'reg10', label: 'Vérification des chèques en coffre (non endossés, délai d\'encaissement)', severity: 'majeur' as const, ref: 'M9-6 § 3.2' },
    { id: 'reg11', label: 'Valeurs inactives : suivi du stock et rapprochement comptable', severity: 'majeur' as const, ref: 'M9-6 § 3.2.3' },
    { id: 'reg12', label: 'Contrôle inopiné au moins une fois par an par l\'agent comptable', severity: 'critique' as const, ref: 'Art. 18 Décret 2019-798 — Art. 18 Décret 2012-1246' },
    { id: 'reg13', label: 'Procès-verbal de contrôle de caisse établi et signé (régisseur + AC)', severity: 'majeur' as const, ref: 'M9-6 § 3.2' },
    { id: 'reg14', label: 'Reddition des comptes par le régisseur dans les délais (Art. 14)', severity: 'majeur' as const, ref: 'Art. 14 Décret 2019-798' },
  ],
};

// ═══ VÉRIFICATION QUOTIDIENNE — M9-6 ═══
export const VERIFICATION_QUOTIDIENNE = {
  caisse_tresorerie: [
    { id: 'vq1', label: 'Comptage de la caisse de l\'agent comptable', ref: 'M9-6 § 3.2.1', severity: 'critique' as const },
    { id: 'vq2', label: 'Vérification du solde du compte au Trésor (DFT / compte 515)', ref: 'M9-6 § 3.1', severity: 'critique' as const },
    { id: 'vq3', label: 'État de rapprochement bancaire à jour', ref: 'M9-6 § 3.1.3', severity: 'critique' as const },
    { id: 'vq4', label: 'Contrôle des chéquiers (souches, numéros, séquence)', ref: 'M9-6 § 3.2', severity: 'majeur' as const },
    { id: 'vq5', label: 'Vérification des remises de chèques au Trésor', ref: 'M9-6 § 3.2', severity: 'majeur' as const },
  ],
  comptabilite: [
    { id: 'vq6', label: 'Balance générale des comptes vérifiée', ref: 'M9-6 § 2.3', severity: 'critique' as const },
    { id: 'vq7', label: 'Journaux comptables à jour (achats, banque, OD)', ref: 'M9-6 § 2.2', severity: 'majeur' as const },
    { id: 'vq8', label: 'Comptes d\'attente et d\'imputation provisoire soldés (comptes 47x)', ref: 'M9-6 § 2.4', severity: 'critique' as const, detail: 'C/471, C/472, C/473 doivent être soldés en fin d\'exercice' },
    { id: 'vq9', label: 'Concordance entre Op@le et les pièces comptables', ref: 'M9-6 § 2.1', severity: 'majeur' as const },
    { id: 'vq10', label: 'Compte 472 « recettes à classer » : solde justifié', ref: 'M9-6 § 2.4.2', severity: 'majeur' as const },
    { id: 'vq11', label: 'Compte 515 « compte au Trésor » : concordance avec le relevé DFT', ref: 'M9-6 § 3.1', severity: 'critique' as const },
    { id: 'vq12b', label: 'Compte C/471 « dépenses à régulariser » : solde justifié et apuré', ref: 'M9-6 § 2.4.1', severity: 'critique' as const },
    { id: 'vq12c', label: 'Compte C/472 « recettes à classer » : soldé rapidement, aucun solde ancien non justifié', ref: 'M9-6 § 2.4.2', severity: 'critique' as const },
    { id: 'vq12d', label: 'Compte C/473 « recettes perçues d\'avance » : suivi et justification par débiteur', ref: 'M9-6 § 2.4.3', severity: 'majeur' as const },
    { id: 'vq12e', label: 'Comptes C/486 et C/487 « charges/produits constatés d\'avance » : rattachement correct à l\'exercice', ref: 'M9-6 § 2.4 — PCG art. 313-1', severity: 'majeur' as const },
  ],
  regies: [
    { id: 'vq12', label: 'Régies d\'avances : solde dans les limites du plafond', ref: 'Art. 4 Décret 2019-798', severity: 'critique' as const },
    { id: 'vq13', label: 'Régies de recettes : versement au comptable dans le délai de 7 jours', ref: 'Art. 13 Décret 2019-798', severity: 'majeur' as const },
    { id: 'vq14', label: 'Actes constitutifs des régies à jour et conformes', ref: 'Art. 1 Décret 2019-798', severity: 'majeur' as const },
    { id: 'vq15', label: 'Suppléance des régisseurs : mandataire nommé en cas d\'absence du régisseur titulaire', ref: 'Art. 10 Décret 2019-798', severity: 'majeur' as const },
  ],
  recettes: [
    { id: 'vq16', label: 'État des créances à recouvrer (balance âgée)', ref: 'Art. 20 GBCP', severity: 'critique' as const },
    { id: 'vq17', label: 'Titres de recettes émis dans les délais', ref: 'Art. 20 GBCP', severity: 'majeur' as const },
    { id: 'vq18', label: 'Encaissements du jour rapprochés des pièces', ref: 'M9-6 § 4.2', severity: 'majeur' as const },
    { id: 'vq19', label: 'Relances effectuées sur créances > 2 mois (RGP)', ref: 'Ord. 2022-408 art. L.131-9 à L.131-15 CJF', severity: 'majeur' as const, detail: 'Responsabilité du gestionnaire public en cas de carence dans le recouvrement' },
  ],
  depenses: [
    { id: 'vq20', label: 'Demandes de paiement en attente de visa', ref: 'Art. 38 GBCP', severity: 'majeur' as const },
    { id: 'vq21', label: 'Pièces justificatives vérifiées (arrêté du 25 juillet 2013)', ref: 'Arrêté PJ', severity: 'critique' as const },
    { id: 'vq22', label: 'Oppositions (ATD, saisies) prises en compte', ref: 'Art. 38 GBCP', severity: 'critique' as const },
  ],
  organisation: [
    { id: 'vq23', label: 'Organigramme fonctionnel du service comptable', ref: 'M9-6 § 1.2', severity: 'majeur' as const },
    { id: 'vq24', label: 'Séparation des tâches ordonnateur / comptable vérifiée', ref: 'Art. 9 GBCP', severity: 'critique' as const, detail: 'Principe fondamental de la comptabilité publique — incompatibilité des fonctions' },
    { id: 'vq25', label: 'Habilitations Op@le conformes aux fonctions', ref: 'M9-6 § 1.3', severity: 'majeur' as const },
    { id: 'vq26', label: 'Coffre-fort : accès contrôlé, contenu inventorié', ref: 'M9-6 § 3.2', severity: 'majeur' as const },
  ],
};

// ═══ CARTOP@LE — 11 PROCESSUS CICF ═══
// Structure officielle Cartop@le / ODICé
export const CARTOPALE_PROCESSUS = [
  {
    code: 'P1',
    label: 'Organisation comptable et financière',
    sousProcessus: [
      'Organigramme fonctionnel', 'Séparation des tâches', 'Habilitations SI',
      'Délégations de signature', 'Archivage', 'Continuité de service',
    ],
  },
  {
    code: 'P2',
    label: 'Trésorerie',
    sousProcessus: [
      'Compte au Trésor (C/515)', 'Rapprochement bancaire', 'Caisse',
      'Dépôts de fonds des tiers', 'Valeurs inactives',
    ],
  },
  {
    code: 'P3',
    label: 'Recettes / Produits',
    sousProcessus: [
      'Constatation des droits', 'Émission des titres de recettes',
      'Encaissement', 'Recouvrement contentieux (RGP)',
      'Admission en non-valeur / remise gracieuse',
    ],
  },
  {
    code: 'P4',
    label: 'Dépenses / Charges',
    sousProcessus: [
      'Engagement juridique', 'Certification du service fait',
      'Liquidation', 'Demande de paiement', 'Paiement',
      'Contrôle de la dépense (art. 19 GBCP)',
    ],
  },
  {
    code: 'P5',
    label: 'Régies',
    sousProcessus: [
      'Acte constitutif', 'Nomination du régisseur (cautionnement supprimé — Ord. 2022-408)',
      'Contrôle de caisse inopiné', 'Respect des plafonds',
      'Délai de reversement', 'Journal de caisse',
    ],
  },
  {
    code: 'P6',
    label: 'Patrimoine / Immobilisations',
    sousProcessus: [
      'Inventaire physique', 'Rapprochement inventaire/comptabilité',
      'Amortissements', 'Sorties d\'actif', 'Provisions',
    ],
  },
  {
    code: 'P7',
    label: 'Stocks',
    sousProcessus: [
      'Inventaire physique denrées', 'Valorisation (CUMP/FIFO)',
      'Rapprochement stock physique/comptable', 'Pertes et manquants',
    ],
  },
  {
    code: 'P8',
    label: 'Bourses et aides sociales',
    sousProcessus: [
      'Bourses nationales (vérification assiduité)',
      'Fonds sociaux (commission, attribution)',
      'Aide à la restauration',
    ],
  },
  {
    code: 'P9',
    label: 'Voyages et sorties scolaires',
    sousProcessus: [
      'Actes du CA (programmation, financement)',
      'Budget prévisionnel', 'Encaissement familles',
      'Passation de marché si seuil', 'Compte rendu financier',
    ],
  },
  {
    code: 'P10',
    label: 'Restauration / Hébergement',
    sousProcessus: [
      'Tarification (délibération CT)', 'Facturation et encaissement',
      'Convention d\'hébergement', 'Suivi FCSH/FRPI',
      'Conformité EGAlim',
    ],
  },
  {
    code: 'P11',
    label: 'Clôture de l\'exercice',
    sousProcessus: [
      'Rattachement charges/produits', 'Provisions et dépréciations',
      'Compte financier (FDR, BFR, trésorerie, CAF)',
      'Concordance balance/compte financier',
      'Présentation au CA',
    ],
  },
];

// ═══ CONTRÔLE DE L'ORDONNATEUR ═══
// Articles R.421-9, R.421-13, R.421-20, R.421-54 à R.421-68 Code Éducation
export const CONTROLES_ORDONNATEUR = {
  qualite: [
    { id: 'ord1', label: 'Le chef d\'établissement est ordonnateur de droit', ref: 'Art. R.421-9 Code Éducation', severity: 'critique' as const },
    { id: 'ord2', label: 'Délégation de signature formalisée si adjoint ordonne', ref: 'Art. R.421-13 Code Éducation', severity: 'critique' as const },
    { id: 'ord3', label: 'Accréditation de l\'ordonnateur auprès de l\'agent comptable', ref: 'Art. R.421-68 Code Éducation', severity: 'critique' as const },
    { id: 'ord4', label: 'Continuité de l\'ordonnancement (intérim formalisé en cas d\'absence)', ref: 'Art. R.421-13 Code Éducation', severity: 'majeur' as const },
  ],
  budget: [
    { id: 'ord5', label: 'Budget voté par le CA dans les délais (30 jours après notification DGF)', ref: 'Art. R.421-58 Code Éducation', severity: 'critique' as const },
    { id: 'ord6', label: 'Exécution conforme aux autorisations budgétaires', ref: 'Art. R.421-60 Code Éducation', severity: 'critique' as const },
    { id: 'ord7', label: 'DBM soumises au vote du CA (sauf compétence propre chef d\'établissement)', ref: 'Art. R.421-60 Code Éducation', severity: 'majeur' as const },
    { id: 'ord8', label: 'Respect des chapitres limitatifs (A1 viabilisation, A2 fonctionnement)', ref: 'Art. R.421-60 Code Éducation', severity: 'critique' as const },
  ],
  engagement: [
    { id: 'ord9', label: 'Engagements juridiques préalables aux commandes', ref: 'Art. 8 GBCP', severity: 'critique' as const },
    { id: 'ord10', label: 'Disponibilité des crédits vérifiée avant engagement', ref: 'Art. 8 GBCP', severity: 'critique' as const },
    { id: 'ord11', label: 'Respect des seuils de la commande publique', ref: 'CCP + Décrets 2025-1386/1383', severity: 'critique' as const },
    { id: 'ord12', label: 'Transmission au contrôle de légalité des actes > 90 000 € HT', ref: 'Art. L.421-14 Code Éducation', severity: 'majeur' as const },
  ],
};

// ═══ DROITS CONSTATÉS — M9-6 § 4.2 ═══
export const CONTROLES_DROITS_CONSTATES = [
  { id: 'dc1', label: 'Existence du fait générateur de la créance', ref: 'M9-6 § 4.2.1', severity: 'critique' as const },
  { id: 'dc2', label: 'Base légale ou réglementaire de la recette (tarification CA, convention)', ref: 'Art. R.421-58 Code Éducation', severity: 'critique' as const },
  { id: 'dc3', label: 'Liquidation correcte (calcul, base, taux)', ref: 'M9-6 § 4.2.2', severity: 'majeur' as const },
  { id: 'dc4', label: 'Émission du titre de recettes dans les délais', ref: 'Art. 20 GBCP', severity: 'majeur' as const },
  { id: 'dc5', label: 'Notification au débiteur', ref: 'M9-6 § 4.2.3', severity: 'majeur' as const },
  { id: 'dc6', label: 'Suivi des encaissements et rapprochement', ref: 'M9-6 § 4.2', severity: 'majeur' as const },
  { id: 'dc7', label: 'Relances systématiques sur créances > 2 mois', ref: 'Ord. 2022-408 (RGP)', severity: 'majeur' as const },
  { id: 'dc8', label: 'Procédure RGP engagée si nécessaire (mise en demeure, état exécutoire)', ref: 'Art. L.131-9 à L.131-15 CJF', severity: 'critique' as const },
];

// ═══ VOYAGES SCOLAIRES — Circulaire du 16 juillet 2024 ═══
export const VOYAGES_REGLEMENTATION = {
  ref: 'Circulaire du 16 juillet 2024 relative aux sorties et voyages scolaires',
  pieces_obligatoires: [
    { key: 'listeParticipants', label: 'Liste nominative des participants (élèves et accompagnateurs)' },
    { key: 'budgetVoyage', label: 'Budget prévisionnel détaillé du voyage (recettes/dépenses)' },
    { key: 'acteCA_programmation', label: 'Acte du CA autorisant la programmation annuelle des voyages' },
    { key: 'acteCA_financement', label: 'Acte du CA approuvant le plan de financement (participation familles)' },
    { key: 'acteCA_conventions', label: 'Acte du CA autorisant la signature de conventions (hébergement, transport)' },
    { key: 'acteCA_dons', label: 'Acte du CA autorisant la perception de dons (acte-cadre annuel inclus)' },
    { key: 'assurance', label: 'Attestation d\'assurance responsabilité civile et individuelle accidents' },
    { key: 'autorisations', label: 'Autorisations parentales de participation et de droit à l\'image' },
  ],
  regles_financieres: [
    'Aucun voyage ne peut être organisé sans financement intégralement assuré',
    'Les promesses de dons ne constituent pas des recettes certaines',
    'Le compte rendu financier doit être présenté au CA dans les 3 mois',
    'Les reliquats éventuels sont reversés aux familles au prorata',
    'Les encaissements des familles doivent être effectués par l\'agent comptable ou un régisseur',
  ],
  erasmus: {
    compte: 'C/7074',
    label: 'Subvention Erasmus+',
    distanceMinimum: 7000,
    detail: 'Pour les destinations > 7 000 km, forfait voyage majoré applicable',
  },
};

// ═══ ANALYSE FINANCIÈRE — M9-6 § 4.5.3 ═══
export const INDICATEURS_FINANCIERS_M96 = {
  fdr: {
    label: 'Fonds de roulement',
    formule: '(Capitaux propres + Emprunts + Provisions) − Actif immobilisé net',
    interpretation: 'Excédent de ressources stables finançant l\'actif circulant. Un FDR positif est signe de bonne santé.',
    seuil_alerte: 'FDR < 30 jours de DRFN',
    ref: 'M9-6 § 4.5.3.1',
  },
  bfr: {
    label: 'Besoin en fonds de roulement',
    formule: 'Actif circulant (hors trésorerie) − Dettes court terme (hors trésorerie)',
    interpretation: 'Besoin de financement lié au cycle d\'exploitation. Un BFR négatif est favorable.',
    ref: 'M9-6 § 4.5.3.2',
  },
  tresorerie: {
    label: 'Trésorerie nette',
    formule: 'FDR − BFR = Disponibilités − Concours bancaires',
    interpretation: 'Liquidités immédiatement disponibles. Doit rester positive.',
    ref: 'M9-6 § 4.5.3.3',
  },
  caf: {
    label: 'Capacité d\'autofinancement',
    formule: 'Résultat net + Dotations amortissements/provisions − Reprises provisions − Plus-values cessions',
    interpretation: 'Capacité de l\'EPLE à dégager des ressources propres pour investir.',
    ref: 'M9-6 § 4.5.3.4',
  },
  jours_fdr: {
    label: 'Jours de FDR',
    formule: '(FDR / DRFN) × 365',
    interpretation: 'Nombre de jours de fonctionnement que le FDR peut financer. Seuil de vigilance : < 30 jours.',
    denominateur: 'DRFN (Dépenses Réelles de Fonctionnement Nettes)',
    ref: 'M9-6 § 4.5.3',
  },
};

// ═══ BOURSES — Montants 2025-2026 ═══
export const ECHELONS_BOURSES_2026: Record<number, number> = {
  1: 444, 2: 534, 3: 564, 4: 616, 5: 657, 6: 1035,
};

// ═══ RGP — Ordonnance 2022-408 ═══
export const RGP_INFO = {
  ref: 'Ordonnance n°2022-408 du 21 mars 2022',
  entreeEnVigueur: '1er janvier 2023',
  articlesCJF: 'Art. L.131-9 à L.131-15 CJF',
  principe: 'Responsabilité du Gestionnaire Public — remplace le régime RPP (responsabilité personnelle et pécuniaire)',
  detail: 'Le gestionnaire public engage sa responsabilité en cas de faute grave ayant causé un préjudice financier significatif. La Cour des comptes est compétente pour juger.',
};

// ═══ MARCHÉS PUBLICS — Contrôles ═══
// Seuils applicables aux EPLE (pouvoirs adjudicateurs hors État)
// Décret 2025-1386 du 29/12/2025 — en vigueur depuis le 1er avril 2026 pour fournitures/services
export const CONTROLES_MARCHES = [
  { id: 'mp1', label: 'Respect du seuil de dispense : < 60 000 € HT (fournitures/services) ou < 100 000 € HT (travaux) — Décret 2025-1386, en vigueur au 1er avril 2026', ref: 'Art. R.2122-8 CCP', severity: 'critique' as const },
  { id: 'mp2', label: 'Publicité et mise en concurrence adaptées (MAPA) entre 60 000 € et 216 000 € HT — minimum 3 devis', ref: 'Art. R.2123-1 CCP — Seuils EPLE 2026', severity: 'majeur' as const },
  { id: 'mp3', label: 'Procédure formalisée obligatoire pour les marchés ≥ 216 000 € HT fournitures/services (seuil UE EPLE 2026-2027)', ref: 'Art. R.2124-1 CCP — Décret 2025-1386', severity: 'critique' as const },
  { id: 'mp4', label: 'Publication au JOUE + BOAMP si seuil européen atteint (≥ 216 000 € HT ou ≥ 5 404 000 € HT travaux)', ref: 'Décrets 2025-1386/1383 — Seuils UE 2026-2027', severity: 'critique' as const },
  { id: 'mp5', label: 'Transmission au contrôle de légalité si montant ≥ 216 000 € HT', ref: 'Art. L.421-14 Code Éducation — Seuil révisé 2026', severity: 'majeur' as const },
  { id: 'mp6', label: 'Acte d\'engagement signé par l\'ordonnateur avant tout engagement de dépense', ref: 'CCP — Art. 8 GBCP', severity: 'critique' as const },
  { id: 'mp7', label: 'Rapport de présentation ou fiche de procédure pour tout marché ≥ 60 000 € HT', ref: 'Art. R.2184-1 CCP', severity: 'majeur' as const },
  { id: 'mp8', label: 'Mise en concurrence effective (3 devis minimum entre 25 000 € et 60 000 € HT — bonne pratique)', ref: 'CCP — Principes fondamentaux', severity: 'majeur' as const },
  { id: 'mp9', label: 'Vérification de la non-sous-traitance non déclarée', ref: 'Art. R.2193-1 CCP', severity: 'majeur' as const },
  { id: 'mp10', label: 'Avenant éventuel voté au CA si modification substantielle du marché', ref: 'Art. R.421-20 Code Éducation', severity: 'majeur' as const },
  { id: 'mp11', label: 'Délai de paiement respecté (30 jours maximum pour les EPLE)', ref: 'Art. L.2192-10 CCP', severity: 'majeur' as const },
];

// ═══ RESTAURATION — Contrôles EGAlim + SRH ═══
export const CONTROLES_RESTAURATION = [
  { id: 'rst1', label: 'Convention d\'hébergement avec la collectivité territoriale', ref: 'Art. L.213-2 / L.214-6 Code Éducation', severity: 'critique' as const },
  { id: 'rst2', label: 'Tarification votée par la collectivité de rattachement', ref: 'Art. R.531-52 Code Éducation', severity: 'critique' as const },
  { id: 'rst3', label: 'Respect de l\'objectif EGAlim : 50% de produits durables dont 20% bio', ref: 'Loi 2018-938 art. 24 (EGAlim)', severity: 'majeur' as const },
  { id: 'rst4', label: 'Plan alimentaire conforme aux recommandations du GEMRCN', ref: 'Décret 2011-1227', severity: 'majeur' as const },
  { id: 'rst5', label: 'Grammages respectés par catégorie de plat', ref: 'Arrêté du 30/09/2011', severity: 'majeur' as const },
  { id: 'rst6', label: 'Suivi du compte FCSH (Fonds Commun du Service d\'Hébergement)', ref: 'M9-6 § 4.3', severity: 'critique' as const },
  { id: 'rst7', label: 'Suivi du compte FRPI (Fonds de Rémunération des Personnels d\'Internat)', ref: 'M9-6 § 4.3', severity: 'majeur' as const },
  { id: 'rst8', label: 'Rapprochement recettes cantine / effectifs rationnaires', ref: 'M9-6 § 4.3', severity: 'majeur' as const },
  { id: 'rst9', label: 'Inventaire physique des stocks denrées (2x/an minimum)', ref: 'M9-6 § 2.1.4', severity: 'critique' as const },
  { id: 'rst10', label: 'PMS/HACCP : plan de maîtrise sanitaire à jour', ref: 'Règlement CE 852/2004', severity: 'critique' as const },
];

// ═══ RECOUVREMENT — Contrôles RGP ═══
export const CONTROLES_RECOUVREMENT = [
  { id: 'rec1', label: 'Titres de recettes émis dans les délais réglementaires', ref: 'Art. 20 GBCP', severity: 'critique' as const },
  { id: 'rec2', label: 'Relances amiables effectuées dans les 30 jours', ref: 'Ord. 2022-408 (RGP)', severity: 'majeur' as const },
  { id: 'rec3', label: 'Mise en demeure après 2 relances infructueuses', ref: 'Art. L.131-9 CJF', severity: 'critique' as const },
  { id: 'rec4', label: 'État exécutoire émis si mise en demeure restée sans effet', ref: 'Art. L.131-10 CJF', severity: 'critique' as const },
  { id: 'rec5', label: 'Balance âgée des créances tenue à jour', ref: 'M9-6 § 4.2', severity: 'majeur' as const },
  { id: 'rec6', label: 'Demande d\'admission en non-valeur motivée si irrécouvrable', ref: 'Art. R.421-20 Code Éducation', severity: 'majeur' as const },
  { id: 'rec7', label: 'Remise gracieuse : délibération du CA', ref: 'Art. R.421-20 Code Éducation', severity: 'majeur' as const },
  { id: 'rec8', label: 'Prescription quadriennale vérifiée (créances > 4 ans)', ref: 'Loi 68-1250 du 31/12/1968', severity: 'critique' as const },
];

// ═══ RAPPROCHEMENT BANCAIRE — Contrôles ═══
export const CONTROLES_RAPPROCHEMENT = [
  { id: 'rb1', label: 'Rapprochement mensuel entre le solde DFT et le compte 515', ref: 'M9-6 § 3.1.3', severity: 'critique' as const },
  { id: 'rb2', label: 'Identification et justification de tous les suspens', ref: 'M9-6 § 3.1.3', severity: 'critique' as const },
  { id: 'rb3', label: 'Pas de suspens anciens non justifiés (> 2 mois)', ref: 'M9-6 § 3.1.3', severity: 'majeur' as const },
  { id: 'rb4', label: 'Concordance du solde de clôture avec la balance générale', ref: 'M9-6 § 3.1', severity: 'critique' as const },
  { id: 'rb5', label: 'État de rapprochement signé et archivé', ref: 'M9-6 § 3.1.3', severity: 'majeur' as const },
];

// ═══ STOCKS — Contrôles ═══
export const CONTROLES_STOCKS = [
  { id: 'stk1', label: 'Inventaire physique réalisé au moins 2 fois par an', ref: 'M9-6 § 2.1.4', severity: 'critique' as const },
  { id: 'stk2', label: 'Valorisation au CUMP (Coût Unitaire Moyen Pondéré)', ref: 'PCG art. 213-33', severity: 'critique' as const },
  { id: 'stk3', label: 'Rapprochement stock physique / stock comptable effectué', ref: 'M9-6 § 4.4', severity: 'critique' as const },
  { id: 'stk4', label: 'Écarts justifiés et régularisés (C/6718 si manquant)', ref: 'M9-6 § 4.4', severity: 'majeur' as const },
  { id: 'stk5', label: 'DLC/DLUO contrôlées — produits périmés retirés', ref: 'Règlement CE 852/2004', severity: 'critique' as const },
  { id: 'stk6', label: 'Fiches de stock ou suivi informatisé à jour', ref: 'M9-6 § 2.1.4', severity: 'majeur' as const },
];

// ═══ BOURSES — Contrôles ═══
export const CONTROLES_BOURSES = [
  { id: 'brs1', label: 'Notifications de bourses reçues et conformes', ref: 'Art. R.531-1 Code Éducation', severity: 'critique' as const },
  { id: 'brs2', label: 'Échelons correctement appliqués (montants annuels)', ref: 'Arrêté annuel', severity: 'critique' as const },
  { id: 'brs3', label: 'Contrôle d\'assiduité effectué avant chaque versement', ref: 'Art. R.531-25 Code Éducation', severity: 'critique' as const },
  { id: 'brs4', label: 'Retenues pour absences justifiées et notifiées', ref: 'Art. R.531-25 Code Éducation', severity: 'majeur' as const },
  { id: 'brs5', label: 'Versement trimestriel conforme au calendrier', ref: 'Art. D.531-26 Code Éducation', severity: 'majeur' as const },
  { id: 'brs6', label: 'Primes (internat, équipement) correctement liquidées', ref: 'Art. D.531-21 Code Éducation', severity: 'majeur' as const },
];

// ═══ FONDS DE ROULEMENT — Contrôles ═══
export const CONTROLES_FDR = [
  { id: 'fdr1', label: 'FDR calculé selon la méthodologie M9-6 (haut de bilan)', ref: 'M9-6 § 4.5.3.1', severity: 'critique' as const },
  { id: 'fdr2', label: 'Jours de FDR calculés sur DRFN (et non sur le budget total)', ref: 'M9-6 § 4.5.3', severity: 'critique' as const },
  { id: 'fdr3', label: 'Seuil de vigilance vérifié : FDR ≥ 30 jours de DRFN', ref: 'Recommandation CRC', severity: 'critique' as const },
  { id: 'fdr4', label: 'Demande de prélèvement sur FDR motivée et votée au CA', ref: 'Art. R.421-60 Code Éducation', severity: 'critique' as const },
  { id: 'fdr5', label: 'Suivi pluriannuel du FDR (évolution N, N-1, N-2)', ref: 'M9-6 § 4.5.3', severity: 'majeur' as const },
  { id: 'fdr6', label: 'Relation fondamentale vérifiée : Trésorerie = FDR − BFR', ref: 'M9-6 § 4.5.3.3', severity: 'critique' as const },
];

// ═══ CONTRÔLE DE CAISSE — Contrôles ═══
export const CONTROLES_CAISSE = [
  { id: 'cc1', label: 'Contrôle inopiné réalisé (au moins 1/an par l\'agent comptable)', ref: 'Art. 18 Décret 2012-1246', severity: 'critique' as const },
  { id: 'cc2', label: 'Comptage physique des espèces (billetage détaillé)', ref: 'M9-6 § 3.2.1', severity: 'critique' as const },
  { id: 'cc3', label: 'Rapprochement solde théorique / solde réel', ref: 'M9-6 § 3.2.1', severity: 'critique' as const },
  { id: 'cc4', label: 'Journal de caisse tenu à jour et présenté', ref: 'M9-6 § 3.2.1', severity: 'critique' as const },
  { id: 'cc5', label: 'Plafond de l\'encaisse respecté', ref: 'Art. 4 Décret 2019-798', severity: 'critique' as const },
  { id: 'cc6', label: 'PV de contrôle de caisse établi et signé', ref: 'M9-6 § 3.2', severity: 'majeur' as const },
  { id: 'cc7', label: 'Chèques en coffre vérifiés (montants, endossement)', ref: 'M9-6 § 3.2.2', severity: 'majeur' as const },
];

// ═══ FONDS SOCIAUX — Contrôles ═══
export const CONTROLES_FONDS_SOCIAUX = [
  { id: 'fs1', label: 'Commission des fonds sociaux constituée et réunie', ref: 'Circ. 98-044', severity: 'critique' as const },
  { id: 'fs2', label: 'Présidence par le chef d\'établissement', ref: 'Circ. 98-044', severity: 'critique' as const },
  { id: 'fs3', label: 'Anonymat des bénéficiaires respecté', ref: 'Circ. 98-044', severity: 'critique' as const },
  { id: 'fs4', label: 'PV de commission établi et conservé', ref: 'Circ. 98-044', severity: 'majeur' as const },
  { id: 'fs5', label: 'Crédits disponibles vérifiés avant attribution', ref: 'M9-6', severity: 'majeur' as const },
  { id: 'fs6', label: 'Distinction FSL / fonds social cantine respectée', ref: 'Circ. 98-044', severity: 'majeur' as const },
];

// ═══ SUBVENTIONS — Contrôles ═══
export const CONTROLES_SUBVENTIONS = [
  { id: 'sub1', label: 'Notification de subvention reçue et archivée', ref: 'Art. R.421-58 Code Éducation', severity: 'critique' as const },
  { id: 'sub2', label: 'Emploi conforme à l\'objet de la subvention', ref: 'Art. 10 Loi 2000-321', severity: 'critique' as const },
  { id: 'sub3', label: 'Justification de l\'emploi produite dans les délais', ref: 'Art. 10 Loi 2000-321', severity: 'critique' as const },
  { id: 'sub4', label: 'Report de crédits non utilisés autorisé par le financeur', ref: 'Convention de subvention', severity: 'majeur' as const },
  { id: 'sub5', label: 'Reversement du trop-perçu si sous-consommation', ref: 'Art. 10 Loi 2000-321', severity: 'majeur' as const },
];

// ═══ VOYAGES SCOLAIRES — Contrôles ═══
export const CONTROLES_VOYAGES = [
  { id: 'voy1', label: 'Acte du CA autorisant la programmation annuelle des voyages', ref: 'Circ. 16/07/2024', severity: 'critique' as const },
  { id: 'voy2', label: 'Budget prévisionnel détaillé approuvé par le CA', ref: 'Circ. 16/07/2024', severity: 'critique' as const },
  { id: 'voy3', label: 'Financement intégralement assuré avant le départ', ref: 'Circ. 16/07/2024', severity: 'critique' as const },
  { id: 'voy4', label: 'Encaissements familles par l\'agent comptable ou un régisseur', ref: 'Circ. 16/07/2024', severity: 'critique' as const },
  { id: 'voy5', label: 'Promesses de dons non comptabilisées comme recettes certaines', ref: 'Circ. 16/07/2024', severity: 'majeur' as const },
  { id: 'voy6', label: 'Compte rendu financier présenté au CA dans les 3 mois', ref: 'Circ. 16/07/2024', severity: 'majeur' as const },
  { id: 'voy7', label: 'Reliquats reversés aux familles au prorata', ref: 'Circ. 16/07/2024', severity: 'majeur' as const },
  { id: 'voy8', label: 'Respect des seuils commande publique (transport, hébergement)', ref: 'CCP — Seuils 2026', severity: 'critique' as const },
];

// ═══ ORGANIGRAMME — Contrôles ═══
export const CONTROLES_ORGANIGRAMME = [
  { id: 'org1', label: 'Organigramme fonctionnel formalisé et à jour', ref: 'M9-6 § 1.2', severity: 'critique' as const },
  { id: 'org2', label: 'Séparation ordonnateur / comptable effective', ref: 'Art. 9 GBCP', severity: 'critique' as const },
  { id: 'org3', label: 'Fiches de poste établies pour chaque agent comptable', ref: 'M9-6 § 1.2', severity: 'majeur' as const },
  { id: 'org4', label: 'Délégations de signature formalisées et à jour', ref: 'Art. R.421-13 Code Éducation', severity: 'critique' as const },
  { id: 'org5', label: 'Matrice de séparation des tâches documentée', ref: 'Cartop@le P1', severity: 'majeur' as const },
  { id: 'org6', label: 'Habilitations Op@le conformes aux fonctions', ref: 'M9-6 § 1.3', severity: 'majeur' as const },
];

// ═══ ANNEXE COMPTABLE — Contrôles ═══
export const CONTROLES_ANNEXE = [
  { id: 'anx1', label: 'État de l\'actif (immobilisations) renseigné et à jour', ref: 'M9-6 § 4.5', severity: 'critique' as const },
  { id: 'anx2', label: 'Tableau des amortissements complet', ref: 'M9-6 § 2.1.4', severity: 'critique' as const },
  { id: 'anx3', label: 'État des provisions et dépréciations', ref: 'M9-6 § 4.5', severity: 'majeur' as const },
  { id: 'anx4', label: 'Engagements hors bilan mentionnés', ref: 'M9-6 § 4.5', severity: 'majeur' as const },
  { id: 'anx5', label: 'Méthodes comptables décrites', ref: 'PCG', severity: 'majeur' as const },
  { id: 'anx6', label: 'Concordance avec la balance générale vérifiée', ref: 'M9-6 § 4.5', severity: 'critique' as const },
];

// ═══ BUDGETS ANNEXES — Contrôles ═══
export const CONTROLES_BUDGETS_ANNEXES = [
  { id: 'ba1', label: 'Convention SRH avec la collectivité signée et à jour', ref: 'Art. L.213-2 Code Éducation', severity: 'critique' as const },
  { id: 'ba2', label: 'Pas de compte au Trésor propre pour les budgets annexes', ref: 'M9-6 § 4.3', severity: 'critique' as const },
  { id: 'ba3', label: 'Trésorerie matérialisée par le compte C/185000', ref: 'M9-6 § 4.3', severity: 'critique' as const },
  { id: 'ba4', label: 'Budget annexe voté au CA en même temps que le budget principal', ref: 'Art. R.421-58 Code Éducation', severity: 'critique' as const },
  { id: 'ba5', label: 'Suivi FCSH/FRPI distinct et justifié', ref: 'M9-6 § 4.3', severity: 'majeur' as const },
  { id: 'ba6', label: 'Reversement à la collectivité conforme à la convention', ref: 'Convention d\'hébergement', severity: 'majeur' as const },
];

```

### FICHIER : src/lib/regulatory-engine.ts

```ts
/**
 * Regulatory Engine — Référentiel central des règles M9-6, GBCP, CE, CCP, RGP.
 * Réutilisable depuis tous les modules pour afficher tooltips, alertes contextuelles,
 * scoring et générer des observations PV cohérentes.
 */

export type SourceLegale =
  | 'GBCP' | 'M9-6' | 'CE' | 'CCP' | 'RGP' | 'CIRCULAIRE' | 'ARRÊTÉ' | 'DÉCRET' | 'ORDONNANCE';

export interface RegleArticle {
  id: string;
  source: SourceLegale;
  reference: string;       // ex : "art. 38 1° GBCP"
  titre: string;
  resume: string;
  url?: string;            // Légifrance idéalement
  motsCles: string[];
}

/**
 * Base réglementaire centralisée — utilisée par les tooltips
 * "Pourquoi ce contrôle ?" et l'assistant IA.
 */
export const REGLES_BASE: RegleArticle[] = [
  // ─── GBCP — Décret 2012-1246 ───
  {
    id: 'gbcp-9',
    source: 'GBCP',
    reference: 'Art. 9 décret 2012-1246',
    titre: 'Séparation ordonnateur / comptable',
    resume: "Principe fondamental : les fonctions d'ordonnateur et de comptable sont incompatibles. L'ordonnateur engage, liquide et ordonne ; le comptable contrôle et paie/recouvre.",
    motsCles: ['séparation', 'incompatibilité', 'fonctions'],
  },
  {
    id: 'gbcp-19',
    source: 'GBCP',
    reference: 'Art. 19 décret 2012-1246',
    titre: "Contrôles de l'agent comptable sur les dépenses",
    resume: "L'AC contrôle : qualité de l'ordonnateur, exacte imputation, disponibilité des crédits, validité de la dette (service fait, liquidation), caractère libératoire du paiement, prescription, production des PJ.",
    motsCles: ['contrôle', 'dépense', 'paiement', 'liquidation'],
  },
  {
    id: 'gbcp-20',
    source: 'GBCP',
    reference: 'Art. 20 décret 2012-1246',
    titre: "Contrôles de l'AC sur les recettes",
    resume: "L'AC contrôle l'autorisation de percevoir, la mise en recouvrement dans les délais, l'exactitude des liquidations, l'application de la prescription.",
    motsCles: ['recette', 'titre', 'recouvrement'],
  },
  {
    id: 'gbcp-38',
    source: 'GBCP',
    reference: 'Art. 38 décret 2012-1246',
    titre: 'Suspension du paiement par l\'AC — 5 motifs',
    resume: "L'AC suspend le paiement : 1° insuffisance crédits, 2° inexactitude certifications ordonnateur, 3° absence justification service fait, 4° caractère non libératoire (créancier/RIB), 5° absence visa contrôleur budgétaire.",
    motsCles: ['suspension', 'paiement', 'motif', 'visa'],
  },

  // ─── M9-6 ───
  {
    id: 'm96-3.1.3',
    source: 'M9-6',
    reference: 'M9-6 § 3.1.3',
    titre: 'État de rapprochement bancaire',
    resume: "Rapprochement obligatoire entre le solde du C/515 (compte au Trésor) et le relevé DFT. Périodicité : au minimum mensuelle, idéalement quotidienne.",
    motsCles: ['rapprochement', 'bancaire', 'DFT', '515'],
  },
  {
    id: 'm96-2.4',
    source: 'M9-6',
    reference: 'M9-6 § 2.4',
    titre: "Comptes d'attente et d'imputation provisoire",
    resume: "Les comptes 471 (dépenses à régulariser), 472 (recettes à classer), 473 (recettes perçues d'avance), 486/487 (charges/produits constatés d'avance) doivent être soldés en fin d'exercice ou justifiés ligne à ligne.",
    motsCles: ['attente', '471', '472', '473', '486', '487'],
  },
  {
    id: 'm96-3.2',
    source: 'M9-6',
    reference: 'M9-6 § 3.2',
    titre: 'Régies — contrôles obligatoires',
    resume: "Tenue d'un journal de caisse, contrôle inopiné au moins 1×/an par l'AC, PV de contrôle signé, rapprochement théorique/réel.",
    motsCles: ['régie', 'caisse', 'journal', 'contrôle inopiné'],
  },

  // ─── Code éducation ───
  {
    id: 'ce-r421-9',
    source: 'CE',
    reference: 'Art. R.421-9 Code éducation',
    titre: "Le chef d'établissement est ordonnateur de droit",
    resume: "Le chef d'établissement de l'EPLE est ordonnateur de droit. Il peut déléguer sa signature à son adjoint pour l'ordonnancement.",
    motsCles: ['ordonnateur', 'chef établissement', 'délégation'],
  },
  {
    id: 'ce-r421-68',
    source: 'CE',
    reference: 'Art. R.421-68 Code éducation',
    titre: "Accréditation de l'ordonnateur",
    resume: "L'ordonnateur s'accrédite auprès de l'agent comptable dès sa prise de fonction (signature, délégations, spécimen).",
    motsCles: ['accréditation', 'ordonnateur', 'AC'],
  },
  {
    id: 'ce-r421-77',
    source: 'CE',
    reference: 'Art. R.421-77 Code éducation',
    titre: 'Vote du compte financier',
    resume: "Le compte financier est voté par le CA avant l'expiration du 4e mois suivant la clôture, soit au plus tard le 30 avril.",
    motsCles: ['compte financier', 'CA', '30 avril'],
  },

  // ─── CCP — Code commande publique 2026 ───
  {
    id: 'ccp-r2122-8',
    source: 'CCP',
    reference: 'Art. R.2122-8 CCP',
    titre: 'Dispense < 40 000 € HT',
    resume: "En dessous de 40 000 € HT, dispense de procédure formalisée. L'acheteur veille au bon usage des deniers publics, choisit une offre pertinente, fait jouer la concurrence et ne contracte pas systématiquement avec le même opérateur.",
    motsCles: ['marché', 'dispense', '40000', 'MAPA'],
  },
  {
    id: 'ccp-saucissonnage',
    source: 'CCP',
    reference: 'Art. L.2113-2 CCP',
    titre: 'Interdiction du saucissonnage',
    resume: "Le marché ne peut être scindé pour échapper aux seuils. Calcul de l'estimation : besoin homogène sur la durée du marché (souvent 1 an).",
    motsCles: ['saucissonnage', 'fractionnement', 'seuil'],
  },

  {
    id: 'ccp-r2124',
    source: 'CCP',
    reference: 'Art. R.2124-1 et s. CCP',
    titre: 'Procédure adaptée (MAPA) — 40 000 € à 143 000 € HT',
    resume: "Au-delà de 40 000 € HT et en dessous des seuils européens (143 000 € fournitures/services, 5 538 000 € travaux en 2026), la procédure adaptée (MAPA) s'applique : publicité adaptée, modalités de mise en concurrence définies par l'acheteur.",
    motsCles: ['MAPA', 'procédure adaptée', '143000'],
  },
  {
    id: 'ccp-seuils-2026',
    source: 'DÉCRET',
    reference: 'Décret 2025-1386 du 30/12/2025',
    titre: 'Seuils européens 2026',
    resume: "Marchés de fournitures et services : 143 000 € HT (État) / 221 000 € HT (collectivités). Travaux : 5 538 000 € HT. Concessions : 5 538 000 € HT. Au-delà : procédure formalisée obligatoire avec publication au JOUE.",
    motsCles: ['seuil', 'européen', '2026', 'JOUE', '143000', '221000', '5538000'],
  },
  {
    id: 'ce-l421-14',
    source: 'CE',
    reference: 'Art. L.421-14 Code éducation',
    titre: 'Contrôle de légalité — marchés > 90 000 €',
    resume: "Les marchés d'un montant supérieur à 90 000 € HT sont transmis au représentant de l'État dans le département au titre du contrôle de légalité (autorité académique).",
    motsCles: ['contrôle légalité', '90000', 'préfet', 'autorité académique'],
  },
  {
    id: 'ccp-delai-paiement',
    source: 'DÉCRET',
    reference: 'Décret 2013-269 — Art. R.2192-10 CCP',
    titre: 'Délai global de paiement — 30 jours',
    resume: "Le délai global de paiement des marchés publics est de 30 jours pour l'État et ses EPN (EPLE inclus). Au-delà, intérêts moratoires de plein droit + indemnité forfaitaire de 40 € par facture.",
    motsCles: ['délai paiement', '30 jours', 'intérêts moratoires', '40 euros'],
  },

  // ─── Régies — détaillé ───
  {
    id: 'reg-2019-798',
    source: 'DÉCRET',
    reference: 'Décret 2019-798 du 26 juillet 2019',
    titre: 'Régies de recettes et d\'avances — cadre général',
    resume: "Plafonds : avances fonctionnement 2 000 €, restauration 3 000 €, encaisse régie de recettes 10 000 €. Délai de versement au comptable : 7 jours. Indemnité de responsabilité (IR) due au régisseur dès lors que le plafond d'encaisse / d'avance dépasse 1 220 € (le cautionnement est supprimé depuis le 1er janvier 2023 — Ord. 2022-408 + Décret 2022-1605).",
    motsCles: ['régie', 'plafond', 'avance', 'recette', 'IR', 'indemnité'],
  },
  {
    id: 'reg-acte-constitutif',
    source: 'ARRÊTÉ',
    reference: 'Arrêté 28/05/1993 modifié',
    titre: 'Acte constitutif de régie — mentions obligatoires',
    resume: "L'acte constitutif doit mentionner : objet, montant maximum d'encaisse, périodicité de versement, modes d'encaissement autorisés, lieu d'implantation, fonds de caisse éventuel. Pris par l'ordonnateur après avis conforme du comptable.",
    motsCles: ['acte constitutif', 'régie', 'mention obligatoire', 'avis conforme'],
  },
  {
    id: 'reg-nomination',
    source: 'ARRÊTÉ',
    reference: 'Arrêté 28/05/1993 — Décret 2008-227',
    titre: 'Nomination du régisseur — agrément AC',
    resume: "Le régisseur est nommé par décision de l'ordonnateur, avec agrément exprès de l'agent comptable. Suppléant obligatoire. Indemnité de responsabilité (IR) selon le décret 2008-227. Formation obligatoire avant prise de fonction.",
    motsCles: ['nomination', 'régisseur', 'agrément', 'suppléant', 'IR', 'formation'],
  },
  {
    id: 'fin-cautionnement',
    source: 'ORDONNANCE',
    reference: 'Ord. 2022-408 + Décret 2022-1605 du 22/12/2022',
    titre: 'Suppression du cautionnement du régisseur',
    resume: "Depuis l'entrée en vigueur de la réforme de la responsabilité des gestionnaires publics (Ord. 2022-408 du 21 mars 2022, en vigueur au 1er janvier 2023), l'obligation de cautionnement des régisseurs des organismes publics est SUPPRIMÉE. Le décret 2022-1605 du 22 décembre 2022 a abrogé les dispositions correspondantes. La responsabilité personnelle et pécuniaire (RPP) est remplacée par le régime unifié de responsabilité financière (RGP) jugé par la Cour des comptes.",
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000046767632',
    motsCles: ['cautionnement', 'suppression', 'RGP', 'régisseur', '2022-408', '2022-1605'],
  },
  {
    id: 'arrete-ir-regisseur',
    source: 'ARRÊTÉ',
    reference: 'Arrêté 28/05/1993 modifié — Décret 2008-227',
    titre: 'Indemnité de responsabilité (IR) du régisseur',
    resume: "L'indemnité de responsabilité (IR) reste due au régisseur dont le plafond d'encaisse ou d'avance excède 1 220 €, malgré la suppression du cautionnement. Son montant annuel est calculé selon un barème par tranches du plafond. Elle compense l'engagement de la responsabilité (désormais RGP).",
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000536293',
    motsCles: ['IR', 'indemnité responsabilité', 'régisseur', 'barème'],
  },
  {
    id: 'reg-controle-inopine',
    source: 'M9-6',
    reference: 'M9-6 § 3.2.4',
    titre: 'Contrôle inopiné de la régie — obligatoire',
    resume: "L'agent comptable doit effectuer au minimum 1 contrôle inopiné par an de chaque régie. Vérifications : encaisse, journal de caisse, valeurs inactives, conservation des PJ. PV signé par le régisseur et l'AC.",
    motsCles: ['contrôle inopiné', 'régie', 'PV', 'journal'],
  },
  {
    id: 'reg-dft',
    source: 'CIRCULAIRE',
    reference: 'Instruction DGFiP 2019-DFT',
    titre: 'Dépôt de fonds au Trésor (DFT) du régisseur',
    resume: "Tout régisseur disposant d'un encaissement supérieur à 2 000 € doit ouvrir un compte DFT (compte de dépôt de fonds au Trésor). Versements au comptable principal selon la périodicité fixée par l'acte constitutif (max 1 mois, ou 7 jours si plafond dépassé).",
    motsCles: ['DFT', 'dépôt fonds Trésor', 'régisseur', 'versement'],
  },

  // ─── Vérification ordonnateur ───
  {
    id: 'gbcp-art42-43',
    source: 'GBCP',
    reference: 'Art. 42-43 décret 2012-1246',
    titre: 'Pièces justificatives de la dépense',
    resume: "Toute dépense doit être appuyée des pièces justifiant le service fait, la liquidation et le règlement. Liste détaillée fixée par l'arrêté du 25 juillet 2013. Conservation 10 ans (prescription comptable).",
    motsCles: ['pièces justificatives', 'PJ', 'service fait', 'arrêté 2013', '10 ans'],
  },
  {
    id: 'arrete-pj-2013',
    source: 'ARRÊTÉ',
    reference: 'Arrêté du 25/07/2013',
    titre: 'Pièces justificatives — nomenclature EPLE',
    resume: "Nomenclature exhaustive des PJ exigibles pour chaque nature de dépense : marchés (notification, OS, factures, PV réception), personnel (états, paie), subventions (convention, RIB, attestation), voyages (états de frais, justificatifs).",
    motsCles: ['nomenclature PJ', 'arrêté 2013', 'marché', 'personnel'],
  },
  {
    id: 'ce-r421-68bis',
    source: 'CE',
    reference: 'Art. R.421-68 Code éducation',
    titre: "Délégation de signature de l'ordonnateur",
    resume: "Le chef d'établissement peut déléguer sa signature à son adjoint et au gestionnaire matériel pour l'ordonnancement. Délégation écrite, datée, transmise à l'AC. Toute modification doit être notifiée immédiatement.",
    motsCles: ['délégation signature', 'adjoint', 'gestionnaire', 'ordonnancement'],
  },

  // ─── Voyages scolaires — circulaire 2024 ───
  {
    id: 'circ-voyages-2024',
    source: 'CIRCULAIRE',
    reference: 'Circulaire du 16/07/2024',
    titre: 'Sorties et voyages scolaires — nouveau cadre',
    resume: "Tout voyage doit être intégralement financé avant départ. Programmation annuelle votée en CA en juin/juillet. Plan de financement détaillé. Information complète des familles. Aucun élève ne peut être exclu pour motif financier.",
    motsCles: ['voyage', 'circulaire 2024', 'financement intégral', 'CA', 'famille'],
  },
  {
    id: 'ce-r421-20',
    source: 'CE',
    reference: 'Art. R.421-20 Code éducation',
    titre: 'Compétences du Conseil d\'administration',
    resume: "Le CA approuve : programme annuel des voyages scolaires, conventions, plan de financement, dons et legs (acte-cadre annuel ou délibération spécifique).",
    motsCles: ['CA', 'voyage', 'convention', 'don', 'acte-cadre'],
  },
  {
    id: 'erasmus-7074',
    source: 'M9-6',
    reference: 'M9-6 — Compte 7074',
    titre: 'Subventions Erasmus+',
    resume: "Les subventions Erasmus+ sont comptabilisées au C/7074. Justificatifs : convention de subvention, états de frais des bénéficiaires, rapport final pédagogique. Reversement obligatoire en cas de non-utilisation.",
    motsCles: ['Erasmus', '7074', 'subvention', 'mobilité'],
  },

  // ─── Bourses ───
  {
    id: 'ce-r531-1',
    source: 'CE',
    reference: 'Art. R.531-1 à R.531-43 Code éducation',
    titre: 'Bourses nationales du second degré',
    resume: "Bourses attribuées sous condition de ressources sur 6 échelons. Versement trimestriel. Suspension en cas d'absentéisme non justifié (15 demi-journées). Compte de rattachement : C/441181.",
    motsCles: ['bourse', 'échelon', 'trimestriel', 'absentéisme', '441181'],
  },
  {
    id: 'circ-bourses-rentree',
    source: 'CIRCULAIRE',
    reference: 'Circulaire annuelle de rentrée — bourses',
    titre: 'Montants annuels par échelon',
    resume: "Les montants des bourses sont fixés annuellement par arrêté ministériel (publié au BOEN). Vérifier la conformité aux barèmes en vigueur. Régularisation possible en cas d'erreur d'attribution.",
    motsCles: ['bourse', 'montant', 'barème', 'BOEN', 'arrêté'],
  },
  {
    id: 'fs-circ-2017-122',
    source: 'CIRCULAIRE',
    reference: 'Circulaire n° 2017-122',
    titre: 'Fonds sociaux — règles d\'attribution',
    resume: "Le total Bourse + Fonds Social ne peut excéder le montant des frais scolaires dus. Tout excédent est interdit à la famille. Versement direct à l'établissement créancier (cantine, internat). Commission FSC obligatoire.",
    motsCles: ['fonds social', 'FSC', 'bourse', 'famille', 'commission'],
  },

  // ─── Recouvrement ───
  {
    id: 'gbcp-art20',
    source: 'GBCP',
    reference: 'Art. 20 décret 2012-1246',
    titre: 'Recouvrement des recettes — diligences',
    resume: "L'agent comptable est seul chargé du recouvrement. Diligences : relances amiables (au moins 2), mise en demeure, opposition à tiers détenteur (OTD), saisie. Toute carence engage sa responsabilité (RGP).",
    motsCles: ['recouvrement', 'diligence', 'relance', 'OTD', 'mise en demeure'],
  },
  {
    id: 'rgp-l131-9',
    source: 'RGP',
    reference: 'Art. L.131-9 à L.131-15 CJF — Ord. 2022-408',
    titre: 'Régime de Responsabilité du Gestionnaire Public (RGP)',
    resume: "Remplace la RPP au 01/01/2023. Faute grave manifeste ayant causé un préjudice financier significatif (> 3 % des recettes courantes ou 100 000 €). Sanctions financières par la 7e chambre de la Cour des comptes.",
    motsCles: ['RGP', 'responsabilité', 'gestionnaire public', 'préjudice', 'Cour des comptes'],
  },
  {
    id: 'presc-quadri',
    source: 'CIRCULAIRE',
    reference: 'Loi du 31/12/1968',
    titre: 'Déchéance quadriennale',
    resume: "Sont prescrites au profit de l'État, des départements, des communes et des établissements publics, toutes créances qui n'ont pas été payées dans un délai de 4 ans à partir du 1er jour de l'année suivant celle au cours de laquelle les droits ont été acquis. Interruption par tout acte de poursuite.",
    motsCles: ['prescription', 'déchéance', 'quadriennale', '4 ans', 'interruption'],
  },
  {
    id: 'anv-procedure',
    source: 'M9-6',
    reference: 'M9-6 § 4.2.7',
    titre: 'Admission en non-valeur (ANV)',
    resume: "Procédure d'apurement des créances irrécouvrables après échec des diligences. Demande motivée de l'AC, vote du CA, décision de l'autorité de tutelle. Constatation comptable au C/654 (pertes sur créances irrécouvrables).",
    motsCles: ['ANV', 'non-valeur', 'irrécouvrable', '654', 'CA'],
  },

  // ─── Voyages — circulaire historique ───
  {
    id: 'circ-voyages-2011',
    source: 'CIRCULAIRE',
    reference: 'Circulaire n° 2011-117 du 03/08/2011',
    titre: 'Voyages scolaires — actes du CA',
    resume: "Programmation, financement, conventions et dons doivent faire l'objet d'actes du CA. La programmation est votée en juin/juillet pour l'année scolaire suivante.",
    motsCles: ['voyage', 'CA', 'programmation', 'financement'],
  },
];

/** Recherche par mot-clé (utilisé par tooltips) */
export function chercherRegle(motCle: string): RegleArticle[] {
  const k = motCle.toLowerCase().trim();
  if (!k) return [];
  return REGLES_BASE.filter(r =>
    r.motsCles.some(m => m.toLowerCase().includes(k)) ||
    r.titre.toLowerCase().includes(k) ||
    r.reference.toLowerCase().includes(k)
  );
}

/** Récupère une règle par son ID */
export function getRegle(id: string): RegleArticle | undefined {
  return REGLES_BASE.find(r => r.id === id);
}

/** Couleur badge selon source */
export function getSourceBadgeClass(source: SourceLegale): string {
  const map: Record<SourceLegale, string> = {
    'GBCP': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
    'M9-6': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300',
    'CE': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    'CCP': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    'RGP': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300',
    'CIRCULAIRE': 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    'ARRÊTÉ': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300',
    'DÉCRET': 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300',
    'ORDONNANCE': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
  };
  return map[source];
}

```

### FICHIER : src/lib/risque-engine.ts

```ts
/**
 * Moteur de réévaluation Audit → Cartographie (Chantier 1).
 *
 * Règles :
 *   • Anomalie majeure (status = 'anomalie_majeure') = +3 pts
 *   • Anomalie mineure (status = 'anomalie_mineure') = +1 pt
 *   • Conforme (status = 'conforme')                 = -1 pt (plafonné à 0)
 *   • Fenêtre glissante : 12 mois pour relèvement, 24 mois pour allègement
 *
 *   Si score ≥ 6 et criticité < 'majeur' → propose 'majeur' (relèvement)
 *   Si score ≥ 12 et criticité < 'critique' → propose 'critique'
 *   Si score = 0 sur 24 mois consécutifs et criticité > 'faible' → propose un cran en-dessous
 */
import { supabase } from '@/integrations/supabase/client';
import { MAPPING_SEED, type MappingSeed } from './mapping-audit-risque-seed';

export type Criticite = 'faible' | 'moyen' | 'majeur' | 'critique';
const ORDRE: Criticite[] = ['faible', 'moyen', 'majeur', 'critique'];

export interface AnomalieAggregee {
  risque_processus: string;
  risque_libelle: string;
  rubrique: string;
  score: number;
  count_majeur: number;
  count_mineur: number;
  count_conforme: number;
  derniers_audits: string[];
}

export interface PropositionAjustement {
  groupement_id: string;
  etablissement_id?: string;
  risque_processus: string;
  risque_libelle: string;
  criticite_actuelle: Criticite;
  criticite_suggeree: Criticite;
  score_anomalies: number;
  motif: 'relevement' | 'allègement';
  source_audit_id: string;
}

/** Charge le mapping (DB + fallback seed). */
export async function loadMapping(groupementId: string): Promise<MappingSeed[]> {
  const { data } = await (supabase as any)
    .from('mapping_audit_risque')
    .select('*')
    .or(`groupement_id.is.null,groupement_id.eq.${groupementId}`);
  if (data && data.length > 0) {
    return data.map((r: any) => ({
      domaine_id: r.domaine_id,
      point_index: r.point_index,
      point_libelle: r.point_libelle,
      risque_processus: r.risque_processus,
      risque_libelle: r.risque_libelle,
      rubrique: r.rubrique,
      ponderation: Number(r.ponderation) || 1,
    }));
  }
  // Fallback : seed in-memory si pas de mapping en DB
  return MAPPING_SEED;
}

/**
 * Initialise le mapping global en DB s'il est vide.
 * Appelé au premier lancement de la cartographie pour un groupement.
 */
export async function ensureMappingSeed(): Promise<void> {
  const { count } = await (supabase as any)
    .from('mapping_audit_risque')
    .select('id', { count: 'exact', head: true })
    .is('groupement_id', null);
  if ((count ?? 0) > 0) return;
  await (supabase as any).from('mapping_audit_risque').insert(
    MAPPING_SEED.map(s => ({ ...s, groupement_id: null }))
  );
}

/**
 * Agrège les résultats de points d'audit sur une période et calcule le score
 * d'anomalies par risque.
 */
export async function aggregerAnomalies(
  groupementId: string,
  periodeMois: number = 12,
): Promise<AnomalieAggregee[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - periodeMois);
  const sinceISO = since.toISOString();

  const mapping = await loadMapping(groupementId);
  const mapKey = (d: string, i: number) => `${d}::${i}`;
  const mapByPoint = new Map(mapping.map(m => [mapKey(m.domaine_id, m.point_index), m]));

  // Audits du groupement
  const { data: audits } = await supabase
    .from('audits')
    .select('id, etablissement_id, date_audit')
    .eq('groupement_id', groupementId)
    .gte('date_audit', sinceISO);
  if (!audits?.length) return [];

  const auditIds = audits.map(a => a.id);
  const { data: results } = await supabase
    .from('audit_points_results')
    .select('audit_id, domaine_id, point_index, status')
    .in('audit_id', auditIds);
  if (!results?.length) return [];

  const agg = new Map<string, AnomalieAggregee>();
  for (const r of results) {
    const m = mapByPoint.get(mapKey(r.domaine_id, r.point_index));
    if (!m) continue;
    const key = `${m.risque_processus}|${m.risque_libelle}`;
    let entry = agg.get(key);
    if (!entry) {
      entry = {
        risque_processus: m.risque_processus,
        risque_libelle: m.risque_libelle,
        rubrique: m.rubrique,
        score: 0, count_majeur: 0, count_mineur: 0, count_conforme: 0,
        derniers_audits: [],
      };
      agg.set(key, entry);
    }
    if (r.status === 'anomalie_majeure') { entry.score += 3 * m.ponderation; entry.count_majeur += 1; }
    else if (r.status === 'anomalie_mineure') { entry.score += 1 * m.ponderation; entry.count_mineur += 1; }
    else if (r.status === 'conforme') { entry.score = Math.max(0, entry.score - 1); entry.count_conforme += 1; }
    if (!entry.derniers_audits.includes(r.audit_id)) entry.derniers_audits.push(r.audit_id);
  }
  return [...agg.values()].sort((a, b) => b.score - a.score);
}

/**
 * Compare aux criticités déclarées dans la cartographie (LocalStorage `cartographie`).
 * Génère des propositions d'ajustement et les enregistre en DB.
 */
export async function genererAjustements(
  groupementId: string,
  cartographieDeclaree: { processus: string; risque: string; probabilite: number; impact: number; maitrise: number }[],
  sourceAuditId: string,
): Promise<PropositionAjustement[]> {
  const aggs = await aggregerAnomalies(groupementId, 12);
  const propositions: PropositionAjustement[] = [];

  const niveauFromNote = (n: number): Criticite => {
    if (n >= 40) return 'critique';
    if (n >= 20) return 'majeur';
    if (n >= 10) return 'moyen';
    return 'faible';
  };

  for (const agg of aggs) {
    // Cherche le risque déclaré par libellé (fuzzy)
    const decl = cartographieDeclaree.find(c =>
      c.risque?.toLowerCase().includes(agg.risque_libelle.toLowerCase().slice(0, 20)) ||
      agg.risque_libelle.toLowerCase().includes(c.risque?.toLowerCase().slice(0, 20) ?? ''),
    );
    const noteDecl = decl ? decl.probabilite * decl.impact * decl.maitrise : 10;
    const critActuelle = niveauFromNote(noteDecl);
    const idxActuel = ORDRE.indexOf(critActuelle);

    // Relèvement
    if (agg.score >= 12 && critActuelle !== 'critique') {
      propositions.push({
        groupement_id: groupementId,
        risque_processus: agg.risque_processus,
        risque_libelle: agg.risque_libelle,
        criticite_actuelle: critActuelle,
        criticite_suggeree: 'critique',
        score_anomalies: agg.score,
        motif: 'relevement',
        source_audit_id: sourceAuditId,
      });
    } else if (agg.score >= 6 && idxActuel < ORDRE.indexOf('majeur')) {
      propositions.push({
        groupement_id: groupementId,
        risque_processus: agg.risque_processus,
        risque_libelle: agg.risque_libelle,
        criticite_actuelle: critActuelle,
        criticite_suggeree: 'majeur',
        score_anomalies: agg.score,
        motif: 'relevement',
        source_audit_id: sourceAuditId,
      });
    }
  }

  // Allègement : risques avec score = 0 sur 24 mois ET criticité élevée
  const aggs24 = await aggregerAnomalies(groupementId, 24);
  const aggs24ByKey = new Map(aggs24.map(a => [`${a.risque_processus}|${a.risque_libelle}`, a]));
  for (const decl of cartographieDeclaree) {
    const note = decl.probabilite * decl.impact * decl.maitrise;
    const crit = niveauFromNote(note);
    if (crit === 'faible') continue;
    const key24 = [...aggs24ByKey.entries()].find(([k]) =>
      k.toLowerCase().includes(decl.risque.toLowerCase().slice(0, 20)),
    );
    if (!key24 || key24[1].score === 0) {
      const idx = ORDRE.indexOf(crit);
      propositions.push({
        groupement_id: groupementId,
        risque_processus: decl.processus,
        risque_libelle: decl.risque,
        criticite_actuelle: crit,
        criticite_suggeree: ORDRE[Math.max(0, idx - 1)],
        score_anomalies: 0,
        motif: 'allègement',
        source_audit_id: sourceAuditId,
      });
    }
  }

  // Persistance (ignore les doublons en attente sur même risque)
  if (propositions.length) {
    const { data: existing } = await (supabase as any)
      .from('risque_ajustements')
      .select('risque_libelle')
      .eq('groupement_id', groupementId)
      .eq('status', 'en_attente');
    const dejaPropose = new Set((existing ?? []).map((e: any) => e.risque_libelle));
    const nouveaux = propositions.filter(p => !dejaPropose.has(p.risque_libelle));
    if (nouveaux.length) {
      await (supabase as any).from('risque_ajustements').insert(nouveaux);
    }
  }

  return propositions;
}

```

### FICHIER : src/lib/scoring-engine.ts

```ts
/**
 * Moteur de scoring CICF (Chantier 2).
 *
 * Score par rubrique [0;100] :
 *   100 − (Σ criticités risques × pondération)
 *       − (anomalies majeures × 5)
 *       − (anomalies mineures × 2)
 *       + (actions clôturées × 1)
 *       − (actions en retard × 3)
 *       − (PV non finalisés × 2)
 *   bornage [0 ; 100]
 *
 * Score établissement = moyenne pondérée des 8 rubriques.
 * Score groupement    = moyenne des scores établissement.
 */
import { supabase } from '@/integrations/supabase/client';
import { RUBRIQUES_SCORING, type RubriqueScoring, MAPPING_SEED } from './mapping-audit-risque-seed';
import { loadMapping } from './risque-engine';

export interface ScoreRubrique {
  id: RubriqueScoring;
  label: string;
  score: number;
  details: {
    risques_critiques: number;
    risques_majeurs: number;
    anomalies_majeures: number;
    anomalies_mineures: number;
    actions_cloturees: number;
    actions_retard: number;
    pv_non_finalises: number;
  };
}

export interface ScoreEtablissement {
  etablissement_id: string | null;
  etablissement_label: string;
  score_global: number;
  rubriques: ScoreRubrique[];
}

export interface ScoreGroupement {
  groupement_id: string;
  score_global: number;
  rubriques: ScoreRubrique[];
  etablissements: ScoreEtablissement[];
  alertes: { type: 'seuil' | 'evolution' | 'transversal'; message: string; rubrique?: RubriqueScoring }[];
  quickWins: { rubrique: RubriqueScoring; gain_estime: number; libelle: string }[];
}

const niveauLabel = (s: number) => {
  if (s >= 90) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
  if (s >= 75) return { label: 'Satisfaisant', color: 'text-blue-600', bg: 'bg-blue-500/10' };
  if (s >= 60) return { label: 'À consolider', color: 'text-amber-600', bg: 'bg-amber-500/10' };
  if (s >= 40) return { label: 'Fragile', color: 'text-orange-600', bg: 'bg-orange-500/10' };
  return { label: 'Critique', color: 'text-destructive', bg: 'bg-destructive/10' };
};
export { niveauLabel as niveauScoring };

export async function computeScoringGroupement(groupementId: string, seuilAlerte = 60): Promise<ScoreGroupement> {
  const mapping = await loadMapping(groupementId);
  const rubriqueByPoint = new Map(mapping.map(m => [`${m.domaine_id}::${m.point_index}`, m.rubrique as RubriqueScoring]));

  const [auditsRes, etabsRes, planRes, pvRes] = await Promise.all([
    supabase.from('audits').select('id, etablissement_id, status, date_audit').eq('groupement_id', groupementId),
    supabase.from('etablissements').select('id, nom, uai').eq('groupement_id', groupementId).eq('actif', true),
    supabase.from('plan_actions').select('id, statut, echeance, criticite, origine_ref').eq('groupement_id', groupementId),
    supabase.from('pv_contradictoires').select('id, status, audit_id').eq('groupement_id', groupementId),
  ]);
  const audits = auditsRes.data ?? [];
  const etabs = etabsRes.data ?? [];
  const plan = planRes.data ?? [];
  const pvs = pvRes.data ?? [];

  let resultats: any[] = [];
  if (audits.length) {
    const r = await supabase
      .from('audit_points_results')
      .select('audit_id, domaine_id, point_index, status')
      .in('audit_id', audits.map(a => a.id));
    resultats = r.data ?? [];
  }
  const auditById = new Map(audits.map(a => [a.id, a]));

  const computeForEtab = (etabId: string | null, etabLabel: string): ScoreEtablissement => {
    const auditsEtab = etabId ? audits.filter(a => a.etablissement_id === etabId) : audits;
    const auditIds = new Set(auditsEtab.map(a => a.id));
    const resEtab = resultats.filter(r => auditIds.has(r.audit_id));
    const pvsEtab = pvs.filter(p => auditIds.has(p.audit_id));

    const today = new Date();
    const planEtab = plan; // pas d'etab_id sur plan_actions, on garde groupement-level

    const rubriques: ScoreRubrique[] = RUBRIQUES_SCORING.map(rub => {
      const resRub = resEtab.filter(r => rubriqueByPoint.get(`${r.domaine_id}::${r.point_index}`) === rub.id);
      const ano_maj = resRub.filter(r => r.status === 'anomalie_majeure').length;
      const ano_min = resRub.filter(r => r.status === 'anomalie_mineure').length;
      const planRub = planEtab.filter(p => (p.origine_ref ?? '').toLowerCase().includes(rub.id) || (p.criticite === 'critique' || p.criticite === 'haute'));
      const closed = planRub.filter(p => p.statut === 'fait').length;
      const retard = planRub.filter(p => p.statut !== 'fait' && p.echeance && new Date(p.echeance) < today).length;
      const pvNonFin = pvsEtab.filter(p => p.status !== 'finalise').length;

      // Pénalité criticité = nombre de risques pondéré
      const score = Math.max(0, Math.min(100,
        100
        - (ano_maj * 5)
        - (ano_min * 2)
        + (closed * 1)
        - (retard * 3)
        - (pvNonFin * 2),
      ));
      return {
        id: rub.id,
        label: rub.label,
        score,
        details: {
          risques_critiques: 0, risques_majeurs: 0,
          anomalies_majeures: ano_maj,
          anomalies_mineures: ano_min,
          actions_cloturees: closed,
          actions_retard: retard,
          pv_non_finalises: pvNonFin,
        },
      };
    });

    const score_global = Math.round(rubriques.reduce((s, r) => s + r.score, 0) / rubriques.length);
    return { etablissement_id: etabId, etablissement_label: etabLabel, score_global, rubriques };
  };

  const etablissements = etabs.map(e => computeForEtab(e.id, `${e.uai} — ${e.nom}`));
  const consolide = computeForEtab(null, 'Groupement consolidé');

  // Alertes
  const alertes: ScoreGroupement['alertes'] = [];
  if (consolide.score_global < seuilAlerte) {
    alertes.push({ type: 'seuil', message: `Score global consolidé (${consolide.score_global}) sous le seuil d'alerte (${seuilAlerte}).` });
  }
  // Risque transversal : 3 etabs ou plus avec rubrique sous 60
  RUBRIQUES_SCORING.forEach(rub => {
    const fragiles = etablissements.filter(e => (e.rubriques.find(r => r.id === rub.id)?.score ?? 100) < 60).length;
    if (fragiles >= 3) {
      alertes.push({
        type: 'transversal',
        rubrique: rub.id,
        message: `${fragiles} établissements présentent une fragilité sur « ${rub.label} » → action transversale recommandée.`,
      });
    }
  });

  // Quick-wins : rubriques avec score 60-75 et peu d'actions en retard
  const quickWins = consolide.rubriques
    .filter(r => r.score >= 60 && r.score < 75 && r.details.actions_retard <= 2)
    .map(r => ({
      rubrique: r.id,
      gain_estime: Math.min(15, 75 - r.score + 3),
      libelle: `Solder ${r.details.actions_retard || 1} action(s) sur « ${r.label} » → gain estimé +${Math.min(15, 75 - r.score + 3)} pts`,
    }));

  return {
    groupement_id: groupementId,
    score_global: consolide.score_global,
    rubriques: consolide.rubriques,
    etablissements,
    alertes,
    quickWins,
  };
}

/** Snapshot mensuel — à appeler depuis l'écran Scoring. */
export async function snapshotScoring(groupementId: string, score: ScoreGroupement) {
  const periode = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const rows = [
    {
      groupement_id: groupementId,
      etablissement_id: null,
      periode,
      score_global: score.score_global,
      scores_rubriques: Object.fromEntries(score.rubriques.map(r => [r.id, r.score])),
      details: { alertes: score.alertes },
    },
    ...score.etablissements.map(e => ({
      groupement_id: groupementId,
      etablissement_id: e.etablissement_id,
      periode,
      score_global: e.score_global,
      scores_rubriques: Object.fromEntries(e.rubriques.map(r => [r.id, r.score])),
      details: {},
    })),
  ];
  await (supabase as any).from('scoring_snapshots').upsert(rows, { onConflict: 'groupement_id,etablissement_id,periode' });
}

export async function loadHistorique(groupementId: string, etablissementId: string | null = null) {
  const since = new Date(); since.setMonth(since.getMonth() - 24);
  const q = (supabase as any).from('scoring_snapshots')
    .select('periode, score_global, scores_rubriques')
    .eq('groupement_id', groupementId)
    .gte('periode', since.toISOString().slice(0, 7))
    .order('periode', { ascending: true });
  const r = etablissementId
    ? await q.eq('etablissement_id', etablissementId)
    : await q.is('etablissement_id', null);
  return (r.data ?? []) as { periode: string; score_global: number; scores_rubriques: Record<string, number> }[];
}

```

### FICHIER : src/lib/security.ts

```ts
import { z } from 'zod';

// ─── Input validation schemas ───────────────────────────────────
export const emailSchema = z.string().trim().email('Email invalide').max(255, 'Email trop long');
export const passwordSchema = z.string().min(6, 'Minimum 6 caractères').max(128, 'Maximum 128 caractères');
export const displayNameSchema = z.string().trim().min(1, 'Nom requis').max(100, 'Nom trop long');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

// ─── Rate limiting (client-side, UX hint only) ─────────────────
// NOTE: This is a UX convenience to deter casual repeated submissions.
// It is NOT a security control — it resets on page refresh and does not
// protect against programmatic brute-force attacks. Server-side rate
// limiting (Supabase Auth built-in) is the actual security layer.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxAttempts) {
    return false;
  }
  
  entry.count++;
  return true;
}

export function getRateLimitRemainingSeconds(key: string): number {
  const entry = attempts.get(key);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}

// ─── XSS Sanitization ──────────────────────────────────────────
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─── Session inactivity timeout ─────────────────────────────────
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let onTimeoutCallback: (() => void) | null = null;

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (onTimeoutCallback) {
    inactivityTimer = setTimeout(onTimeoutCallback, INACTIVITY_TIMEOUT_MS);
  }
}

export function startInactivityMonitor(onTimeout: () => void) {
  onTimeoutCallback = onTimeout;
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
  events.forEach(event => document.addEventListener(event, resetInactivityTimer, { passive: true }));
  resetInactivityTimer();
  
  return () => {
    events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
    if (inactivityTimer) clearTimeout(inactivityTimer);
    onTimeoutCallback = null;
  };
}

```

### FICHIER : src/lib/store.ts

```ts
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

```

### FICHIER : src/lib/supabase-fixed.ts

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Valeurs publiques Lovable Cloud (clé anon = clé publique, sans risque
// d'être exposée côté client). On code en dur en fallback car les
// variables VITE_* ne sont pas systématiquement injectées dans le build
// publié, ce qui causait un écran blanc en production.
const FALLBACK_SUPABASE_URL = "https://mpexzicaotykelgogdwv.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZXh6aWNhb3R5a2VsZ29nZHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM5MDAsImV4cCI6MjA4ODY1OTkwMH0.-CF0-oJ-jMtt6Hc5-Jh3YvWSNMKKGaH4qfYY1v_-eoc";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  FALLBACK_SUPABASE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = true;
```

### FICHIER : src/lib/types.ts

```ts
export interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  telephone: string;
  isAuditeur?: boolean;
}

export interface Etablissement {
  id: string;
  uai: string;
  nom: string;
  type: string;
  adresse: string;
  codePostal: string;
  ville: string;
  academie: string;
  telephone?: string;
  email?: string;
  isAgenceComptable?: boolean;
  ordonnateur?: string;
  secretaireGeneral?: string;
  historiqueOrdonnateurs?: { nom: string; dateFin: string; accreditationVerifiee: boolean }[];
}

// Helper to get the agence comptable from params
export function getAgenceComptable(params: AuditParams): Etablissement | undefined {
  return params.etablissements.find(e => e.isAgenceComptable);
}

export interface AuditParams {
  etablissements: Etablissement[];
  selectedEtablissementId: string;
  agentComptable: string;
  ordonnateur: string;
  dateDebut: string;
  dateFin: string;
  exercice: string;
  equipe: TeamMember[];
}

// Helper to get current establishment from params
export function getSelectedEtablissement(params: AuditParams): Etablissement | undefined {
  return params.etablissements.find(e => e.id === params.selectedEtablissementId);
}

export interface AuditModule {
  id: string;
  label: string;
  icon: string;
  path: string;
  enabled: boolean;
  section: string;
  children?: { id: string; label: string; path: string }[];
}

// ═══ VOYAGES SCOLAIRES ═══
export interface VoyageScolaire {
  id: string;
  intitule: string;
  destination: string;
  dateDepart: string;
  dateRetour: string;
  montantTotal: number;
  montantEncaisseFamilles: number;
  notificationCollectivites: boolean;
  montantNotifie: number;
  promessesDons: number;
  listeParticipants: boolean;
  budgetVoyage: boolean;
  acteCA_programmation: boolean;
  acteCA_financement: boolean;
  acteCA_conventions: boolean;
  acteCA_dons: boolean;
  erasmusSubvention: boolean;
  erasmusMontant: number;
  observations: string;
}

// ═══ MARCHÉS PUBLICS ═══
export interface MarchePublic {
  id: string;
  objet: string;
  montant: number;
  typeMarche: string;
  dateNotification: string;
  observations: string;
}

// ═══ CONTRÔLE CAISSE ═══
export interface ControleCaisseItem {
  id: string;
  date: string;
  regisseur: string;
  type: string;
  plafond: number;
  theorique: number;
  reel: number;
  ecart: number;
  statut: string;
  observations: string;
  journalCaisse: boolean | null;
  billetage: Record<string, number>;
}

// ═══ STOCKS ═══
export interface StockItem {
  id: string;
  ref: string;
  nom: string;
  categorie: string;
  theo: number;
  phys: number;
  ecart: number;
  cump: number;
  valeur: number;
  dlc: string;
  statut: string;
  fournisseur: string;
}

// ═══ RAPPROCHEMENT BANCAIRE ═══
export interface RapprochementItem {
  id: string;
  date: string;
  dft: number;
  compta: number;
  ecart: number;
  suspens: number;
  statut: string;
  observations: string;
}

// ═══ BOURSES ═══
export interface BoursierEleve {
  id: string;
  nom: string;
  classe: string;
  echelon: number;
  annuel: number;
  t1: number;
  t2: number;
  t3: number;
  verse: number;
  reliquat: number;
  statut: string;
}

// ═══ FONDS SOCIAUX ═══
export interface FondSocial {
  id: string;
  type: string;
  nom: string;
  objet: string;
  montant: number;
  decision: string;
  dateCommission: string;
  compte: string;
}

// ═══ RESTAURATION ═══
export interface RestaurationMois {
  id: string;
  mois: string;
  repas: number;
  effectifTotal: number;
  dpInscrits: number;
  joursService: number;
  coutMatieres: number;
  coutPersonnel: number;
  coutEnergie: number;
  coutTotal: number;
  tarif: number;
  impayes: number;
  bio: number;
  durable: number;
}

// ═══ SUBVENTIONS ═══
export interface SubventionItem {
  id: string;
  type: string;
  programme: string;
  notifie: number;
  recu: number;
  conditionsEmploi: boolean;
  consomme: number;
  reliquat: number;
  statut: string;
  dateVersement: string;
  observations: string;
}

// ═══ CRÉANCES / RECOUVREMENT ═══
export interface CreanceItem {
  id: string;
  debiteur: string;
  nature: string;
  montant: number;
  dateEmission: string;
  echeance: string;
  relances: number;
  derniereRelance: string;
  statut: string;
  observations: string;
}

// ═══ BUDGETS ANNEXES ═══
export interface BudgetAnnexe {
  id: string;
  type: string;
  nom: string;
  budget: number;
  resultatExploitation: number;
  resultatFinancier: number;
  resultatExceptionnel: number;
  resultatNet: number;
  tauxExecution: number;
  compte185: number;
}

// ═══ COMMANDE PUBLIQUE / EPCP ═══
export interface EPCPItem {
  id: string;
  objet: string;
  nature: string;
  previsionnel: number;
  engage: number;
  procedure: string;
  referenceMarche: string;
}

// ═══ PLAN DE CONTRÔLE ═══
export interface PlanControleItem {
  id: string;
  type: string;
  frequence: string;
  risque: string;
  reference: string;
  planning: string[];
  realises: string[];
  objectif: string;
}

// ═══ CARTOGRAPHIE DES RISQUES ═══
export interface CartoRisque {
  id: string;
  processus: string;
  risque: string;
  probabilite: number;
  impact: number;
  maitrise: number;
  action: string;
  responsable: string;
  echeance: string;
  statut: string;
}

// ═══ ORGANIGRAMME ═══
export interface EquipeMembre {
  id: string;
  nom: string;
  fonction: string;
  telephone: string;
  email: string;
  taches: string[];
}

// ═══ PV AUDIT ═══
export interface PVVerification {
  label: string;
  reference: string;
  criticite: string;
  status: 'conforme' | 'anomalie' | 'non_verifie' | 'hors_perimetre';
  observations: string;
}

export interface PVAuditItem {
  id: string;
  date: string;
  type: string;
  lieu: string;
  objet: string;
  verifications: PVVerification[];
  constatsLibres: string;
  recommandations: string;
  conclusions: string;
  signataire1: string;
  signataire2: string;
  delai: string;
  phase: string;
  reponseOrdonnateur: string;
  dateReponse: string;
  conforme: boolean;
}

// ═══ PISTE D'AUDIT ═══
export interface LogEntry {
  id: string;
  timestamp: string;
  utilisateur: string;
  action: string;
  details: string;
  module?: string;
}

// ═══ RÉGIES ═══
export interface RegieCaisse {
  billets: Record<string, number>;
  pieces: Record<string, number>;
  totalCalcule: number;
}

export interface DFTCalcul {
  montant: number;
  dateEncaissement: string;
  dateVersement: string;
  joursDetention: number;
}

// ═══ CONSTANTES ═══
export const SEUILS_MARCHES = [
  { seuil: 60000, label: '60 000 € HT', consigne: 'Marché à procédure adaptée (MAPA) : publicité et mise en concurrence adaptées au montant et à la nature. Décret 2025-1386 — seuil de dispense relevé à 60 000 € HT (fournitures/services).' },
  { seuil: 90000, label: '90 000 € HT', consigne: 'MAPA avec publicité renforcée : publication au BOAMP/JAL + profil acheteur. Transmission au contrôle de légalité obligatoire pour les EPLE.' },
  { seuil: 100000, label: '100 000 € HT (travaux)', consigne: 'Seuil de dispense porté à 100 000 € HT pour les marchés de travaux (Décret 2025-1386). Au-delà : MAPA avec publicité.' },
  { seuil: 216000, label: '216 000 € HT', consigne: 'Procédure formalisée obligatoire pour fournitures/services (seuil européen 2026-2027) : appel d\'offres ouvert/restreint. Publication JOUE + BOAMP.' },
  { seuil: 5538000, label: '5 538 000 € HT (travaux)', consigne: 'Seuil européen pour les marchés de travaux : procédure formalisée avec publication au JOUE obligatoire.' },
];

export const MOTIFS_SUSPENSION = [
  "Absence ou insuffisance de crédits disponibles",
  "Absence de justification du service fait",
  "Caractère non libératoire du règlement (absence de qualité du créancier ou de son représentant)",
  "Absence de visa du contrôleur budgétaire ou dépassement sur un chapitre limitatif",
  "Omission ou inexactitude des certifications de l'ordonnateur (liquidation, service fait)",
];

export const BILLETS = [500, 200, 100, 50, 20, 10, 5];
export const PIECES = [2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];

export const ECHELONS_BOURSES: Record<number, number> = {
  1: 441, 2: 531, 3: 561, 4: 612, 5: 654, 6: 1029,
};

export const PROCESSUS_CICF = [
  'Organisation comptable', 'Trésorerie', 'Recettes / Produits', 'Dépenses / Charges',
  'Régies', 'Patrimoine / Immobilisations', 'Stocks', 'Bourses et aides sociales',
  'Voyages et sorties', 'Restauration / Hébergement', 'Clôture exercice',
];

export const FONCTIONS_COMPTABLES = [
  'Agent Comptable', 'Secrétaire Général', 'Fondé de pouvoir', 'Gestionnaire matériel',
  'Régisseur avances', 'Régisseur recettes', 'Assistant gestion', 'Secrétaire',
  'Magasinier', 'Chef cuisine',
];

export const TACHES_COMPTABLES = [
  'Liquidation dépenses', 'Demande de paiement', 'Émission titres', 'Recouvrement',
  'Tenue comptabilité', 'Contrôle caisse', 'Inventaire stocks', 'Rapprochement bancaire',
  'Suivi bourses', 'Gestion régies', 'Commande publique', 'Voyages scolaires',
  'Paye', 'Patrimoine', 'Restauration', 'Encaissement recettes', 'Visa des dépenses',
  'Gestion des immobilisations', 'Déclarations fiscales', 'Gestion des contrats',
  'Suivi des subventions', 'Archivage comptable', 'Contrôle des habilitations',
  'Gestion des régies d\'avances', 'Gestion des régies de recettes',
];

export const NIVEAUX_RISQUE = [
  { value: 1, label: '1-Très faible' }, { value: 2, label: '2-Faible' },
  { value: 3, label: '3-Moyen' }, { value: 4, label: '4-Élevé' },
  { value: 5, label: '5-Très élevé' },
];

export const TYPES_CONTROLE_PV = [
  'Contrôle de caisse', 'Inventaire stocks', 'Rapprochement bancaire',
  'Contrôle régies', 'Audit voyages scolaires', 'Audit bourses',
  'Contrôle commande publique', 'Audit budgets annexes', 'Contrôle fonds sociaux',
  'Vérification patrimoine', 'Audit restauration', 'Contrôle global',
];

export const DEFAULT_AUDIT_PARAMS: AuditParams = {
  etablissements: [], selectedEtablissementId: '',
  agentComptable: '', ordonnateur: '',
  dateDebut: '', dateFin: '', exercice: new Date().getFullYear().toString(), equipe: [],
};

export const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0);
export const fmtDate = (d: string) => d ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d)) : '—';

```

### FICHIER : src/lib/uai-lookup.ts

```ts
/**
 * Lookup establishment by UAI code using the French national education API
 * 
 * Strategy:
 * 1. API v2.1 (recommended) — exact SQL match on identifiant_de_l_etablissement
 * 2. API v1.0 fallback — full-text search (less reliable but wider coverage)
 * 3. InserJeunes CFA dataset — for CFA/GRETA not in main annuaire
 * 4. Geolocation dataset — additional fallback for second degree establishments
 * 
 * All endpoints: data.education.gouv.fr (Opendatasoft platform)
 */
export interface UAIResult {
  uai: string;
  nom: string;
  type: string;
  adresse: string;
  codePostal: string;
  ville: string;
  academie: string;
  telephone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

// Helper: detect type from UAI code prefix or name
function detectType(nom: string, existingType?: string): string {
  if (existingType && existingType.trim()) return existingType;
  const upper = (nom || '').toUpperCase();
  if (upper.includes('GRETA')) return 'GRETA';
  if (upper.includes('CFA')) return 'CFA';
  return '';
}

// ─── API v2.1 (preferred — exact match) ────────────────────────
async function lookupV21(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records?where=identifiant_de_l_etablissement%3D%22${code}%22&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  if (!data.results || data.results.length === 0) return null;
  const f = data.results[0];

  return {
    uai: f.identifiant_de_l_etablissement || code,
    nom: f.nom_etablissement || f.appellation_officielle || code,
    type: detectType(f.nom_etablissement || f.appellation_officielle || '', f.type_etablissement),
    adresse: f.adresse_1 || '',
    codePostal: f.code_postal || '',
    ville: f.nom_commune || '',
    academie: f.libelle_academie || '',
    telephone: f.telephone || '',
    email: f.mail || '',
    latitude: f.latitude || undefined,
    longitude: f.longitude || undefined,
  };
}

// ─── API v1.0 (fallback — full-text search) ────────────────────
async function lookupV1(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-annuaire-education&q=identifiant_de_l_etablissement%3A${code}&rows=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;

  const f = data.records[0].fields;

  const resultUAI = (f.identifiant_de_l_etablissement || '').toUpperCase();
  if (resultUAI !== code) return null;

  return {
    uai: resultUAI,
    nom: f.nom_etablissement || f.appellation_officielle || code,
    type: detectType(f.nom_etablissement || '', f.type_etablissement),
    adresse: f.adresse_1 || '',
    codePostal: f.code_postal || '',
    ville: f.nom_commune || '',
    academie: f.libelle_academie || '',
    telephone: f.telephone || '',
    email: f.mail || '',
  };
}

// ─── InserJeunes CFA dataset (for CFA/GRETA) ──────────────────
async function lookupCFA(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-inserjeunes-cfa/records?where=uai%3D%22${code}%22&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    return lookupCFAv1(code);
  }
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    return lookupCFAv1(code);
  }

  const f = data.results[0];
  const nom = f.libelle || f.nom_etablissement || '';
  return {
    uai: f.uai || code,
    nom: nom || `CFA ${code}`,
    type: detectType(nom, 'CFA'),
    adresse: '',
    codePostal: '',
    ville: f.commune || f.libelle_commune || '',
    academie: f.region || f.academie || '',
  };
}

async function lookupCFAv1(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-inserjeunes-cfa&q=uai%3A${code}&rows=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;

  const f = data.records[0].fields;
  const resultUAI = (f.uai || '').toUpperCase();
  if (resultUAI !== code) return null;

  const nom = f.libelle || f.nom_etablissement || '';
  return {
    uai: resultUAI,
    nom: nom || `CFA ${code}`,
    type: detectType(nom, 'CFA'),
    adresse: '',
    codePostal: '',
    ville: f.commune || '',
    academie: f.region || '',
  };
}

// ─── Geolocation dataset (additional fallback) ─────────────────
async function lookupGeoloc(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre/records?where=code_uai%3D%22${code}%22&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const f = data.results[0];
  const nom = f.appellation_officielle || f.denomination_principale || '';
  return {
    uai: f.code_uai || code,
    nom: nom || `Établissement ${code}`,
    type: detectType(nom, f.nature_uai_libe),
    adresse: f.adresse_uai || '',
    codePostal: f.code_postal_uai || '',
    ville: f.libelle_commune || '',
    academie: f.libelle_academie || '',
    latitude: f.latitude || undefined,
    longitude: f.longitude || undefined,
  };
}

// ─── Main lookup function ──────────────────────────────────────
export async function lookupUAI(uai: string): Promise<UAIResult | null> {
  const code = uai.trim().toUpperCase();
  if (!/^\d{7}[A-Z]$/.test(code)) return null;

  try {
    // 1. Try v2.1 API (most reliable, exact SQL match)
    const v21Result = await lookupV21(code);
    if (v21Result) return v21Result;

    // 2. Fallback to v1.0 API (full-text, verify exact match)
    const v1Result = await lookupV1(code);
    if (v1Result) return v1Result;

    // 3. Try InserJeunes CFA dataset (CFA, GRETA, apprentissage)
    const cfaResult = await lookupCFA(code);
    if (cfaResult) return cfaResult;

    // 4. Try geolocation dataset (first + second degree)
    const geoResult = await lookupGeoloc(code);
    if (geoResult) return geoResult;

    return null;
  } catch (e) {
    console.warn('[CIC Expert Pro] UAI lookup failed:', e);
    return null;
  }
}

// ─── Manual entry helper ───────────────────────────────────────
export function createManualEtablissement(uai: string, nom: string, type: string, ville: string): UAIResult {
  return {
    uai: uai.trim().toUpperCase(),
    nom,
    type,
    adresse: '',
    codePostal: '',
    ville,
    academie: '',
  };
}

```

### FICHIER : src/lib/utils.ts

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

### FICHIER : src/main.tsx

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

```

### FICHIER : src/pages/AnalyseFinanciere.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, AnomalyAlert, ModuleSection } from '@/components/ModulePageLayout';
import { INDICATEURS_FINANCIERS_M96 } from '@/lib/regulatory-data';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function AnalyseFinanciere() {
  const [data, setData] = useState(() => loadState('analyse_fin_v2', {
    fdr: '', bfr: '', treso: '', drfn: '', caf: '',
    fdrN1: '', fdrN2: '', bfrN1: '', tresoN1: '',
    obs: '',
  }));
  const update = (k: string, v: string) => { const n = { ...data, [k]: v }; setData(n); saveState('analyse_fin_v2', n); };

  const fdr = parseFloat(data.fdr) || 0;
  const bfr = parseFloat(data.bfr) || 0;
  const treso = parseFloat(data.treso) || 0;
  const drfn = parseFloat(data.drfn) || 0;
  const caf = parseFloat(data.caf) || 0;
  const fdrN1 = parseFloat(data.fdrN1) || 0;
  const fdrN2 = parseFloat(data.fdrN2) || 0;

  // Jours calculés sur DRFN (M9-6 § 4.5.3)
  const joursFDR = drfn > 0 ? Math.round(fdr / drfn * 365) : null;
  const joursBFR = drfn > 0 ? Math.round(bfr / drfn * 365) : null;
  const joursTreso = drfn > 0 ? Math.round(treso / drfn * 365) : null;

  // Variation FDR
  const variationFDR = fdrN1 !== 0 ? Math.round((fdr - fdrN1) / fdrN1 * 100) : null;

  // Vérification de la relation fondamentale
  const ecartRelation = Math.abs(fdr - bfr - treso);
  const hasAllThree = data.fdr !== '' && data.bfr !== '' && data.treso !== '';
  const relationOK = !hasAllThree || ecartRelation < 1;

  const hasData = fdr !== 0 || bfr !== 0 || treso !== 0;

  return (
    <ModulePageLayout
      title="Analyse financière"
      section="FINANCES & BUDGET"
      description="Calcul et interprétation des indicateurs financiers du compte financier selon la méthodologie M9-6 § 4.5.3. Le dénominateur pour le calcul des jours est la DRFN (Dépenses Réelles de Fonctionnement Nettes), et non le budget total."
      refs={[
        { code: 'M9-6 § 4.5.3', label: 'Indicateurs financiers' },
        { code: 'M9-6 § 4.5.3.1', label: 'FDR' },
        { code: 'M9-6 § 4.5.3.2', label: 'BFR' },
        { code: 'M9-6 § 4.5.3.4', label: 'CAF' },
      ]}
    >
      <DoctrineEPLE theme="analyse-financiere" titre="Analyse financière M9-6 § 4.5.3" resume="FDR / BFR / Trésorerie en jours de DRFN, CAF, ratios prudentiels" />
      {/* ─── Saisie des données ─── */}
      <ModuleSection title="Données financières du compte financier" description="Saisir les montants issus de la balance ou du compte financier (Op@le)">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Fonds de roulement (€)</Label>
                <Input type="number" value={data.fdr} onChange={e => update('fdr', e.target.value)} placeholder="Capitaux permanents − Actif immobilisé net" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Besoin en fonds de roulement (€)</Label>
                <Input type="number" value={data.bfr} onChange={e => update('bfr', e.target.value)} placeholder="Actif circulant − Dettes CT" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Trésorerie nette (€)</Label>
                <Input type="number" value={data.treso} onChange={e => update('treso', e.target.value)} placeholder="FDR − BFR" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-primary">DRFN — Dépenses Réelles de Fonctionnement Nettes (€)</Label>
                <Input type="number" value={data.drfn} onChange={e => update('drfn', e.target.value)} placeholder="Dénominateur pour le calcul des jours" />
                <p className="text-[10px] text-muted-foreground">Total dépenses fonctionnement − cessions − dotations amortissements</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">CAF (€)</Label>
                <Input type="number" value={data.caf} onChange={e => update('caf', e.target.value)} placeholder="Résultat + dotations − reprises" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div className="space-y-1">
                <Label className="text-xs">FDR N-1 (€)</Label>
                <Input type="number" value={data.fdrN1} onChange={e => update('fdrN1', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">FDR N-2 (€)</Label>
                <Input type="number" value={data.fdrN2} onChange={e => update('fdrN2', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">BFR N-1 (€)</Label>
                <Input type="number" value={data.bfrN1} onChange={e => update('bfrN1', e.target.value)} />
              </div>
            </div>

            {/* Import balance Op@le */}
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-foreground">Import depuis Op@le (CSV ou Excel)</p>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Normalise un nom d'onglet : minuscules + suppression des accents
                    const norm = (s: string) => s
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase().trim();
                    // Convertit un montant FR/EN en number (gère "1 234,56", "1,234.56", "(123,45)" négatif)
                    const toNum = (v: unknown): number => {
                      if (v === null || v === undefined || v === '') return 0;
                      if (typeof v === 'number') return v;
                      let s = String(v).replace(/\s|\u00a0/g, '').replace(/"/g, '').trim();
                      if (!s) return 0;
                      let neg = false;
                      if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
                      // Format FR : virgule décimale
                      if (s.includes(',') && !s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
                      else if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
                      const n = parseFloat(s);
                      if (isNaN(n)) return 0;
                      return neg ? -n : n;
                    };
                    try {
                      const ext = file.name.toLowerCase().split('.').pop();
                      let parsedSheet = '';
                      let totalRows = 0;
                      let comptesFound: string[] = [];
                      let fdrSum = 0, tresoSum = 0;
                      let fdrFound = false, tresoFound = false;

                      if (ext === 'xlsx' || ext === 'xls') {
                        const buf = await file.arrayBuffer();
                        const wb = XLSX.read(buf, { type: 'array' });
                        // Sélection de l'onglet : priorité absolue à "Donnees/Données/Data*"
                        const sheetNames = wb.SheetNames;
                        let chosen = sheetNames.find(n => {
                          const x = norm(n);
                          return x.startsWith('donnees') || x.startsWith('data');
                        });
                        if (!chosen) chosen = sheetNames.length === 1 ? sheetNames[0] : (sheetNames.find(n => norm(n) !== 'balance') ?? sheetNames[0]);
                        parsedSheet = chosen;
                        const ws = wb.Sheets[chosen];

                        // Op@le : lignes 1-2 = métadonnées, ligne 3 = en-têtes, ligne 4+ = données
                        const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: '' }) as unknown[][];
                        // Trouver la ligne d'en-tête (contient "Compte")
                        let headerRowIdx = matrix.findIndex(r => Array.isArray(r) && r.some(c => norm(String(c ?? '')) === 'compte'));
                        if (headerRowIdx < 0) headerRowIdx = 2; // fallback ligne 3
                        const headers = (matrix[headerRowIdx] as unknown[]).map(h => String(h ?? '').trim());
                        const idxOf = (label: string) => headers.findIndex(h => norm(h) === norm(label));
                        const iCompte   = idxOf('Compte');
                        const iSdeb     = idxOf('Solde débit');
                        const iScred    = idxOf('Solde crédit');

                        if (iCompte < 0) {
                          toast.error(`Onglet « ${parsedSheet} » : colonne "Compte" introuvable.`);
                          return;
                        }

                        for (let r = headerRowIdx + 1; r < matrix.length; r++) {
                          const row = matrix[r] as unknown[];
                          if (!row || row.length === 0) continue;
                          const rawCompte = row[iCompte];
                          if (rawCompte === null || rawCompte === undefined || rawCompte === '') continue;
                          const compteStr = String(rawCompte).trim();
                          // Doit être numérique (ignore "Total général" etc.)
                          if (!/^\d+$/.test(compteStr)) continue;
                          const compte = compteStr.padStart(6, '0');
                          totalRows++;
                          if (comptesFound.length < 3) comptesFound.push(compte);

                          const sDeb  = iSdeb  >= 0 ? toNum(row[iSdeb])  : 0;
                          const sCred = iScred >= 0 ? toNum(row[iScred]) : 0;
                          const solde = sDeb - sCred; // convention : débiteur positif

                          if (compte.startsWith('10')) {
                            fdrSum += -solde; // capitaux : crédit normal → on prend l'opposé pour avoir un montant positif
                            fdrFound = true;
                          }
                          if (compte.startsWith('515')) {
                            tresoSum += solde; // trésorerie : débit normal
                            tresoFound = true;
                          }
                        }
                      } else {
                        // CSV : conserve le comportement historique (préfixe sur 1ère colonne, montant sur dernière)
                        parsedSheet = 'CSV';
                        const text = await file.text();
                        const rows = text.split('\n').map(l => l.split(/[;,\t]/));
                        for (const cols of rows) {
                          const compteRaw = (cols[0] || '').replace(/"/g, '').trim().replace(/^C\//, '');
                          if (!/^\d+$/.test(compteRaw)) continue;
                          const compte = compteRaw.padStart(6, '0');
                          totalRows++;
                          if (comptesFound.length < 3) comptesFound.push(compte);
                          const montant = toNum((cols[cols.length - 1] || ''));
                          if (compte.startsWith('10')) { fdrSum += montant; fdrFound = true; }
                          if (compte.startsWith('515')) { tresoSum += montant; tresoFound = true; }
                        }
                      }

                      if (tresoFound) { update('treso', String(Math.round(tresoSum))); }
                      if (fdrFound)   { update('fdr',   String(Math.round(fdrSum))); }

                      if (tresoFound || fdrFound) {
                        toast.success(`Import Op@le réussi (onglet « ${parsedSheet} », ${totalRows} lignes)`);
                      } else {
                        toast.warning(
                          `Aucun compte 515 ou 10 détecté. Onglet parsé : « ${parsedSheet} » — ${totalRows} lignes lues. ` +
                          (comptesFound.length ? `Premiers comptes : ${comptesFound.join(', ')}.` : 'Aucun numéro de compte numérique trouvé.')
                        );
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error('Erreur lors de la lecture du fichier');
                    } finally {
                      e.target.value = '';
                    }
                  }} />
                  <Button type="button" variant="outline" size="sm" className="gap-2 text-xs pointer-events-none" tabIndex={-1}>
                    <Upload className="h-3.5 w-3.5" />Importer balance Op@le (CSV / Excel)
                  </Button>
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Importe automatiquement les soldes des comptes 515 (trésorerie) et capitaux depuis la balance Op@le exportée en CSV ou Excel (.xlsx, .xls).
              </p>
            </div>
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Indicateurs calculés ─── */}
      {hasData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Fonds de roulement</p>
              <p className={`text-xl font-bold ${fdr < 0 ? 'text-destructive' : 'text-foreground'}`}>{fmt(fdr)}</p>
              {joursFDR !== null && <p className="text-xs font-bold mt-1">{joursFDR} jours de DRFN</p>}
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">BFR</p>
              <p className={`text-xl font-bold ${bfr > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(bfr)}</p>
              {joursBFR !== null && <p className="text-xs mt-1">{joursBFR} jours</p>}
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Trésorerie nette</p>
              <p className={`text-xl font-bold ${treso < 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(treso)}</p>
              {joursTreso !== null && <p className="text-xs mt-1">{joursTreso} jours</p>}
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">CAF</p>
              <p className={`text-xl font-bold ${caf < 0 ? 'text-destructive' : 'text-foreground'}`}>{fmt(caf)}</p>
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Variation FDR</p>
              <p className={`text-xl font-bold ${(variationFDR ?? 0) < 0 ? 'text-destructive' : 'text-green-600'}`}>
                {variationFDR !== null ? `${variationFDR > 0 ? '+' : ''}${variationFDR}%` : '—'}
              </p>
            </CardContent></Card>
          </div>

          {/* Alertes */}
          {joursFDR !== null && joursFDR < 30 && (
            <AnomalyAlert title={`CRITIQUE — FDR à ${joursFDR} jours de DRFN (seuil minimum : 30 jours)`} description="Un fonds de roulement inférieur à 30 jours de DRFN constitue un risque de trésorerie majeur signalé par les CRC." severity="error" />
          )}
          {joursFDR !== null && joursFDR >= 30 && joursFDR < 60 && (
            <AnomalyAlert title={`ATTENTION — FDR à ${joursFDR} jours de DRFN (recommandation CRC : 60 jours)`} severity="warning" />
          )}
          {treso < 0 && (
            <AnomalyAlert title="Trésorerie nette négative" description="L'établissement est en situation de découvert comptable. Le FDR ne couvre pas le BFR." severity="error" />
          )}
          {hasAllThree && !relationOK && (
            <AnomalyAlert title={`Incohérence : FDR − BFR ≠ Trésorerie (écart : ${fmt(ecartRelation)})`} description="Relation fondamentale M9-6 : Trésorerie = FDR − BFR. Vérifiez vos données." severity="warning" />
          )}

          {/* Formules de référence */}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-bold">Formules M9-6 § 4.5.3</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(INDICATEURS_FINANCIERS_M96).map(([key, ind]) => (
                <div key={key} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{ind.label}</p>
                    <span className="text-[10px] text-muted-foreground">{ind.ref}</span>
                  </div>
                  <p className="text-xs font-mono text-primary mt-1">{ind.formule}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ind.interpretation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── Observations ─── */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-bold">Observations et analyse</CardTitle></CardHeader>
        <CardContent><Textarea value={data.obs} onChange={e => update('obs', e.target.value)} rows={5} placeholder="Analyse des indicateurs, évolution pluriannuelle, recommandations..." className="resize-y" /></CardContent>
      </Card>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/AnnexeComptable.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { loadState, saveState } from '@/lib/store';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';
import { CONTROLES_ANNEXE } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/** Seuil prudentiel IGAENR 2016-071 : FRNG en jours de DRFN. */
const SEUIL_FRNG_BAS = 30;   // < 30 jours = alerte
const SEUIL_FRNG_CRITIQUE = 15; // < 15 jours = critique

// Structure conforme au modèle espaceple.org (format paysage, exercice N-1)
const SECTIONS_ANNEXE = [
  {
    id: 'presentation',
    label: '1. Présentation générale de l\'établissement',
    fields: [
      { id: 'contexte', label: 'Contexte et environnement', type: 'textarea', placeholder: 'Type d\'établissement, effectifs, particularités...' },
      { id: 'faits_marquants', label: 'Faits marquants de l\'exercice', type: 'textarea', placeholder: 'Événements significatifs ayant impacté la gestion...' },
      { id: 'structures', label: 'Structures rattachées', type: 'textarea', placeholder: 'Établissements rattachés, services mutualisés...' },
    ]
  },
  {
    id: 'budget',
    label: '2. Exécution budgétaire',
    fields: [
      { id: 'credits_ouverts', label: 'Crédits ouverts (montant global)', type: 'number' },
      { id: 'depenses_realisees', label: 'Dépenses réalisées', type: 'number' },
      { id: 'recettes_realisees', label: 'Recettes réalisées', type: 'number' },
      { id: 'taux_execution_dep', label: 'Taux d\'exécution dépenses (%)', type: 'auto' },
      { id: 'taux_execution_rec', label: 'Taux d\'exécution recettes (%)', type: 'auto' },
      { id: 'commentaire_budget', label: 'Commentaire sur l\'exécution budgétaire', type: 'textarea', placeholder: 'Analyse des écarts entre prévision et réalisation...' },
    ]
  },
  {
    id: 'resultat',
    label: '3. Résultat de l\'exercice',
    fields: [
      { id: 'resultat_fonctionnement', label: 'Résultat de fonctionnement', type: 'number' },
      { id: 'resultat_investissement', label: 'Résultat d\'investissement', type: 'number' },
      { id: 'capacite_autofinancement', label: 'Capacité d\'autofinancement (CAF)', type: 'number' },
      { id: 'commentaire_resultat', label: 'Commentaire sur le résultat', type: 'textarea', placeholder: 'Explication des variations par rapport à N-2...' },
    ]
  },
  {
    id: 'bilan',
    label: '4. Éléments du bilan',
    fields: [
      { id: 'fdr', label: 'Fonds de roulement', type: 'number' },
      { id: 'bfr', label: 'Besoin en fonds de roulement', type: 'number' },
      { id: 'tresorerie', label: 'Trésorerie nette', type: 'number' },
      { id: 'fdr_jours', label: 'FR en jours de fonctionnement', type: 'auto' },
      { id: 'commentaire_bilan', label: 'Analyse du bilan', type: 'textarea', placeholder: 'Évolution du FR, BFR, trésorerie et explications...' },
    ]
  },
  {
    id: 'immobilisations',
    label: '5. Immobilisations et amortissements',
    fields: [
      { id: 'acquisitions', label: 'Acquisitions de l\'exercice', type: 'textarea', placeholder: 'Nature et montant des immobilisations acquises...' },
      { id: 'sorties', label: 'Sorties d\'inventaire', type: 'textarea', placeholder: 'Immobilisations déclassées ou cédées...' },
      { id: 'amortissements', label: 'Dotation aux amortissements', type: 'number' },
      { id: 'commentaire_immo', label: 'Commentaire patrimoine', type: 'textarea', placeholder: 'État du patrimoine, politique d\'investissement...' },
    ]
  },
  {
    id: 'creances_dettes',
    label: '6. Créances et dettes',
    fields: [
      { id: 'creances_total', label: 'Total créances', type: 'number' },
      { id: 'creances_irrecouvrables', label: 'Créances irrécouvrables (ANV)', type: 'number' },
      { id: 'dettes_fournisseurs', label: 'Dettes fournisseurs', type: 'number' },
      { id: 'delai_paiement', label: 'Délai moyen de paiement (jours)', type: 'number' },
      { id: 'commentaire_creances', label: 'Commentaire', type: 'textarea', placeholder: 'Analyse de l\'ancienneté des créances, contentieux...' },
    ]
  },
  {
    id: 'provisions',
    label: '7. Provisions et engagements',
    fields: [
      { id: 'provisions_risques', label: 'Provisions pour risques et charges', type: 'number' },
      { id: 'engagements_hors_bilan', label: 'Engagements hors bilan', type: 'textarea', placeholder: 'Conventions, contrats pluriannuels, emprunts...' },
      { id: 'commentaire_provisions', label: 'Commentaire', type: 'textarea', placeholder: 'Justification des provisions constituées...' },
    ]
  },
  {
    id: 'srh',
    label: '8. Service de restauration et d\'hébergement (SRH)',
    fields: [
      { id: 'effectif_dp', label: 'Effectif demi-pensionnaires', type: 'number' },
      { id: 'cout_denree', label: 'Coût denrée par repas (€)', type: 'number' },
      { id: 'resultat_srh', label: 'Résultat du SRH', type: 'number' },
      { id: 'commentaire_srh', label: 'Commentaire SRH', type: 'textarea', placeholder: 'Analyse de la fréquentation, politique tarifaire...' },
    ]
  },
  {
    id: 'perspectives',
    label: '9. Perspectives et informations complémentaires',
    fields: [
      { id: 'perspectives_n', label: 'Perspectives pour l\'exercice en cours', type: 'textarea', placeholder: 'Projets, risques identifiés, évolutions attendues...' },
      { id: 'informations_complementaires', label: 'Informations complémentaires', type: 'textarea', placeholder: 'Tout élément utile à la compréhension du compte financier...' },
    ]
  },
];

export default function AnnexeComptablePage() {
  const { params } = useAuditParams();
  const currentEtab = getSelectedEtablissement(params);
  const exerciceN1 = params.exercice ? String(parseInt(params.exercice) - 1) : String(new Date().getFullYear() - 1);
  const [data, setData] = useState<Record<string, string>>(() => loadState('annexe_comptable', {}));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('annexe_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('annexe_checks', u); };

  const update = (key: string, value: string) => {
    const updated = { ...data, [key]: value };
    setData(updated);
    saveState('annexe_comptable', updated);
  };

  // Auto-calculated fields
  const creditsOuverts = parseFloat(data['budget_credits_ouverts']) || 0;
  const depRealisees = parseFloat(data['budget_depenses_realisees']) || 0;
  const recRealisees = parseFloat(data['budget_recettes_realisees']) || 0;
  const txDep = creditsOuverts > 0 ? ((depRealisees / creditsOuverts) * 100).toFixed(1) : '—';
  const txRec = creditsOuverts > 0 ? ((recRealisees / creditsOuverts) * 100).toFixed(1) : '—';

  const fdr = parseFloat(data['bilan_fdr']) || 0;
  const budget = depRealisees || 1;
  const fdrJours = fdr > 0 ? Math.round((fdr / budget) * 365) : 0;

  return (
    <ModulePageLayout
      title="Annexe au compte financier"
      section="AUDIT & RESTITUTION"
      description="Vérification et renseignement des informations complémentaires du compte financier : immobilisations, provisions, dépréciations, engagements hors bilan et méthodes comptables."
      refs={[
        { code: "M9-6 § 4.5", label: "Annexe au compte financier" },
        { code: "PCG art. 410-1 à 410-8", label: "Immobilisations" },
        { code: "M9-6 § 2.1.4", label: "Amortissements" },
      ]}
      completedChecks={(CONTROLES_ANNEXE).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_ANNEXE).length}
    >
      <DoctrineEPLE theme="annexe-comptable" titre="Annexe au compte financier" resume="M9-6 Tome 1 — narratif, FRNG/BFR/CAF, faits marquants, événements postérieurs" />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{SECTIONS_ANNEXE.length}</p><p className="text-xs text-muted-foreground mt-0.5">Sections de l'annexe</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{exerciceN1}</p><p className="text-xs text-muted-foreground mt-0.5">Exercice</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${fdrJours < SEUIL_FRNG_CRITIQUE ? 'text-destructive' : fdrJours < SEUIL_FRNG_BAS ? 'text-amber-600' : 'text-green-600'}`}>{fdrJours} j</p><p className="text-xs text-muted-foreground mt-0.5">FRNG / DRFN</p></CardContent></Card>
      </div>

      {/* Alerte FRNG — IGAENR 2016-071 */}
      {fdrJours > 0 && fdrJours < SEUIL_FRNG_BAS && (
        <ControlAlert
          level={fdrJours < SEUIL_FRNG_CRITIQUE ? 'critique' : 'alerte'}
          title={`Fonds de roulement faible : ${fdrJours} jours de DRFN (seuil prudentiel : ${SEUIL_FRNG_BAS} jours)`}
          description={`Le rapport IGAENR 2016-071 considère qu'un FRNG inférieur à ${SEUIL_FRNG_BAS} jours de Dépenses Réelles de Fonctionnement Net signale un risque de tension de trésorerie. ${fdrJours < SEUIL_FRNG_CRITIQUE ? `En dessous de ${SEUIL_FRNG_CRITIQUE} jours, la continuité d'exploitation peut être compromise.` : ''}`}
          action="Présenter au CA un plan de redressement : maîtrise des dépenses, optimisation des recettes, demande éventuelle d'avance de la collectivité de rattachement. Documenter dans la présente annexe."
          refLabel="IGAENR 2016-071 — Modèle FDRM"
        />
      )}

      {fdrJours >= SEUIL_FRNG_BAS && fdr > 0 && fdrJours < 60 && (
        <ControlAlert
          level="info"
          title={`FRNG correct : ${fdrJours} jours`}
          description="Le fonds de roulement est conforme au seuil prudentiel mais reste limité. Maintenir la vigilance sur l'évolution des charges."
          refLabel="IGAENR 2016-071"
        />
      )}

      <div>
        <p className="text-sm text-muted-foreground">
          Réf. : M9-6 — Modèle espaceple.org — Document rédigé pour l'exercice N-1 afin d'accompagner le compte financier soumis au conseil d'administration.
        </p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-center space-y-1">
            <p className="font-bold text-lg">{currentEtab?.nom || 'Établissement'}</p>
            <p className="text-sm font-bold">Exercice {exerciceN1}</p>
          </div>
        </CardContent>
      </Card>

      {SECTIONS_ANNEXE.map(section => (
        <Card key={section.id}>
          <CardHeader><CardTitle className="text-lg">{section.label}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map(field => {
              const key = `${section.id}_${field.id}`;
              
              if (field.type === 'auto') {
                let autoValue = '—';
                if (field.id === 'taux_execution_dep') autoValue = `${txDep} %`;
                if (field.id === 'taux_execution_rec') autoValue = `${txRec} %`;
                if (field.id === 'fdr_jours') autoValue = `${fdrJours} jours`;
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <div className="h-10 flex items-center px-3 rounded-md border bg-muted text-sm font-bold">{autoValue}</div>
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <Textarea value={data[key] || ''} onChange={e => update(key, e.target.value)} rows={3} placeholder={field.placeholder} />
                  </div>
                );
              }

              return (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{field.label}</Label>
                  <Input type="number" value={data[key] || ''} onChange={e => update(key, e.target.value)} placeholder={field.placeholder || 'Montant en €'} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Annexe comptable" description="M9-6 § 4.5" badge={`${(CONTROLES_ANNEXE).filter(c => regChecks[c.id]).length}/${(CONTROLES_ANNEXE).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_ANNEXE.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/AuditConfig.tsx

```tsx
/**
 * Page de configuration d'un nouvel audit sélectif.
 * - Choix établissement, période, type
 * - Arbre 8 domaines avec cases à cocher
 * - Presets rapides (minimal M9-6, complet, prise de fonction)
 * - Compteur dynamique + estimation temps
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Rocket, Clock, ListChecks } from 'lucide-react';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { AUDIT_PRESETS, AuditScope, countPoints, totalPoints } from '@/lib/audit-presets';
import { useGroupements, useEtablissements, useAgents } from '@/hooks/useGroupements';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MIN_PER_POINT = 5;

export default function AuditConfig() {
  const navigate = useNavigate();
  const { groupements, activeId } = useGroupements();
  const groupementActif = groupements.find(g => g.id === activeId) ?? null;
  const { etablissements } = useEtablissements(activeId);
  const { agents } = useAgents(activeId);
  const [scope, setScope] = useState<AuditScope>(() => AUDIT_PRESETS[0].build());
  const [libelle, setLibelle] = useState('Audit ' + new Date().toLocaleDateString('fr-FR'));
  const [etabId, setEtabId] = useState<string>('');
  const [typeAudit, setTypeAudit] = useState<'periodique' | 'thematique' | 'inopine' | 'prise_fonction'>('periodique');
  const [periodeDebut, setPeriodeDebut] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [periodeFin, setPeriodeFin] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!etabId && etablissements.length > 0) setEtabId(etablissements[0].id);
  }, [etablissements, etabId]);

  const total = totalPoints();
  const selected = countPoints(scope);
  const estimatedMin = selected * MIN_PER_POINT;

  const togglePoint = (domaineId: string, idx: number) => {
    setScope(prev => {
      const cur = new Set(prev[domaineId] ?? []);
      if (cur.has(idx)) cur.delete(idx); else cur.add(idx);
      return { ...prev, [domaineId]: Array.from(cur).sort((a, b) => a - b) };
    });
  };

  const toggleDomaine = (domaineId: string, all: boolean) => {
    const d = DOMAINES_AUDIT.find(x => x.id === domaineId);
    if (!d) return;
    setScope(prev => ({ ...prev, [domaineId]: all ? d.checklist.map((_, i) => i) : [] }));
  };

  const applyPreset = (presetId: string) => {
    const p = AUDIT_PRESETS.find(x => x.id === presetId);
    if (p) setScope(p.build());
  };

  const launch = async () => {
    if (!groupementActif) { toast.error('Aucun groupement actif'); return; }
    if (!etabId) { toast.error('Sélectionnez un établissement'); return; }
    if (selected === 0) { toast.error('Cochez au moins un point à auditer'); return; }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Non authentifié');

      const ac = agents.find(a => a.role === 'agent_comptable');
      const ordo = agents.find(a => a.role === 'ordonnateur' && a.etablissement_id === etabId);

      const { data: audit, error } = await supabase
        .from('audits')
        .insert({
          groupement_id: groupementActif.id,
          etablissement_id: etabId,
          user_id: userData.user.id,
          libelle,
          type_audit: typeAudit,
          periode_debut: periodeDebut,
          periode_fin: periodeFin,
          scope,
          agent_comptable_id: ac?.id ?? null,
          ordonnateur_id: ordo?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // Pré-créer les lignes audit_points_results pour les points cochés
      const rows: Array<{ audit_id: string; domaine_id: string; point_index: number; point_libelle: string }> = [];
      Object.entries(scope).forEach(([dId, indexes]) => {
        const d = DOMAINES_AUDIT.find(x => x.id === dId);
        if (!d) return;
        indexes.forEach(idx => {
          rows.push({ audit_id: audit.id, domaine_id: dId, point_index: idx, point_libelle: d.checklist[idx] });
        });
      });
      if (rows.length > 0) {
        const { error: e2 } = await supabase.from('audit_points_results').insert(rows);
        if (e2) throw e2;
      }

      toast.success(`Audit lancé — ${selected} points à contrôler`);
      navigate(`/audit-execution/${audit.id}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur création audit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModulePageLayout
      title="Configurer un nouvel audit"
      section="AUDIT & RESTITUTION"
      description="Sélectionnez les points à auditer parmi les 8 domaines M9-6 / GBCP. Vous ne contrôlerez que ce que vous cochez ici."
    >
      <div className="space-y-4">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Paramètres de l'audit</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="libelle">Libellé</Label>
              <Input id="libelle" value={libelle} onChange={e => setLibelle(e.target.value)} />
            </div>
            <div>
              <Label>Établissement</Label>
              <Select value={etabId} onValueChange={setEtabId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                <SelectContent>
                  {etablissements.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.uai} — {e.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type d'audit</Label>
              <Select value={typeAudit} onValueChange={(v: any) => setTypeAudit(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="periodique">Périodique</SelectItem>
                  <SelectItem value="thematique">Thématique</SelectItem>
                  <SelectItem value="inopine">Inopiné</SelectItem>
                  <SelectItem value="prise_fonction">Prise de fonction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Période début</Label>
                <Input type="date" value={periodeDebut} onChange={e => setPeriodeDebut(e.target.value)} />
              </div>
              <div>
                <Label>Période fin</Label>
                <Input type="date" value={periodeFin} onChange={e => setPeriodeFin(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> Sélection rapide
            </CardTitle>
            <CardDescription>Choisissez un preset, puis affinez ci-dessous.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {AUDIT_PRESETS.map(p => (
              <Button key={p.id} variant="outline" size="sm" onClick={() => applyPreset(p.id)} title={p.description}>
                {p.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Arbre des 8 domaines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">8 domaines M9-6 / GBCP</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-1">
              {DOMAINES_AUDIT.map(d => {
                const sel = scope[d.id] ?? [];
                const allChecked = sel.length === d.checklist.length;
                const partial = sel.length > 0 && !allChecked;
                return (
                  <AccordionItem key={d.id} value={d.id} className="border rounded-md px-2">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm">
                          {d.lettre}
                        </span>
                        <span className="flex-1 text-sm font-medium">{d.label}</span>
                        <Badge variant={allChecked ? 'default' : partial ? 'secondary' : 'outline'} className="text-[10px]">
                          {sel.length}/{d.checklist.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex gap-2 pb-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleDomaine(d.id, true)}>Tout cocher</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleDomaine(d.id, false)}>Tout décocher</Button>
                      </div>
                      <ul className="space-y-1.5">
                        {d.checklist.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Checkbox
                              id={`${d.id}-${idx}`}
                              checked={sel.includes(idx)}
                              onCheckedChange={() => togglePoint(d.id, idx)}
                              className="mt-0.5"
                            />
                            <label htmlFor={`${d.id}-${idx}`} className="text-sm cursor-pointer flex-1">{point}</label>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* Bandeau récap fixe en bas */}
        <Card className="sticky bottom-4 bg-primary text-primary-foreground border-primary">
          <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4 text-sm">
              <div><strong>{selected}</strong> / {total} points sélectionnés</div>
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{estimatedMin} min estimées</div>
            </div>
            <Button variant="secondary" onClick={launch} disabled={saving || selected === 0}>
              <Rocket className="h-4 w-4 mr-2" />
              {saving ? 'Création…' : 'Lancer l\'audit'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/AuditDomaines.tsx

```tsx
/**
 * Page AUDIT — vue synoptique des 8 domaines du cycle comptable EPLE
 * Conforme M9-6 et décret GBCP 2012-1246.
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { getModules } from '@/lib/audit-modules';
import { useMemo } from 'react';

export default function AuditDomaines() {
  const navigate = useNavigate();
  const modules = useMemo(() => getModules(), []);
  const moduleById = useMemo(() => new Map(modules.map(m => [m.id, m])), [modules]);

  return (
    <ModulePageLayout
      title="AUDIT — 8 domaines du cycle comptable EPLE"
      section="AUDIT & RESTITUTION"
      description="Audit structuré conforme M9-6 et décret GBCP 2012-1246. Chaque domaine regroupe les contrôles obligatoires, leur périodicité et leur référence réglementaire."
    >
      <div className="space-y-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Mode d'emploi
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>
              Les <strong>8 domaines (A→H)</strong> couvrent l'intégralité du cycle comptable d'un EPLE
              (collège, lycée, LP, CFA). Cliquez sur un domaine pour dérouler sa check-list opérationnelle,
              puis utilisez le bouton « Ouvrir le module » pour accéder aux écrans de saisie.
            </p>
            <p className="text-xs italic">
              Acronymes : <strong>EPLE</strong> = Établissement Public Local d'Enseignement ·
              <strong> CCP</strong> = Code de la Commande Publique ·
              <strong> GBCP</strong> = Gestion Budgétaire et Comptable Publique (décret 2012-1246) ·
              <strong> M9-6</strong> = instruction codificatrice EPLE 2026.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {DOMAINES_AUDIT.map(d => {
            const mods = d.moduleIds.map(id => moduleById.get(id)).filter(Boolean);
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary font-bold shrink-0">
                      {d.lettre}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{d.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">{d.description}</CardDescription>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-[10px]">{d.periodicite}</Badge>
                        <Badge variant="secondary" className="text-[10px] font-mono">{d.reference}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="check" className="border-b-0">
                      <AccordionTrigger className="text-xs font-semibold text-muted-foreground py-2 hover:no-underline">
                        Check-list opérationnelle ({d.checklist.length} points)
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5 text-sm">
                          {d.checklist.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {mods.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      {mods.map(m => (
                        <Button
                          key={m!.id}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => navigate(m!.path)}
                        >
                          {m!.label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  )}
                  {mods.length === 0 && (
                    <p className="text-xs text-muted-foreground italic mt-2">
                      Module dédié à venir — utilisez la piste d'audit pour tracer ces contrôles.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/AuditExecution.tsx

```tsx
/**
 * Exécution d'un audit sélectif : navigation séquentielle sur les points cochés.
 * Sauvegarde auto à chaque modification, barre de progression, possibilité
 * de suspendre et reprendre.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Save, FileSignature, CheckCircle2, AlertTriangle, AlertOctagon, MinusCircle, RefreshCw } from 'lucide-react';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimePulse } from '@/components/RealtimePulse';

type PointStatus = 'non_audite' | 'conforme' | 'anomalie_mineure' | 'anomalie_majeure' | 'non_applicable';

interface PointRow {
  id: string;
  audit_id: string;
  domaine_id: string;
  point_index: number;
  point_libelle: string;
  status: PointStatus;
  constat: string | null;
  anomalies: string | null;
  action_corrective: string | null;
  responsable_action: string | null;
  delai_action: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

const STATUS_META: Record<PointStatus, { label: string; icon: any; color: string }> = {
  non_audite: { label: 'Non audité', icon: MinusCircle, color: 'text-muted-foreground' },
  conforme: { label: 'Conforme', icon: CheckCircle2, color: 'text-emerald-600' },
  anomalie_mineure: { label: 'Anomalie mineure', icon: AlertTriangle, color: 'text-amber-600' },
  anomalie_majeure: { label: 'Anomalie majeure', icon: AlertOctagon, color: 'text-destructive' },
  non_applicable: { label: 'Non applicable', icon: MinusCircle, color: 'text-muted-foreground' },
};

export default function AuditExecution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<any>(null);
  const [points, setPoints] = useState<PointRow[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [remoteUpdateAt, setRemoteUpdateAt] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});

  const reloadAuthors = async (rows?: PointRow[]) => {
    const source = rows ?? pointsRef.current ?? [];
    const authorIds = Array.from(new Set(source.map(r => r.updated_by).filter(Boolean) as string[]));
    if (!authorIds.length) return;
    const { data: profs, error } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', authorIds);
    if (error) {
      toast.error('Impossible de recharger les auteurs');
      return;
    }
    setProfilesMap(prev => {
      const next = { ...prev };
      profs?.forEach((pr: any) => { next[pr.user_id] = pr.display_name || 'Collègue'; });
      return next;
    });
    if (rows === undefined) toast.success('Noms des auteurs rechargés');
  };

  const fetchAll = async () => {
    if (!id) return;
    const [{ data: a }, { data: p }] = await Promise.all([
      supabase.from('audits').select('*').eq('id', id).single(),
      supabase.from('audit_points_results').select('*').eq('audit_id', id).order('domaine_id').order('point_index'),
    ]);
    setAudit(a);
    const rows = (p as PointRow[]) ?? [];
    setPoints(rows);
    await reloadAuthors(rows);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      await fetchAll();
      setLoading(false);
    })();
  }, [id]);

  const authorLabel = (userId: string | null | undefined) => {
    if (!userId) return null;
    if (userId === currentUserId) return 'Vous';
    return profilesMap[userId] ?? 'Auteur inconnu';
  };

  // Refs pour exposer le contexte courant au callback realtime sans le ré-abonner
  const pointsRef = useRef<PointRow[]>([]);
  const cursorRef = useRef(0);
  useEffect(() => { pointsRef.current = points; }, [points]);
  useEffect(() => { cursorRef.current = cursor; }, [cursor]);

  // Realtime — synchronisation collaborative sur les points d'audit & l'audit lui-même
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`audit-exec-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_points_results', filter: `audit_id=eq.${id}` }, async (payload) => {
        const row = payload.new as any;
        const author = row?.updated_by ?? null;
        if (!author || author === currentUserId) {
          await fetchAll();
          return;
        }

        // Identifier le point AVANT rafraîchissement pour savoir si je l'ai actuellement ouvert
        const pointId = row?.id;
        const currentlyOpenId = pointsRef.current[cursorRef.current]?.id ?? null;
        const isCurrentlyOpen = pointId && pointId === currentlyOpenId;

        await fetchAll();
        setRemoteUpdateAt(Date.now());

        const name = profilesMap[author] ?? 'Un collègue';
        const libelle = row?.point_libelle ?? 'un point d\'audit';
        const statusLabel = row?.status && STATUS_META[row.status as PointStatus]
          ? ` → ${STATUS_META[row.status as PointStatus].label}`
          : '';

        if (isCurrentlyOpen) {
          // Avertit que la fiche que je consulte vient d'être écrasée
          toast.warning(`${name} a modifié le point en cours${statusLabel}`, {
            description: `« ${libelle} » — l'affichage a été rafraîchi.`,
          });
        } else {
          // Notification claire pour un point que je n'ai pas encore ouvert
          toast.info(`${name} a mis à jour un point d'audit${statusLabel}`, {
            description: `« ${libelle} »`,
            action: pointId ? {
              label: 'Ouvrir',
              onClick: () => {
                const idx = pointsRef.current.findIndex(p => p.id === pointId);
                if (idx >= 0) setCursor(idx);
              },
            } : undefined,
          });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'audits', filter: `id=eq.${id}` }, async () => {
        await fetchAll();
        setRemoteUpdateAt(Date.now());
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, currentUserId, profilesMap]);

  const current = points[cursor];
  const completed = points.filter(p => p.status !== 'non_audite').length;
  const progress = points.length === 0 ? 0 : Math.round((completed / points.length) * 100);

  // Filtre par auteur — restreint la navigation aux points modifiés par cet utilisateur
  // Persisté dans sessionStorage par audit pour être restauré au retour sur la page
  const filterStorageKey = id ? `audit_exec_author_filter_${id}` : '';
  const [authorFilter, setAuthorFilter] = useState<string>(() => {
    if (typeof window === 'undefined' || !filterStorageKey) return 'all';
    return sessionStorage.getItem(filterStorageKey) ?? 'all';
  });

  useEffect(() => {
    if (!filterStorageKey) return;
    sessionStorage.setItem(filterStorageKey, authorFilter);
  }, [authorFilter, filterStorageKey]);

  const distinctAuthors = useMemo(() => {
    const ids = Array.from(new Set(points.map(p => p.updated_by).filter(Boolean) as string[]));
    return ids.map(uid => ({
      id: uid,
      label: uid === currentUserId ? 'Vous' : (profilesMap[uid] ?? 'Auteur inconnu'),
    }));
  }, [points, currentUserId, profilesMap]);

  const filteredIndices = useMemo(() => {
    if (authorFilter === 'all') return points.map((_, i) => i);
    return points.map((p, i) => p.updated_by === authorFilter ? i : -1).filter(i => i >= 0);
  }, [points, authorFilter]);

  const filteredPosition = filteredIndices.indexOf(cursor);

  const updateField = (field: keyof PointRow, value: any) => {
    setPoints(prev => prev.map((p, i) => i === cursor ? { ...p, [field]: value } : p));
  };

  const saveCurrent = async () => {
    if (!current) return;
    setSaving(true);
    const { error } = await supabase.from('audit_points_results').update({
      status: current.status,
      constat: current.constat,
      anomalies: current.anomalies,
      action_corrective: current.action_corrective,
      responsable_action: current.responsable_action,
      delai_action: current.delai_action,
    }).eq('id', current.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Sauvegardé');
  };

  const goNext = async () => {
    await saveCurrent();
    if (filteredIndices.length === 0) return;
    if (filteredPosition === -1) {
      // Point courant hors filtre → aller au premier point du filtre
      setCursor(filteredIndices[0]);
    } else if (filteredPosition < filteredIndices.length - 1) {
      setCursor(filteredIndices[filteredPosition + 1]);
    }
  };

  const goPrev = async () => {
    await saveCurrent();
    if (filteredIndices.length === 0) return;
    if (filteredPosition === -1) {
      setCursor(filteredIndices[0]);
    } else if (filteredPosition > 0) {
      setCursor(filteredIndices[filteredPosition - 1]);
    }
  };

  const cloturer = async () => {
    await saveCurrent();
    const { error } = await supabase.from('audits').update({ status: 'cloture' }).eq('id', id!);
    if (error) { toast.error(error.message); return; }
    toast.success('Audit clôturé — génération du PV');
    navigate(`/pv-audit/${id}`);
  };

  const domaine = useMemo(() => current ? DOMAINES_AUDIT.find(d => d.id === current.domaine_id) : null, [current]);

  if (loading) return <ModulePageLayout title="Audit" section="AUDIT & RESTITUTION"><p>Chargement…</p></ModulePageLayout>;
  if (!audit || !current) return <ModulePageLayout title="Audit" section="AUDIT & RESTITUTION"><p>Audit introuvable.</p></ModulePageLayout>;

  const StatusIcon = STATUS_META[current.status].icon;

  return (
    <ModulePageLayout
      title={audit.libelle}
      section="AUDIT & RESTITUTION"
      description={`Période ${audit.periode_debut} → ${audit.periode_fin} · ${points.length} points à contrôler`}
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="py-3 space-y-2">
            <div className="flex items-center justify-between text-sm gap-3 flex-wrap">
              <span className="font-medium flex items-center gap-2">
                Progression : {completed} / {points.length} points
                <RealtimePulse triggerAt={remoteUpdateAt} label="Audit modifié en direct" />
              </span>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Filtrer par auteur :</Label>
                <Select value={authorFilter} onValueChange={setAuthorFilter}>
                  <SelectTrigger className="h-8 w-[180px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les auteurs</SelectItem>
                    {distinctAuthors.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-xs">{progress}%</span>
              </div>
            </div>
            {authorFilter !== 'all' && (
              <p className="text-xs text-primary">
                {filteredIndices.length} point{filteredIndices.length > 1 ? 's' : ''} modifié{filteredIndices.length > 1 ? 's' : ''} par{' '}
                <span className="font-medium">{distinctAuthors.find(a => a.id === authorFilter)?.label}</span>
                {filteredPosition >= 0 && ` · position ${filteredPosition + 1}/${filteredIndices.length}`}
              </p>
            )}
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{domaine?.lettre} · {domaine?.label}</Badge>
                  <Badge variant="secondary" className="text-[10px] font-mono">{domaine?.reference}</Badge>
                </div>
                <CardTitle className="text-base">
                  Point {cursor + 1} / {points.length} : {current.point_libelle}
                </CardTitle>
                {current.updated_by && current.updated_at && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap gap-x-1 gap-y-0.5">
                    <span>Dernière modification :</span>
                    <span className="font-medium text-foreground">{authorLabel(current.updated_by)}</span>
                    <span>·</span>
                    <time dateTime={current.updated_at}>
                      {new Date(current.updated_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </time>
                    {authorLabel(current.updated_by) === 'Auteur inconnu' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 ml-1 text-xs"
                        onClick={() => reloadAuthors()}
                        title="Recharger les noms des auteurs depuis la base"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Recharger
                      </Button>
                    )}
                  </p>
                )}
              </div>
              <div className={`flex items-center gap-1 text-sm ${STATUS_META[current.status].color}`}>
                <StatusIcon className="h-4 w-4" />
                {STATUS_META[current.status].label}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Statut du contrôle</Label>
              <Select value={current.status} onValueChange={(v: PointStatus) => updateField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_META) as PointStatus[]).map(k => (
                    <SelectItem key={k} value={k}>{STATUS_META[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Constat</Label>
              <Textarea
                value={current.constat ?? ''}
                onChange={e => updateField('constat', e.target.value)}
                placeholder="Décrivez ce qui a été contrôlé et le résultat observé…"
                rows={3}
              />
            </div>
            {(current.status === 'anomalie_mineure' || current.status === 'anomalie_majeure') && (
              <>
                <div>
                  <Label>Anomalies relevées</Label>
                  <Textarea
                    value={current.anomalies ?? ''}
                    onChange={e => updateField('anomalies', e.target.value)}
                    placeholder="Détaillez chaque anomalie identifiée…"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Action corrective recommandée</Label>
                  <Textarea
                    value={current.action_corrective ?? ''}
                    onChange={e => updateField('action_corrective', e.target.value)}
                    placeholder="Action proposée pour corriger l'anomalie…"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Responsable</Label>
                    <Input value={current.responsable_action ?? ''} onChange={e => updateField('responsable_action', e.target.value)} placeholder="Nom de l'agent" />
                  </div>
                  <div>
                    <Label>Délai</Label>
                    <Input type="date" value={current.delai_action ?? ''} onChange={e => updateField('delai_action', e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="sticky bottom-4 bg-card border-primary/30">
          <CardContent className="py-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={cursor === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              <Button variant="outline" size="sm" onClick={saveCurrent} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </Button>
            </div>
            <div className="flex gap-2">
              {cursor < points.length - 1 ? (
                <Button size="sm" onClick={goNext}>
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={cloturer} className="bg-emerald-600 hover:bg-emerald-700">
                  <FileSignature className="h-4 w-4 mr-1" /> Clôturer & générer PV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Auth.tsx

```tsx
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase-fixed';
import { lovable } from '@/integrations/lovable/index';
import logoImg from '@/assets/logo-circle.png';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { checkRateLimit, getRateLimitRemainingSeconds, emailSchema, passwordSchema, displayNameSchema } from '@/lib/security';

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) errs.email = emailResult.error.errors[0].message;

    if (mode !== 'forgot') {
      const pwResult = passwordSchema.safeParse(password);
      if (!pwResult.success) errs.password = pwResult.error.errors[0].message;
    }

    if (mode === 'signup') {
      const nameResult = displayNameSchema.safeParse(displayName);
      if (!nameResult.success) errs.displayName = nameResult.error.errors[0].message;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const rateLimitKey = `auth_${mode}_${email}`;
    if (!checkRateLimit(rateLimitKey, 5, 60_000)) {
      const remaining = getRateLimitRemainingSeconds(rateLimitKey);
      toast({ title: 'Trop de tentatives', description: `Réessayez dans ${remaining} secondes.`, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
        setMode('login');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: displayName.trim() },
          },
        });
        if (error) throw error;
        toast({ title: 'Compte créé', description: 'Vérifiez votre email pour confirmer votre inscription.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      // Generic errors for all modes to prevent user enumeration
      const safeMessage =
        mode === 'login'
          ? 'Email ou mot de passe incorrect.'
          : mode === 'signup'
          ? 'Impossible de créer le compte. Vérifiez vos informations.'
          : 'Une erreur est survenue. Vérifiez votre adresse email.';
      toast({ title: 'Erreur', description: safeMessage, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!checkRateLimit('google_signin', 5, 60_000)) {
      toast({ title: 'Trop de tentatives', description: 'Réessayez dans quelques instants.', variant: 'destructive' });
      return;
    }
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: 'Erreur', description: result.error instanceof Error ? result.error.message : String(result.error), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(226 31% 12%), hsl(226 31% 18%))' }}>
      <Card className="w-full max-w-md shadow-elevated border-border/50">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="flex justify-center">
            <img src={logoImg} alt="CIC Expert Pro" className="h-16 w-16 rounded-xl shadow-lg object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              CIC Expert Pro
            </CardTitle>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">
              Contrôle interne comptable — Audit EPLE
            </p>
          </div>
          <CardDescription className="text-muted-foreground">
            {mode === 'login' && 'Connectez-vous à votre espace'}
            {mode === 'signup' && 'Créez votre compte'}
            {mode === 'forgot' && 'Réinitialisez votre mot de passe'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode !== 'forgot' && (
            <Button
              variant="outline"
              className="w-full h-11 gap-2 text-sm font-medium"
              onClick={handleGoogleSignIn}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </Button>
          )}

          {mode !== 'forgot' && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3" noValidate>
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="Jean Dupont" value={displayName} onChange={e => setDisplayName(e.target.value)} className="pl-9" required autoComplete="name" maxLength={100} />
                </div>
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="vous@exemple.fr" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" required autoComplete="email" maxLength={255} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-9" required minLength={6} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            )}

            <Button type="submit" className="w-full h-10" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === 'login' && 'Se connecter'}
              {mode === 'signup' && "Créer mon compte"}
              {mode === 'forgot' && 'Envoyer le lien'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}<button onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">S'inscrire</button></>
            ) : (
              <>Déjà un compte ?{' '}<button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">Se connecter</button></>
            )}
          </p>
          <p className="text-center text-[10px] text-muted-foreground/70 mt-2">
            En vous connectant, vous acceptez notre{' '}
            <Link to="/politique-confidentialite" className="text-primary/70 hover:underline">politique de confidentialité</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

```

### FICHIER : src/pages/Bourses.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { BoursierEleve, ECHELONS_BOURSES, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_BOURSES } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ Seuil absentéisme déclenchant le retrait de bourse ═══ */
const SEUIL_ABSENTEISME_DEMI_JOURS = 15; // Art. R.531-13 Code éducation

export default function Bourses() {
  const [items, setItems] = useState<BoursierEleve[]>(() => loadState('bourses', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('bourses_checks', {}));
  const [absences, setAbsences] = useState<Record<string, number>>(() => loadState('bourses_absences', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('bourses_checks', u); };
  const setAbsence = (id: string, n: number) => { const u = { ...absences, [id]: n }; setAbsences(u); saveState('bourses_absences', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: BoursierEleve[]) => { setItems(d); saveState('bourses', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const ech = parseInt(form.echelon) || 6;
    const ann = ECHELONS_BOURSES[ech] || 0;
    const t1 = parseFloat(form.t1) || 0, t2 = parseFloat(form.t2) || 0, t3 = parseFloat(form.t3) || 0;
    const verse = t1 + t2 + t3;
    const item: BoursierEleve = { id: form.id || crypto.randomUUID(), nom: form.nom, classe: form.classe, echelon: ech, annuel: ann, t1, t2, t3, verse, reliquat: ann - verse, statut: verse >= ann ? 'Soldé' : verse < ann / 3 ? 'Retard versement' : 'En cours' };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const totAnn = items.reduce((s, x) => s + x.annuel, 0);
  const totVerse = items.reduce((s, x) => s + x.verse, 0);
  const nbRetard = items.filter(x => x.statut === 'Retard versement').length;
  const boursiersAbsenteistes = items.filter(x => (absences[x.id] || 0) >= SEUIL_ABSENTEISME_DEMI_JOURS);

  return (
    <ModulePageLayout
      title="Bourses nationales"
      section="GESTION COMPTABLE"
      description="Suivi des bourses nationales par échelon, vérification de l'assiduité des boursiers et contrôle du versement trimestriel. Les montants sont fixés annuellement par arrêté ministériel."
      refs={[
        { refKey: 'ce-r531-1', label: 'Bourses nationales' },
        { refKey: 'circ-bourses-rentree', label: 'Barèmes annuels' },
        { refKey: 'fs-circ-2017-122', label: 'Plafond bourse + FSC' },
        { refKey: 'gbcp-20', label: 'Constatation droits' },
      ]}
      completedChecks={(CONTROLES_BOURSES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_BOURSES).length}
    >
      <DoctrineEPLE theme="bourses" titre="Bourses nationales" resume="Attribution sur critères, paiement trimestriel, reversement DSDEN" />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Élèves boursiers</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(totAnn)}</p><p className="text-xs text-muted-foreground mt-0.5">Montant total annuel</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{[...new Set(items.map(x => x.echelon))].length}</p><p className="text-xs text-muted-foreground mt-0.5">Échelons représentés</p></CardContent></Card>
      </div>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Bourses" description="Art. R.531-1 à R.531-6 Code Éducation" badge={`${(CONTROLES_BOURSES).filter(c => regChecks[c.id]).length}/${(CONTROLES_BOURSES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_BOURSES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      <div className="flex justify-end">
        <Button onClick={() => setForm({ nom: '', classe: '', echelon: '6', t1: '', t2: '', t3: '' })}><Plus className="h-4 w-4 mr-2" /> Nouvel élève</Button>
      </div>

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Nom élève</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Classe</Label><Input value={form.classe} onChange={e => setForm({ ...form, classe: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Échelon</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.echelon} onChange={e => setForm({ ...form, echelon: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Éch. {n} — {ECHELONS_BOURSES[n]} €</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Versé T1 (€)</Label><Input type="number" value={form.t1} onChange={e => setForm({ ...form, t1: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Versé T2 (€)</Label><Input type="number" value={form.t2} onChange={e => setForm({ ...form, t2: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Versé T3 (€)</Label><Input type="number" value={form.t3} onChange={e => setForm({ ...form, t3: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Alerte absentéisme global ═══ */}
      {boursiersAbsenteistes.length > 0 && (
        <ControlAlert level="critique"
          title={`${boursiersAbsenteistes.length} boursier${boursiersAbsenteistes.length > 1 ? 's' : ''} en absentéisme caractérisé (≥ ${SEUIL_ABSENTEISME_DEMI_JOURS} demi-journées)`}
          description={`Élève(s) concerné(s) : ${boursiersAbsenteistes.map(b => b.nom).join(', ')}. Au-delà de 15 demi-journées d'absences non justifiées par mois, le chef d'établissement doit signaler à la DSDEN qui peut prononcer le retrait de la bourse.`}
          refKey="ce-r531-1"
          action="Saisir la DSDEN par courrier circonstancié et suspendre les versements suivants jusqu'à décision." />
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun boursier enregistré.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left p-2">Élève</th><th className="p-2">Classe</th><th className="p-2">Éch.</th>
                <th className="text-right p-2">Annuel</th><th className="text-right p-2">Versé</th>
                <th className="text-right p-2">Reliquat</th><th className="p-2">Statut</th>
                <th className="p-2 text-center">Absences (½j)</th><th></th>
              </tr>
            </thead>
            <tbody>{items.map(x => {
              const abs = absences[x.id] || 0;
              const alert = abs >= SEUIL_ABSENTEISME_DEMI_JOURS;
              return (
                <tr key={x.id} className={`border-b ${x.statut === 'Retard versement' || alert ? 'bg-destructive/5' : ''}`}>
                  <td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.classe}</td><td className="p-2 text-center">{x.echelon}</td>
                  <td className="p-2 text-right font-mono">{fmt(x.annuel)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.verse)}</td>
                  <td className={`p-2 text-right font-mono font-bold ${x.reliquat > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(x.reliquat)}</td>
                  <td className="p-2"><Badge variant={x.statut === 'Soldé' ? 'secondary' : x.statut === 'Retard versement' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                  <td className="p-2 text-center">
                    <Input type="number" min={0} value={abs || ''} onChange={e => setAbsence(x.id, parseInt(e.target.value) || 0)} className={`h-7 w-16 text-xs text-center ${alert ? 'border-destructive text-destructive font-bold' : ''}`} />
                  </td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, echelon: String(x.echelon), t1: String(x.t1), t2: String(x.t2), t3: String(x.t3) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>
        </CardContent></Card>
      )}
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/BudgetsAnnexes.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil, Building2, FileText, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ArrowRight, Download, Info, Scale } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { loadState, saveState } from '@/lib/store';
import { useAuditParamsContext } from '@/contexts/AuditParamsContext';
import { fmt, getAgenceComptable } from '@/lib/types';
import { CONTROLES_BUDGETS_ANNEXES } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import {
  BudgetAnnexeRecord, Mouvement185, AuditItemBA,
  AUDIT_ITEMS_BA, defaultAuditItems, computeAuditScore,
} from '@/lib/budgets-annexes-types';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

// ═══ HELPERS ═══
const STORE_KEY_BA = 'budgets_annexes_v2';
const STORE_KEY_AUDIT = 'ba_audit_items';

function loadBA(): BudgetAnnexeRecord[] { return loadState(STORE_KEY_BA, []); }
function saveBA(d: BudgetAnnexeRecord[]) { saveState(STORE_KEY_BA, d); }
function loadAuditItems(): AuditItemBA[] { return loadState(STORE_KEY_AUDIT, []); }
function saveAuditItems(d: AuditItemBA[]) { saveState(STORE_KEY_AUDIT, d); }

const SCORE_COLORS = { vert: 'bg-emerald-500', jaune: 'bg-amber-500', rouge: 'bg-red-500' };
const SCORE_TEXT = { vert: 'text-emerald-700', jaune: 'text-amber-700', rouge: 'text-red-700' };
const CONFORME_ICONS = {
  oui: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  non: <XCircle className="h-4 w-4 text-red-600" />,
  partiel: <MinusCircle className="h-4 w-4 text-amber-600" />,
  '': <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 inline-block" />,
};

export default function BudgetsAnnexes() {
  const { params } = useAuditParamsContext();
  const agence = getAgenceComptable(params);
  const [records, setRecords] = useState<BudgetAnnexeRecord[]>(() => loadBA());
  const [auditItems, setAuditItems] = useState<AuditItemBA[]>(() => loadAuditItems());
  const [form, setForm] = useState<Partial<BudgetAnnexeRecord> | null>(null);
  const [selectedBAId, setSelectedBAId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEquilibre, setFilterEquilibre] = useState<string>('all');
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('budgets_annexes_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('budgets_annexes_checks', u); };

  const persist = (d: BudgetAnnexeRecord[]) => { setRecords(d); saveBA(d); };
  const persistAudit = (d: AuditItemBA[]) => { setAuditItems(d); saveAuditItems(d); };

  // Filtered list
  const filtered = useMemo(() => {
    let list = records;
    if (filterType !== 'all') list = list.filter(r => r.type === filterType);
    if (filterEquilibre === 'equilibre') list = list.filter(r => Math.abs(r.resultatNet) < 1);
    if (filterEquilibre === 'desequilibre') list = list.filter(r => Math.abs(r.resultatNet) >= 1);
    return list;
  }, [records, filterType, filterEquilibre]);

  const selectedBA = records.find(r => r.id === selectedBAId);
  const baAuditItems = useMemo(() => {
    if (!selectedBAId) return [];
    const existing = auditItems.filter(a => a.budgetAnnexeId === selectedBAId);
    if (existing.length === 8) return existing;
    // Create default items for this BA
    const defaults = defaultAuditItems(selectedBAId);
    const merged = [...auditItems.filter(a => a.budgetAnnexeId !== selectedBAId), ...defaults];
    persistAudit(merged);
    return defaults;
  }, [selectedBAId, auditItems]);

  const scoring = computeAuditScore(baAuditItems);

  // ═══ Form submit ═══
  const submitForm = () => {
    if (!form || !form.nom) return;
    const record: BudgetAnnexeRecord = {
      id: form.id || crypto.randomUUID(),
      epleSupportId: form.epleSupportId || agence?.id || '',
      type: (form.type as BudgetAnnexeRecord['type']) || 'CFA',
      nom: form.nom || '',
      dateCreation: form.dateCreation || new Date().toISOString().slice(0, 10),
      exercice: form.exercice || params.exercice,
      deliberationCA: form.deliberationCA || '',
      budget: Number(form.budget) || 0,
      resultatExploitation: Number(form.resultatExploitation) || 0,
      resultatFinancier: Number(form.resultatFinancier) || 0,
      resultatExceptionnel: Number(form.resultatExceptionnel) || 0,
      resultatNet: Number(form.resultatNet) || 0,
      tauxExecution: Number(form.tauxExecution) || 0,
      mouvements185: form.mouvements185 || [],
    };
    if (form.id) persist(records.map(r => r.id === form.id ? record : r));
    else persist([...records, record]);
    setForm(null);
  };

  // ═══ Mouvement 185 helpers ═══
  const addMouvement185 = (baId: string) => {
    const ba = records.find(r => r.id === baId);
    if (!ba) return;
    const m: Mouvement185 = { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), libelle: '', debit: 0, credit: 0 };
    persist(records.map(r => r.id === baId ? { ...r, mouvements185: [...r.mouvements185, m] } : r));
  };

  const updateMouvement185 = (baId: string, mId: string, field: string, value: string | number) => {
    persist(records.map(r => r.id === baId
      ? { ...r, mouvements185: r.mouvements185.map(m => m.id === mId ? { ...m, [field]: value } : m) }
      : r
    ));
  };

  const removeMouvement185 = (baId: string, mId: string) => {
    persist(records.map(r => r.id === baId
      ? { ...r, mouvements185: r.mouvements185.filter(m => m.id !== mId) }
      : r
    ));
  };

  // ═══ Audit item update ═══
  const updateAuditItem = (itemId: string, field: string, value: string | number) => {
    const updated = auditItems.map(a => a.id === itemId ? { ...a, [field]: value } : a);
    persistAudit(updated);
  };

  // ═══ PDF Export ═══
  const exportPDF = () => {
    if (!selectedBA) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const items = baAuditItems;
    const sc = computeAuditScore(items);
    const epleSupport = params.etablissements.find(e => e.id === selectedBA.epleSupportId);

    // HTML escape helper to prevent XSS injection from user-controlled fields
    const esc = (s: unknown): string =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport Audit BA – ${esc(selectedBA.nom)}</title>
    <style>
      @page { size: A4; margin: 20mm; }
      body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #1a1a2e; line-height: 1.5; }
      h1 { text-align: center; font-size: 16pt; border-bottom: 3px double #1a1a2e; padding-bottom: 8px; letter-spacing: 2px; text-transform: uppercase; }
      h2 { font-size: 13pt; color: #1a1a2e; border-left: 4px solid #1e3a5f; padding-left: 10px; margin-top: 20px; }
      .header-block { background: #f0f4f8; border: 1px solid #ccc; padding: 12px; margin: 15px 0; font-size: 10pt; }
      .header-block td { padding: 3px 10px; }
      table.audit { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
      table.audit th, table.audit td { border: 1px solid #999; padding: 6px 8px; text-align: left; vertical-align: top; }
      table.audit th { background: #1e3a5f; color: white; font-weight: bold; }
      .conforme-oui { color: #059669; font-weight: bold; }
      .conforme-non { color: #dc2626; font-weight: bold; }
      .conforme-partiel { color: #d97706; font-weight: bold; }
      .score-block { text-align: center; padding: 15px; margin: 20px 0; border: 2px solid; border-radius: 8px; }
      .score-vert { border-color: #059669; background: #ecfdf5; color: #059669; }
      .score-jaune { border-color: #d97706; background: #fffbeb; color: #d97706; }
      .score-rouge { border-color: #dc2626; background: #fef2f2; color: #dc2626; }
      .footer { text-align: center; font-size: 9pt; color: #666; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
      .ref { font-size: 9pt; color: #666; font-style: italic; }
    </style></head><body>
    <h1>RAPPORT D'AUDIT – BUDGET ANNEXE</h1>
    <div class="header-block"><table>
      <tr><td><strong>Budget annexe :</strong></td><td>${esc(selectedBA.nom)} (${esc(selectedBA.type)})</td></tr>
      <tr><td><strong>EPLE support :</strong></td><td>${esc(epleSupport?.nom || '—')} (UAI ${esc(epleSupport?.uai || '—')})</td></tr>
      ${agence ? `<tr><td><strong>Agence comptable :</strong></td><td>${esc(agence.nom)}</td></tr>` : ''}
      <tr><td><strong>Exercice :</strong></td><td>${esc(selectedBA.exercice)}</td></tr>
      <tr><td><strong>Date création BA :</strong></td><td>${esc(selectedBA.dateCreation)}</td></tr>
      <tr><td><strong>Budget :</strong></td><td>${esc(fmt(selectedBA.budget))}</td></tr>
      <tr><td><strong>Résultat net :</strong></td><td>${esc(fmt(selectedBA.resultatNet))}</td></tr>
    </table></div>
    <div class="score-block score-${esc(sc.label)}">
      <strong>SCORING GLOBAL : ${esc(sc.score)}% — ${esc(sc.label.toUpperCase())}</strong><br/>
      <span style="font-size:10pt">${esc(sc.detail)}</span>
    </div>
    <h2>I. DÉTAIL DES CONTRÔLES</h2>
    <table class="audit">
      <thead><tr><th style="width:5%">N°</th><th style="width:25%">Item</th><th style="width:20%">Existant</th><th style="width:20%">Attendu (réf.)</th><th style="width:15%">Écart</th><th style="width:15%">Conformité</th></tr></thead>
      <tbody>
      ${items.map((it, i) => {
        const def = AUDIT_ITEMS_BA[i];
        return `<tr>
          <td><strong>${esc(def.index)}</strong></td>
          <td><strong>${esc(def.label)}</strong><br/><span class="ref">${esc(def.reference)}</span></td>
          <td>${it.existant ? esc(it.existant) : '<em>Non renseigné</em>'}<br/>${it.montantExistant ? `Montant: ${esc(fmt(it.montantExistant))}` : ''}</td>
          <td>${esc(it.attendu)}<br/>${it.montantAttendu ? `Attendu: ${esc(fmt(it.montantAttendu))}` : ''}</td>
          <td>${it.ecart ? esc(it.ecart) : '—'}</td>
          <td class="conforme-${esc(it.conforme || 'non')}">${it.conforme === 'oui' ? '✓ CONFORME' : it.conforme === 'non' ? '✗ NON CONFORME' : it.conforme === 'partiel' ? '⚠ PARTIEL' : 'Non vérifié'}<br/><span style="font-size:9pt;color:#333;font-weight:normal">${esc(it.commentaire || '')}</span></td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    <h2>II. LIAISON COMPTE 185000 (Planche 16)</h2>
    ${selectedBA.mouvements185.length > 0 ? `
    <table class="audit">
      <thead><tr><th>Date</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr></thead>
      <tbody>
      ${selectedBA.mouvements185.map(m => `<tr><td>${esc(m.date)}</td><td>${esc(m.libelle)}</td><td>${esc(fmt(m.debit))}</td><td>${esc(fmt(m.credit))}</td></tr>`).join('')}
      <tr style="font-weight:bold;background:#f0f4f8">
        <td colspan="2">TOTAL</td>
        <td>${esc(fmt(selectedBA.mouvements185.reduce((s, m) => s + m.debit, 0)))}</td>
        <td>${esc(fmt(selectedBA.mouvements185.reduce((s, m) => s + m.credit, 0)))}</td>
      </tr>
      </tbody>
    </table>
    ` : '<p><em>Aucun mouvement 185000 enregistré.</em></p>'}
    <div class="footer">
      <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} — CIC Expert Pro — Réf. M9.6 Tome 2 § 2.1.2.3.2 + Planche 16</p>
      <p>Décret 2012-1246 — Code de l'éducation art. R421-58 et suivants</p>
    </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <ModulePageLayout
      title="Budgets annexes"
      section="FINANCES & BUDGET"
      description="Contrôle des services spéciaux et budgets annexes : SRH (service de restauration et d'hébergement), CFA, GRETA. Suivi du compte de dépôt C/185000 et vérification de l'absence de compte au Trésor propre."
      refs={[
        { code: "M9-6 § 4.3", label: "Budgets annexes" },
        { code: "C/185000", label: "Compte de dépôt" },
        { code: "Art. R.421-58 C.Édu", label: "Budget de l'EPLE" },
      ]}
      completedChecks={(CONTROLES_BUDGETS_ANNEXES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_BUDGETS_ANNEXES).length}
    >
      <DoctrineEPLE theme="budgets-annexes" titre="Budgets annexes (CFA / GRETA / SRH)" resume="Compte 185000 = 0, vote CA, séparation des résultats" />
      {/* ═══ HEADER ═══ */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Réf. : Instruction M9.6 Tome 2 § 2.1.2.3.2 + Planche 16 — Décret 2012-1246 — Code éducation R421-58
              </p>
            </div>
          </div>
          {agence && (
            <p className="text-sm text-muted-foreground mt-2 ml-13">
              Agence comptable : <span className="font-semibold text-foreground">{agence.nom}</span>
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="gestion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="gestion" className="gap-2 text-sm">
            <Building2 className="h-4 w-4" />
            PAN 1 — Rattachement & Gestion
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 text-sm">
            <FileText className="h-4 w-4" />
            PAN 2 — Audit Opérations
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════ */}
        {/* PAN 1 – RATTACHEMENT & GESTION                  */}
        {/* ═══════════════════════════════════════════════ */}
        <TabsContent value="gestion" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setForm({
              type: 'CFA', nom: '', dateCreation: new Date().toISOString().slice(0, 10),
              exercice: params.exercice, epleSupportId: agence?.id || params.etablissements[0]?.id || '',
              mouvements185: [],
            })}>
              <Plus className="h-4 w-4 mr-2" /> Nouveau BA
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="CFA">CFA</SelectItem>
                  <SelectItem value="GRETA">GRETA</SelectItem>
                  <SelectItem value="SRH">SRH</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Label className="text-xs text-muted-foreground">Équilibre</Label>
              <Select value={filterEquilibre} onValueChange={setFilterEquilibre}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="equilibre">Équilibré</SelectItem>
                  <SelectItem value="desequilibre">Déséquilibré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Creation form */}
          {form && (
            <Card className="border-primary shadow-card animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{form.id ? 'Modifier le BA' : 'Création / Rattachement Budget Annexe'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">EPLE support</Label>
                    <Select value={form.epleSupportId || ''} onValueChange={v => setForm({ ...form, epleSupportId: v })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {params.etablissements.map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.nom} {e.isAgenceComptable ? '★ AC' : ''} ({e.uai})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Type</Label>
                    <Select value={form.type || 'CFA'} onValueChange={v => setForm({ ...form, type: v as any })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CFA">CFA</SelectItem>
                        <SelectItem value="GRETA">GRETA</SelectItem>
                        <SelectItem value="SRH">SRH</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nom du BA</Label>
                    <Input className="h-9" value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: CFA Académique" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Date de création</Label>
                    <Input className="h-9" type="date" value={form.dateCreation || ''} onChange={e => setForm({ ...form, dateCreation: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Exercice</Label>
                    <Input className="h-9" value={form.exercice || ''} onChange={e => setForm({ ...form, exercice: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Délibération CA</Label>
                    <Input className="h-9" type="file" accept=".pdf,.jpg,.png" onChange={e => setForm({ ...form, deliberationCA: e.target.files?.[0]?.name || '' })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Budget (€)</Label>
                    <Input className="h-9" type="number" value={form.budget ?? ''} onChange={e => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Rés. exploitation</Label>
                    <Input className="h-9" type="number" value={form.resultatExploitation ?? ''} onChange={e => setForm({ ...form, resultatExploitation: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Rés. financier</Label>
                    <Input className="h-9" type="number" value={form.resultatFinancier ?? ''} onChange={e => setForm({ ...form, resultatFinancier: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Rés. exceptionnel</Label>
                    <Input className="h-9" type="number" value={form.resultatExceptionnel ?? ''} onChange={e => setForm({ ...form, resultatExceptionnel: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Résultat net</Label>
                    <Input className="h-9" type="number" value={form.resultatNet ?? ''} onChange={e => setForm({ ...form, resultatNet: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Taux exéc. %</Label>
                    <Input className="h-9" type="number" value={form.tauxExecution ?? ''} onChange={e => setForm({ ...form, tauxExecution: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={submitForm}>Valider</Button>
                  <Button variant="outline" onClick={() => setForm(null)}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* List */}
          {filtered.length === 0 && !form && (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun budget annexe enregistré</p>
              <p className="text-xs mt-1">Créez un nouveau BA pour commencer le rattachement.</p>
            </CardContent></Card>
          )}

          {filtered.map(x => {
            const eple = params.etablissements.find(e => e.id === x.epleSupportId);
            const totalDebit185 = x.mouvements185.reduce((s, m) => s + m.debit, 0);
            const totalCredit185 = x.mouvements185.reduce((s, m) => s + m.credit, 0);
            const ecart185 = Math.abs(totalDebit185 - totalCredit185);
            const baScore = computeAuditScore(auditItems.filter(a => a.budgetAnnexeId === x.id));

            return (
              <Card key={x.id} className="transition-shadow hover:shadow-card">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={x.type === 'CFA' ? 'default' : x.type === 'GRETA' ? 'secondary' : 'outline'} className="text-xs">
                        {x.type}
                      </Badge>
                      <span className="font-bold text-foreground">{x.nom}</span>
                      {eple && <span className="text-xs text-muted-foreground">— {eple.nom}</span>}
                      <Badge variant="outline" className="text-[10px]">{x.exercice}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Score badge */}
                      <Badge className={`${SCORE_COLORS[baScore.label]} text-white text-[10px]`}>
                        {baScore.score}%
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setForm({
                          ...x,
                          budget: x.budget,
                          resultatExploitation: x.resultatExploitation,
                          resultatFinancier: x.resultatFinancier,
                          resultatExceptionnel: x.resultatExceptionnel,
                          resultatNet: x.resultatNet,
                          tauxExecution: x.tauxExecution,
                        });
                      }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => persist(records.filter(r => r.id !== x.id))}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setSelectedBAId(x.id); /* Switch to audit tab */ }}>
                        <ArrowRight className="h-3 w-3" /> Auditer
                      </Button>
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Budget</span>
                      <p className="font-mono font-bold">{fmt(x.budget)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Rés. exploit.</span>
                      <p className="font-mono font-bold">{fmt(x.resultatExploitation)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Résultat net</span>
                      <p className={`font-mono font-bold ${x.resultatNet >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {fmt(x.resultatNet)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Taux exéc.</span>
                      <p className={`font-bold ${x.tauxExecution >= 80 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {x.tauxExecution}%
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">C185 solde</span>
                      <p className={`font-mono font-bold ${ecart185 < 1 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {fmt(ecart185)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Délibération</span>
                      <p className="text-xs truncate">{x.deliberationCA || '—'}</p>
                    </div>
                  </div>

                  {/* Mouvements 185 */}
                  <details className="mt-4">
                    <summary className="text-xs font-medium text-primary cursor-pointer flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5" />
                      Compte 185000 — Liaison Planche 16 ({x.mouvements185.length} mouvement{x.mouvements185.length > 1 ? 's' : ''})
                    </summary>
                    <div className="mt-3 space-y-2">
                      {x.mouvements185.map(m => (
                        <div key={m.id} className="grid grid-cols-5 gap-2 items-end">
                          <Input className="h-8 text-xs" type="date" value={m.date} onChange={e => updateMouvement185(x.id, m.id, 'date', e.target.value)} />
                          <Input className="h-8 text-xs" placeholder="Libellé" value={m.libelle} onChange={e => updateMouvement185(x.id, m.id, 'libelle', e.target.value)} />
                          <Input className="h-8 text-xs" type="number" placeholder="Débit" value={m.debit || ''} onChange={e => updateMouvement185(x.id, m.id, 'debit', parseFloat(e.target.value) || 0)} />
                          <Input className="h-8 text-xs" type="number" placeholder="Crédit" value={m.credit || ''} onChange={e => updateMouvement185(x.id, m.id, 'credit', parseFloat(e.target.value) || 0)} />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMouvement185(x.id, m.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addMouvement185(x.id)}>
                          <Plus className="h-3 w-3 mr-1" /> Ajouter mouvement
                        </Button>
                        {x.mouvements185.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground mr-2">Total D: <strong className="text-foreground">{fmt(totalDebit185)}</strong></span>
                            <span className="text-muted-foreground mr-2">Total C: <strong className="text-foreground">{fmt(totalCredit185)}</strong></span>
                            <Badge variant={ecart185 < 1 ? 'default' : 'destructive'} className="text-[10px]">
                              {ecart185 < 1 ? '✓ Compensation parfaite' : `Écart: ${fmt(ecart185)}`}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ═══════════════════════════════════════════════ */}
        {/* PAN 2 – AUDIT DÉTAILLÉ DES OPÉRATIONS           */}
        {/* ═══════════════════════════════════════════════ */}
        <TabsContent value="audit" className="space-y-4">
          {/* BA Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-sm font-medium">Budget annexe :</Label>
            <Select value={selectedBAId || ''} onValueChange={setSelectedBAId}>
              <SelectTrigger className="w-72 h-9"><SelectValue placeholder="Sélectionner un BA" /></SelectTrigger>
              <SelectContent>
                {records.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nom} ({r.type}) — {r.exercice}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBA && (
              <Button variant="outline" size="sm" className="gap-1 ml-auto" onClick={exportPDF}>
                <Download className="h-3.5 w-3.5" /> Export PDF rapport
              </Button>
            )}
          </div>

          {!selectedBA ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sélectionnez un budget annexe pour lancer l'audit</p>
              <p className="text-xs mt-1">Les 8 items de contrôle réglementaire apparaîtront automatiquement.</p>
            </CardContent></Card>
          ) : (
            <>
              {/* Score card */}
              <Card className={`border-2 ${scoring.label === 'vert' ? 'border-emerald-300 bg-emerald-50/50' : scoring.label === 'jaune' ? 'border-amber-300 bg-amber-50/50' : 'border-red-300 bg-red-50/50'}`}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ${SCORE_COLORS[scoring.label]}`}>
                      {scoring.score}%
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${SCORE_TEXT[scoring.label]}`}>
                        SCORING GLOBAL — {scoring.label.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{scoring.detail}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">{selectedBA.nom}</p>
                    <p>{selectedBA.type} — Exercice {selectedBA.exercice}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 8 Audit items */}
              {baAuditItems.map((item, idx) => {
                const def = AUDIT_ITEMS_BA[idx];
                if (!def) return null;
                return (
                  <Card key={item.id} className={`transition-shadow hover:shadow-card ${item.conforme === 'non' ? 'border-l-4 border-l-red-400' : item.conforme === 'oui' ? 'border-l-4 border-l-emerald-400' : item.conforme === 'partiel' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-muted'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{def.index}</span>
                          <div>
                            <CardTitle className="text-sm">{def.label}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {CONFORME_ICONS[item.conforme || '']}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-sm text-xs">
                              <p className="font-semibold mb-1">Référence réglementaire</p>
                              <p>{def.reference}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-primary">Existant (constaté)</Label>
                          <Textarea className="text-sm min-h-[80px]" placeholder="Saisie manuelle ou import OP@LE…" value={item.existant} onChange={e => updateAuditItem(item.id, 'existant', e.target.value)} />
                          <div className="flex gap-2">
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Montant existant (€)</Label>
                              <Input className="h-8 text-xs" type="number" value={item.montantExistant || ''} onChange={e => updateAuditItem(item.id, 'montantExistant', parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Pièces justificatives</Label>
                              <Input className="h-8 text-xs" type="file" multiple accept=".pdf,.jpg,.png,.xlsx" onChange={e => {
                                const files = Array.from(e.target.files || []).map(f => f.name);
                                updateAuditItem(item.id, 'pieces', files.join(', '));
                              }} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-amber-700">Attendu (réf. réglementaire)</Label>
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200 min-h-[80px]">
                            {def.regle}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Montant attendu (€)</Label>
                            <Input className="h-8 text-xs" type="number" value={item.montantAttendu || ''} onChange={e => updateAuditItem(item.id, 'montantAttendu', parseFloat(e.target.value) || 0)} />
                          </div>
                        </div>
                      </div>

                      {/* Ecart + Conformité */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Écart constaté</Label>
                          <Textarea className="text-xs min-h-[60px]" placeholder="Description de l'écart…" value={item.ecart} onChange={e => updateAuditItem(item.id, 'ecart', e.target.value)} />
                          {item.montantExistant > 0 && item.montantAttendu > 0 && (
                            <div className={`text-xs font-mono font-bold ${Math.abs(item.montantExistant - item.montantAttendu) < 1 ? 'text-emerald-600' : 'text-destructive'}`}>
                              Δ = {fmt(item.montantExistant - item.montantAttendu)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Conformité</Label>
                          <Select value={item.conforme || ''} onValueChange={v => updateAuditItem(item.id, 'conforme', v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Évaluer…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oui">✓ Conforme</SelectItem>
                              <SelectItem value="partiel">⚠ Partiellement conforme</SelectItem>
                              <SelectItem value="non">✗ Non conforme</SelectItem>
                            </SelectContent>
                          </Select>
                          {item.conforme === 'non' && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 animate-pulse">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="font-medium">Anomalie détectée — action corrective requise</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Commentaire auditeur</Label>
                          <Textarea className="text-xs min-h-[60px]" placeholder="Observations…" value={item.commentaire} onChange={e => updateAuditItem(item.id, 'commentaire', e.target.value)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Budgets annexes" description="M9-6 § 4.3 — C/185000" badge={`${(CONTROLES_BUDGETS_ANNEXES).filter(c => regChecks[c.id]).length}/${(CONTROLES_BUDGETS_ANNEXES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_BUDGETS_ANNEXES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Calculateurs.tsx

```tsx
/**
 * Page de redirection — les calculateurs ont été dispatchés dans leurs modules métier.
 * Conservée temporairement (1-2 mois) le temps que les utilisateurs prennent l'habitude.
 *
 * /outils/calculateurs        → cette page d'index avec liens vers chaque destination
 * /outils/calculateurs/:id    → ouvre le calculateur en standalone (rétro-compatibilité)
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CALCULATEURS, getCalculateur } from '@/lib/calculateurs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Calculator as CalcIcon, ExternalLink, Info } from 'lucide-react';

import { CalcCaisseRegie, CalcRapprochement } from '@/components/calculateurs/calc-tresorerie';
import { CalcFondsSocialCantine, CalcFondsSocialEleves, CalcVoyageFamille } from '@/components/calculateurs/calc-aides';
import { CalcSeuilsCCP, CalcAmortissements, CalcDBM, CalcDGP } from '@/components/calculateurs/calc-cp-compta';
import { CalcDroitsDP, CalcBourses, CalcTaxeApprentissage } from '@/components/calculateurs/calc-recettes';
import { CalcSurremDOM, CalcHeuresSup, CalcRatiosBilanciels } from '@/components/calculateurs/calc-paie-pilotage';

const REGISTRY: Record<string, () => JSX.Element> = {
  'caisse-regie': CalcCaisseRegie,
  'rapprochement-bancaire': CalcRapprochement,
  'fonds-social-cantine': CalcFondsSocialCantine,
  'fonds-social-eleves': CalcFondsSocialEleves,
  'voyage-famille': CalcVoyageFamille,
  'seuils-ccp': CalcSeuilsCCP,
  'amortissements': CalcAmortissements,
  'dbm': CalcDBM,
  'dgp': CalcDGP,
  'droits-dp': CalcDroitsDP,
  'bourses': CalcBourses,
  'taxe-apprentissage': CalcTaxeApprentissage,
  'surremuneration-dom': CalcSurremDOM,
  'heures-sup': CalcHeuresSup,
  'ratios-bilanciels': CalcRatiosBilanciels,
};

/**
 * Mapping calculateur → destination métier (où trouver l'outil maintenant).
 * Au moins une destination par calculateur (la principale en premier).
 */
const REDIRECTIONS: Record<string, { label: string; path: string }[]> = {
  'caisse-regie': [
    { label: 'Audit → Régies', path: '/regies' },
    { label: 'Contrôle → Caisse', path: '/controle-caisse' },
  ],
  'rapprochement-bancaire': [{ label: 'Contrôle → Rapprochement bancaire', path: '/rapprochement' }],
  'fonds-social-cantine': [{ label: 'Audit → Fonds sociaux', path: '/fonds-sociaux' }],
  'fonds-social-eleves': [{ label: 'Audit → Fonds sociaux', path: '/fonds-sociaux' }],
  'voyage-famille': [{ label: 'Audit → Voyages', path: '/voyages' }],
  'seuils-ccp': [
    { label: 'Audit → Commande publique', path: '/marches' },
  ],
  'amortissements': [{ label: 'Analyser → Annexe comptable', path: '/annexe-comptable' }],
  'dbm': [{ label: 'Analyser → Analyse financière', path: '/analyse-financiere' }],
  'dgp': [{ label: 'Audit → Dépenses', path: '/depenses' }],
  'droits-dp': [
    { label: 'Audit → Droits constatés', path: '/droits-constates' },
    { label: 'Audit → Restauration', path: '/restauration' },
  ],
  'bourses': [{ label: 'Audit → Bourses', path: '/bourses' }],
  'taxe-apprentissage': [{ label: 'Audit → Subventions', path: '/subventions' }],
  'surremuneration-dom': [{ label: 'Audit → Salaires', path: '/salaires' }],
  'heures-sup': [{ label: 'Audit → Salaires', path: '/salaires' }],
  'ratios-bilanciels': [
    { label: 'Analyser → Analyse financière', path: '/analyse-financiere' },
    { label: 'Analyser → Fonds de roulement', path: '/fonds-roulement' },
  ],
};

export default function Calculateurs() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mode standalone : compatibilité ascendante avec d'anciens liens
  if (id) {
    const meta = getCalculateur(id);
    const Comp = REGISTRY[id];
    const dests = REDIRECTIONS[id] ?? [];
    return (
      <div className="container max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/outils/calculateurs')}>
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          {dests.map(d => (
            <Button key={d.path} variant="ghost" size="sm" asChild>
              <Link to={d.path}>{d.label} <ExternalLink className="h-3 w-3 ml-1" /></Link>
            </Button>
          ))}
        </div>
        {meta && Comp ? (
          <>
            <h1 className="text-xl font-bold mb-1">{meta.label}</h1>
            <p className="text-sm text-muted-foreground mb-4">{meta.description}</p>
            <Comp />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Calculateur introuvable.</p>
        )}
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6">
      <header className="mb-4 flex items-start gap-3 border-b pb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CalcIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight">Calculateurs réglementaires</h1>
          <p className="text-sm text-muted-foreground">
            Les outils de calcul ont été intégrés directement dans leurs modules métier.
          </p>
        </div>
      </header>

      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm">Nouvelle organisation</AlertTitle>
        <AlertDescription className="text-xs">
          Pour gagner en efficacité, chaque calculateur est désormais accessible directement
          depuis la page métier où son résultat est utilisé (bouton « 🧮 » ou onglet dédié).
          Plus besoin de quitter votre contexte de travail.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CALCULATEURS.map(c => {
          const Icon = c.icon;
          const dests = REDIRECTIONS[c.id] ?? [];
          return (
            <Card key={c.id} className="h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-tight">{c.label}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1">{c.categorie}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                <div className="space-y-1 mt-3 pt-2 border-t">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Désormais dans :
                  </p>
                  {dests.map(d => (
                    <Button key={d.path} size="sm" variant="ghost" asChild
                      className="w-full justify-start h-7 text-xs">
                      <Link to={d.path}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {d.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

```

### FICHIER : src/pages/CalendrierAnnuel.tsx

```tsx
import { useMemo, useState, useEffect } from 'react';
import { ModulePageLayout, ModuleSection } from '@/components/ModulePageLayout';
import { useAuditParamsContext } from '@/contexts/AuditParamsContext';
import { getAgenceComptable } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import {
  ACTIVITES_MODELES, CATEGORIES_COULEURS, MOIS_NOMS,
  type ActiviteModele, type Categorie, type Periodicite,
} from '@/lib/calendrier-activites';
import type { ActiviteCalendrier } from '@/lib/calendrier-types';
import { exportCalendrierPDF, exportCalendrierDOCX } from '@/lib/calendrier-export';
import { downloadEmlFile, getActivitesGroupees } from '@/lib/calendrier-mail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileDown, FileText, Plus, Trash2, AlertTriangle, Filter,
  Building2, Pencil, Mail, CheckCircle2, Clock, Lock, Send, Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { CalendrierTimeline } from '@/components/CalendrierTimeline';
import { DiffuserCalendrierDialog } from '@/components/DiffuserCalendrierDialog';
import { useCalendrierSync } from '@/hooks/useCalendrierSync';
import { useGroupements } from '@/hooks/useGroupements';
import { Cloud, CloudOff } from 'lucide-react';
import { RealtimePulse } from '@/components/RealtimePulse';

const STORAGE_KEY = 'calendrier_annuel_v1';

// Une activité issue de la bibliothèque ET de criticité haute est
// considérée comme obligatoire réglementaire (cadenas, non supprimable)
function isObligatoire(a: ActiviteCalendrier): boolean {
  return !!a.modeleId && a.criticite === 'haute';
}

function buildFromModele(m: ActiviteModele, allEtabIds: string[]): ActiviteCalendrier {
  return {
    id: `${m.id}-${Date.now()}`,
    modeleId: m.id,
    titre: m.titre,
    categorie: m.categorie,
    periodicite: m.periodicite,
    moisDebut: m.moisDebut,
    moisFin: m.moisFin,
    description: m.description,
    reference: m.reference,
    responsable: m.responsable,
    criticite: m.criticite,
    etablissementsIds: allEtabIds,
    tousEtablissements: true,
  };
}

export default function CalendrierAnnuel() {
  const { params } = useAuditParamsContext();
  const ac = getAgenceComptable(params);
  const etablissementsRattaches = params.etablissements.filter(e => !e.isAgenceComptable);
  const { activeId } = useGroupements();
  const { activites, setActivites, synced, remoteUpdateAt } = useCalendrierSync();

  const [filterCategorie, setFilterCategorie] = useState<string>('all');
  const [filterMois, setFilterMois] = useState<string>('all');
  const [filterEtab, setFilterEtab] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  // Initialiser avec la bibliothèque si vide
  const initFromLibrary = () => {
    const allIds = etablissementsRattaches.map(e => e.id);
    setActivites(ACTIVITES_MODELES.map(m => buildFromModele(m, allIds)));
    toast.success(`${ACTIVITES_MODELES.length} activités importées de la bibliothèque`);
  };

  const addFromModele = (m: ActiviteModele) => {
    const allIds = etablissementsRattaches.map(e => e.id);
    setActivites([...activites, buildFromModele(m, allIds)]);
    toast.success('Activité ajoutée');
  };

  const remove = (id: string) => {
    const a = activites.find(x => x.id === id);
    if (a && isObligatoire(a)) {
      toast.error("Activité obligatoire réglementaire — non supprimable. Vous pouvez l'éditer ou la marquer comme réalisée.");
      return;
    }
    setActivites(activites.filter(a => a.id !== id));
    toast.success('Activité supprimée');
  };

  const update = (id: string, patch: Partial<ActiviteCalendrier>) => {
    setActivites(activites.map(a => a.id === id ? { ...a, ...patch } : a));
  };

  // Duplication N → N+1 : reset des dates d'échéance + statut réalisé
  const dupliquerExerciceSuivant = () => {
    if (activites.length === 0) {
      toast.error('Aucune activité à dupliquer');
      return;
    }
    const exNum = parseInt(params.exercice, 10);
    const exSuivant = isNaN(exNum) ? '' : String(exNum + 1);
    if (!confirm(
      `Dupliquer ce calendrier vers l'exercice ${exSuivant || 'suivant'} ?\n\n` +
      `• Les statuts « réalisé » seront réinitialisés\n` +
      `• Les dates d'échéance seront décalées d'un an\n` +
      `• Le calendrier actuel sera REMPLACÉ\n\n` +
      `Pensez à exporter d'abord le calendrier actuel si besoin d'archive.`
    )) return;

    const dupliquees: ActiviteCalendrier[] = activites.map(a => {
      let newDate: string | undefined;
      if (a.dateEcheance) {
        const d = new Date(a.dateEcheance);
        d.setFullYear(d.getFullYear() + 1);
        newDate = d.toISOString().slice(0, 10);
      }
      return {
        ...a,
        id: `${a.modeleId || 'custom'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dateEcheance: newDate,
        realisee: false,
        realiseeAt: undefined,
        realiseePar: undefined,
      };
    });
    setActivites(dupliquees);
    toast.success(`Calendrier dupliqué vers ${exSuivant} (${dupliquees.length} activités). Pensez à mettre à jour l'exercice dans Paramètres.`);
  };

  const addBlank = () => {
    const id = `custom-${Date.now()}`;
    setActivites([...activites, {
      id, titre: 'Nouvelle activité', categorie: 'Pilotage / Conseil AC',
      periodicite: 'annuelle', moisDebut: new Date().getMonth() + 1, description: '',
      responsable: 'AC', criticite: 'moyenne',
      etablissementsIds: etablissementsRattaches.map(e => e.id),
      tousEtablissements: true,
    }]);
    setEditingId(id);
    toast.success('Activité personnalisée créée — éditez-la');
  };

  const addAllFromLibrary = () => {
    const allIds = etablissementsRattaches.map(e => e.id);
    const existingModeleIds = new Set(activites.map(a => a.modeleId).filter(Boolean));
    const toAdd = ACTIVITES_MODELES.filter(m => !existingModeleIds.has(m.id));
    if (toAdd.length === 0) {
      toast.info('Toutes les activités de la bibliothèque sont déjà ajoutées');
      return;
    }
    setActivites([...activites, ...toAdd.map(m => buildFromModele(m, allIds))]);
    toast.success(`${toAdd.length} activité(s) ajoutée(s)`);
  };

  const clearAll = () => {
    if (!confirm('Vider tout le calendrier ? Cette action est irréversible.')) return;
    setActivites([]);
    toast.success('Calendrier vidé');
  };

  // Filtrage
  const filtered = useMemo(() => activites.filter(a => {
    if (filterCategorie !== 'all' && a.categorie !== filterCategorie) return false;
    if (filterMois !== 'all') {
      const m = parseInt(filterMois, 10);
      if (!isInMonth(a, m)) return false;
    }
    if (filterEtab !== 'all') {
      if (filterEtab === 'tous' && !a.tousEtablissements) return false;
      if (filterEtab !== 'tous' && !a.etablissementsIds.includes(filterEtab)) return false;
    }
    return true;
  }), [activites, filterCategorie, filterMois, filterEtab]);

  // Vue par mois
  const byMonth = useMemo(() => {
    const map: Record<number, ActiviteCalendrier[]> = {};
    for (let m = 1; m <= 12; m++) map[m] = [];
    filtered.forEach(a => {
      for (let m = 1; m <= 12; m++) {
        if (isInMonth(a, m)) map[m].push(a);
      }
    });
    return map;
  }, [filtered]);

  const exportPDF = () => {
    if (activites.length === 0) {
      toast.error('Aucune activité à exporter');
      return;
    }
    exportCalendrierPDF({
      activites, etablissements: etablissementsRattaches, agenceComptable: ac,
      exercice: params.exercice, agentComptable: params.agentComptable,
    });
    toast.success('PDF généré');
  };

  const exportDOCX = async () => {
    if (activites.length === 0) {
      toast.error('Aucune activité à exporter');
      return;
    }
    await exportCalendrierDOCX({
      activites, etablissements: etablissementsRattaches, agenceComptable: ac,
      exercice: params.exercice, agentComptable: params.agentComptable,
    });
    toast.success('Document Word généré');
  };

  const exportMailMensuel = () => {
    if (activites.length === 0) {
      toast.error('Initialisez d\'abord la bibliothèque');
      return;
    }
    const moisCible = new Date().getMonth() + 1;
    const { duMois, enRetard } = getActivitesGroupees(activites, moisCible);
    if (duMois.length === 0 && enRetard.length === 0) {
      toast.info('Aucune opération à signaler ce mois-ci');
      return;
    }
    downloadEmlFile({
      activites, etablissements: etablissementsRattaches, agenceComptable: ac,
      exercice: params.exercice, agentComptable: params.agentComptable, moisCible,
    });
    toast.success(`Mail .eml généré (${duMois.length} du mois, ${enRetard.length} en retard)`);
  };

  const headerActions = (
    <div className="flex flex-wrap gap-2 items-center">
      {activeId && (
        <span className="text-xs text-muted-foreground inline-flex items-center gap-2 mr-2">
          {synced ? <><Cloud className="h-3.5 w-3.5 text-emerald-600" /> Synchronisé</> : <><CloudOff className="h-3.5 w-3.5" /> Sync…</>}
          <RealtimePulse triggerAt={remoteUpdateAt} label="Activité mise à jour par un collègue" />
        </span>
      )}
      <DiffuserCalendrierDialog
        activites={activites}
        etablissementsRattaches={etablissementsRattaches}
        agenceComptable={ac}
        exercice={params.exercice}
        agentComptable={params.agentComptable}
        trigger={
          <Button size="sm" className="gap-1.5">
            <Send className="h-4 w-4" /> Diffuser aux ER
          </Button>
        }
      />
      <Button onClick={exportMailMensuel} size="sm" variant="outline" className="gap-1.5">
        <Mail className="h-4 w-4" /> Mail mensuel (.eml)
      </Button>
      <Button onClick={exportPDF} size="sm" variant="secondary" className="gap-1.5">
        <FileDown className="h-4 w-4" /> Tableau PDF
      </Button>
      <Button onClick={exportDOCX} size="sm" variant="secondary" className="gap-1.5">
        <FileText className="h-4 w-4" /> Word
      </Button>
      {activites.length > 0 && (
        <Button onClick={dupliquerExerciceSuivant} size="sm" variant="ghost" className="gap-1.5">
          <Copy className="h-4 w-4" /> Dupliquer N→N+1
        </Button>
      )}
    </div>
  );

  return (
    <ModulePageLayout
      title="Calendrier annuel de l'agent comptable"
      section="AUDIT & RESTITUTION"
      description="Calendrier des opérations comptables à destination des établissements rattachés. Exports PDF et Word au format paysage."
      refs={[
        { code: 'GBCP 2012-1246', label: 'décret du 7 nov. 2012' },
        { code: 'M9.6', label: 'instruction codificatrice' },
        { code: 'R. 421-64+', label: 'Code de l\'éducation' },
        { code: 'Circ. 2011-117', label: 'voyages scolaires' },
      ]}
      headerActions={headerActions}
    >
      <DoctrineEPLE
        theme="calendrier"
        titre="Calendrier annuel de l'agence comptable"
        resume="Échéances réglementaires (BI, BR, CF, DSN, TVA, inventaire, PV de caisse) à destination des ER."
      />

      {/* ─── Avertissement ─── */}
      <div className="rounded-lg border-l-4 border-l-destructive bg-destructive/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive text-sm">Note aux secrétaires généraux des établissements rattachés</p>
            <p className="text-sm text-foreground/80 mt-1">
              Le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir
              correctement le groupement dans les délais réglementaires. Une coordination rigoureuse est indispensable
              pour garantir la régularité comptable, la sécurité des fonds et la bonne information de tous.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Contexte ─── */}
      <Card className="p-4 bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Agence comptable</p>
            <p className="font-semibold">{ac?.nom || 'Non définie'} {ac?.uai && <span className="text-xs text-muted-foreground">({ac.uai})</span>}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Exercice</p>
            <p className="font-semibold">{params.exercice}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Établissements rattachés</p>
            <p className="font-semibold">{etablissementsRattaches.length}</p>
          </div>
        </div>
      </Card>

      {/* ─── Note autonomie AC ─── */}
      <Card className="p-3 border-primary/30 bg-primary/5">
        <p className="text-sm text-foreground/80">
          <strong className="text-primary">Votre calendrier, votre méthode.</strong> Chaque agent comptable
          construit son propre calendrier en piochant dans la bibliothèque réglementaire ({ACTIVITES_MODELES.length} activités
          pré-rédigées) et en y ajoutant ses activités personnalisées propres à son groupement (audits planifiés,
          réunions internes, échéances locales…). Modifiez librement titres, dates, références et établissements concernés.
        </p>
      </Card>

      {/* ─── Actions ─── */}
      <div className="flex flex-wrap gap-2 items-center">
        {activites.length === 0 ? (
          <>
            <Button onClick={initFromLibrary} className="gap-1.5">
              <Plus className="h-4 w-4" /> Initialiser avec la bibliothèque ({ACTIVITES_MODELES.length} activités)
            </Button>
            <Button onClick={addBlank} variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" /> Démarrer vide (activités personnalisées)
            </Button>
          </>
        ) : (
          <>
            <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Bibliothèque ({ACTIVITES_MODELES.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bibliothèque d'activités réglementaires</DialogTitle>
                </DialogHeader>
                <div className="flex justify-end mb-2">
                  <Button size="sm" variant="secondary" onClick={addAllFromLibrary} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Tout ajouter (manquantes)
                  </Button>
                </div>
                <div className="space-y-2">
                  {ACTIVITES_MODELES.map(m => {
                    const alreadyAdded = activites.some(a => a.modeleId === m.id);
                    return (
                      <div key={m.id} className="flex gap-3 p-3 rounded-lg border hover:bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{m.titre}</span>
                            <Badge variant="outline" className={cn('text-[10px]', CATEGORIES_COULEURS[m.categorie])}>
                              {m.categorie}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                          {m.reference && <p className="text-[11px] text-primary mt-0.5">📖 {m.reference}</p>}
                        </div>
                        <Button size="sm" variant={alreadyAdded ? 'ghost' : 'outline'}
                          disabled={alreadyAdded}
                          onClick={() => addFromModele(m)}>
                          {alreadyAdded ? 'Ajoutée' : 'Ajouter'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={addBlank} variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Activité personnalisée
            </Button>
            <Button onClick={clearAll} variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive ml-auto">
              <Trash2 className="h-4 w-4" /> Tout vider
            </Button>
          </>
        )}
      </div>

      {activites.length > 0 && (
        <>
          {/* ─── Filtres ─── */}
          <Card className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterMois} onValueChange={setFilterMois}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Mois" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les mois</SelectItem>
                  {MOIS_NOMS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCategorie} onValueChange={setFilterCategorie}>
                <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {Object.keys(CATEGORIES_COULEURS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterEtab} onValueChange={setFilterEtab}>
                <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Établissement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="tous">Globales (tous ER)</SelectItem>
                  {etablissementsRattaches.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {filtered.length} / {activites.length} activité(s)
              </span>
            </div>
          </Card>

          {/* ─── Timeline charge mensuelle ─── */}
          <CalendrierTimeline
            activites={activites}
            selectedMois={filterMois !== 'all' ? parseInt(filterMois, 10) : null}
            onMonthClick={(m) => setFilterMois(filterMois === String(m) ? 'all' : String(m))}
          />

          {/* ─── Vue par mois ─── */}
          <div className="space-y-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const items = filterMois === 'all'
                ? byMonth[m]
                : (parseInt(filterMois, 10) === m ? byMonth[m] : []);
              if (items.length === 0 && filterMois !== 'all' && parseInt(filterMois, 10) !== m) return null;
              if (items.length === 0) return null;
              return (
                <ModuleSection key={m} title={MOIS_NOMS[m - 1]} badge={`${items.length} activité${items.length > 1 ? 's' : ''}`}>
                  <div className="space-y-2">
                    {items.map(a => (
                      <ActiviteRow key={a.id + '-' + m}
                        activite={a}
                        etablissements={etablissementsRattaches}
                        onUpdate={(patch) => update(a.id, patch)}
                        onRemove={() => remove(a.id)}
                        editing={editingId === a.id}
                        onEdit={() => setEditingId(editingId === a.id ? null : a.id)}
                      />
                    ))}
                  </div>
                </ModuleSection>
              );
            })}
          </div>
        </>
      )}
    </ModulePageLayout>
  );
}

// ─── Ligne d'activité ──────────────────────────────────────────────
function ActiviteRow({
  activite, etablissements, onUpdate, onRemove, editing, onEdit,
}: {
  activite: ActiviteCalendrier;
  etablissements: { id: string; nom: string; uai: string }[];
  onUpdate: (patch: Partial<ActiviteCalendrier>) => void;
  onRemove: () => void;
  editing: boolean;
  onEdit: () => void;
}) {
  const { params } = useAuditParamsContext();
  const realisee = !!activite.realisee;
  const critColor = realisee
    ? 'border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 opacity-70'
    : activite.criticite === 'haute' ? 'border-l-destructive bg-destructive/5'
    : activite.criticite === 'moyenne' ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
    : 'border-l-sky-500 bg-sky-50/50 dark:bg-sky-950/20';

  const erResume = activite.tousEtablissements
    ? `Tous les ER (${etablissements.length})`
    : `${activite.etablissementsIds.length} ER sélectionné(s)`;

  const toggleRealisee = (c: boolean) => {
    if (c) {
      onUpdate({
        realisee: true,
        realiseeAt: new Date().toISOString(),
        realiseePar: params.agentComptable || 'Agent comptable',
      });
      toast.success('Activité marquée comme réalisée');
    } else {
      onUpdate({ realisee: false, realiseeAt: undefined, realiseePar: undefined });
    }
  };

  return (
    <div className={cn('rounded-lg border border-border border-l-4 p-3 transition-all', critColor)}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={realisee}
            onCheckedChange={(c) => toggleRealisee(!!c)}
            aria-label="Marquer comme réalisée"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isObligatoire(activite) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="h-3.5 w-3.5 text-destructive shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-xs">
                  Activité obligatoire réglementaire — non supprimable.
                  Vous pouvez l'éditer (date, ER concernés, description) ou la marquer comme réalisée.
                </TooltipContent>
              </Tooltip>
            )}
            <span className={cn('font-semibold text-sm', realisee && 'line-through text-muted-foreground')}>
              {activite.titre}
            </span>
            {realisee && (
              <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-900 border-emerald-300 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Réalisée
              </Badge>
            )}
            {isObligatoire(activite) && (
              <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/40">
                Obligatoire
              </Badge>
            )}
            <Badge variant="outline" className={cn('text-[10px]', CATEGORIES_COULEURS[activite.categorie])}>
              {activite.categorie}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{activite.responsable}</Badge>
            {activite.reference && (
              <Badge variant="secondary" className="text-[10px]">📖 {activite.reference}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{activite.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
            {activite.dateEcheance && (
              <span className="text-foreground/80">
                <strong>Échéance :</strong> {new Date(activite.dateEcheance).toLocaleDateString('fr-FR')}
              </span>
            )}
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {erResume}
            </span>
            {realisee && activite.realiseeAt && (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(activite.realiseeAt).toLocaleDateString('fr-FR')} — {activite.realiseePar}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 w-7 p-0">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm" variant="ghost"
            onClick={onRemove}
            disabled={isObligatoire(activite)}
            title={isObligatoire(activite) ? 'Activité obligatoire — non supprimable' : 'Supprimer'}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive disabled:opacity-30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label className="text-xs">Titre</Label>
              <Input value={activite.titre} onChange={e => onUpdate({ titre: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Catégorie</Label>
              <Select value={activite.categorie} onValueChange={(v) => onUpdate({ categorie: v as Categorie })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(CATEGORIES_COULEURS).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Périodicité</Label>
              <Select value={activite.periodicite} onValueChange={(v) => onUpdate({ periodicite: v as Periodicite })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annuelle">Annuelle</SelectItem>
                  <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                  <SelectItem value="mensuelle">Mensuelle</SelectItem>
                  <SelectItem value="ponctuelle">Ponctuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Date d'échéance précise</Label>
              <Input type="date" value={activite.dateEcheance || ''} onChange={e => onUpdate({ dateEcheance: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Mois début (1-12, 0 si mensuelle)</Label>
              <Input type="number" min={0} max={12} value={activite.moisDebut ?? ''}
                onChange={e => onUpdate({ moisDebut: parseInt(e.target.value, 10) || 0 })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Mois fin (optionnel)</Label>
              <Input type="number" min={1} max={12} value={activite.moisFin || ''}
                onChange={e => onUpdate({ moisFin: parseInt(e.target.value, 10) || undefined })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Responsable</Label>
              <Select value={activite.responsable} onValueChange={(v) => onUpdate({ responsable: v as 'AC' | 'ER' | 'AC+ER' })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Agent comptable (AC)</SelectItem>
                  <SelectItem value="ER">Établissement rattaché (ER)</SelectItem>
                  <SelectItem value="AC+ER">AC + ER (conjoint)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Criticité</Label>
              <Select value={activite.criticite} onValueChange={(v) => onUpdate({ criticite: v as 'haute' | 'moyenne' | 'info' })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Référence réglementaire (optionnel)</Label>
              <Input value={activite.reference || ''}
                onChange={e => onUpdate({ reference: e.target.value })}
                placeholder="ex : M9.6, art. R. 421-77, circ. n° 2011-117…"
                className="h-8 text-sm" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={activite.description} onChange={e => onUpdate({ description: e.target.value })}
              className="text-sm" rows={3} />
          </div>

          {/* Affectation établissements rattachés */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold">Établissements rattachés concernés</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`tous-${activite.id}`}
                  checked={activite.tousEtablissements}
                  onCheckedChange={(c) => onUpdate({
                    tousEtablissements: !!c,
                    etablissementsIds: c ? etablissements.map(e => e.id) : activite.etablissementsIds,
                  })}
                />
                <Label htmlFor={`tous-${activite.id}`} className="text-xs cursor-pointer">Tous</Label>
              </div>
            </div>
            {!activite.tousEtablissements && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 border rounded">
                {etablissements.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic col-span-2">
                    Aucun établissement rattaché. Ajoutez-en dans Paramètres.
                  </p>
                ) : etablissements.map(e => (
                  <div key={e.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`${activite.id}-${e.id}`}
                      checked={activite.etablissementsIds.includes(e.id)}
                      onCheckedChange={(c) => {
                        const newIds = c
                          ? [...activite.etablissementsIds, e.id]
                          : activite.etablissementsIds.filter(id => id !== e.id);
                        onUpdate({ etablissementsIds: newIds });
                      }}
                    />
                    <Label htmlFor={`${activite.id}-${e.id}`} className="text-xs cursor-pointer truncate">
                      {e.nom} <span className="text-muted-foreground">({e.uai})</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────────────────
function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  return m >= debut || m <= fin;
}

```

### FICHIER : src/pages/CartographieRisques.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Download } from 'lucide-react';
import { CartoRisque, NIVEAUX_RISQUE } from '@/lib/types';
import { CARTOPALE_PROCESSUS } from '@/lib/regulatory-data';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, AnomalyAlert } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { AgentSelect } from '@/components/AgentSelect';

const PROCESSUS_LIST = CARTOPALE_PROCESSUS.map(p => `${p.code} — ${p.label}`);

const riskLevel = (r: CartoRisque) => {
  const n = r.probabilite * r.impact * r.maitrise;
  if (n >= 40) return { label: 'CRITIQUE', color: 'destructive' as const, bg: 'bg-destructive/5' };
  if (n >= 20) return { label: 'MAJEUR', color: 'default' as const, bg: 'bg-orange-50 dark:bg-orange-950/20' };
  if (n >= 10) return { label: 'MOYEN', color: 'secondary' as const, bg: '' };
  return { label: 'FAIBLE', color: 'secondary' as const, bg: '' };
};

export default function CartographieRisques() {
  const [items, setItems] = useState<CartoRisque[]>(() => loadState('cartographie', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: CartoRisque[]) => { setItems(d); saveState('cartographie', d); };

  const submit = () => {
    if (!form || !form.risque) return;
    const item: CartoRisque = {
      id: form.id || crypto.randomUUID(), processus: form.processus, risque: form.risque,
      probabilite: parseInt(form.probabilite) || 3, impact: parseInt(form.impact) || 3,
      maitrise: parseInt(form.maitrise) || 3, action: form.action,
      responsable: form.responsable, echeance: form.echeance, statut: form.statut,
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const sorted = [...items].sort((a, b) => (b.probabilite * b.impact * b.maitrise) - (a.probabilite * a.impact * a.maitrise));
  const critiques = items.filter(r => r.probabilite * r.impact * r.maitrise >= 40);
  const majeurs = items.filter(r => { const n = r.probabilite * r.impact * r.maitrise; return n >= 20 && n < 40; });
  const coveredProcessus = [...new Set(items.map(r => r.processus.split(' — ')[0]))];

  return (
    <ModulePageLayout
      title="Cartographie des risques — CICF"
      section="CONTRÔLE INTERNE"
      description="Identification, cotation et traitement des risques comptables et financiers selon la méthodologie Cartop@le / ODICé."
      refs={[
        { code: 'Cartop@le', label: '11 processus CICF' },
        { code: 'Décret 2012-1246 art. 170', label: 'CICF — Contrôle Interne Comptable et Financier' },
        { code: 'ODICé', label: 'Outil de diagnostic' },
      ]}
      headerActions={
        <div className="flex gap-2">
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/25"
            variant="outline"
            onClick={() => setForm({
              processus: PROCESSUS_LIST[0], risque: '', probabilite: '3', impact: '3', maitrise: '3',
              action: '', responsable: '', echeance: 'Permanent', statut: 'À lancer',
            })}
          >
            <Plus className="h-4 w-4 mr-2" /> Nouveau risque
          </Button>
          {items.length > 0 && (
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/25"
              variant="outline"
              onClick={() => {
                const rows = [['Processus','Risque','P','I','M','Note','Action','Responsable','Échéance','Statut'], ...items.map(r => [r.processus, r.risque, r.probabilite, r.impact, r.maitrise, r.probabilite*r.impact*r.maitrise, r.action, r.responsable, r.echeance, r.statut])];
                const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
                const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})); a.download = `cartographie-risques-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          )}
        </div>
      }
    >
      <DoctrineEPLE
        theme="cartographie-risques"
        titre="Cartographie des risques — méthode P × I × M"
        resume="11 processus Cartop@le. Risque critique ≥ 40 → action immédiate ; majeur 20-39 → action sous 3 mois."
      />

      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold">{items.length}</p>
          <p className="text-xs text-muted-foreground">Risques identifiés</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold text-destructive">{critiques.length}</p>
          <p className="text-xs text-muted-foreground">Critiques (≥ 40)</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold text-orange-600">{majeurs.length}</p>
          <p className="text-xs text-muted-foreground">Majeurs (20-39)</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold">{coveredProcessus.length}/11</p>
          <p className="text-xs text-muted-foreground">Processus couverts</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold text-primary">{items.filter(r => r.statut === 'À lancer').length}</p>
          <p className="text-xs text-muted-foreground">Issus d'audit</p>
        </CardContent></Card>
      </div>

      {/* ─── Processus coverage ─── */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <p className="text-sm font-bold mb-3">Couverture des 11 processus Cartop@le</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {CARTOPALE_PROCESSUS.map(p => {
              const count = items.filter(r => r.processus.startsWith(p.code)).length;
              const hasCritical = items.some(r => r.processus.startsWith(p.code) && r.probabilite * r.impact * r.maitrise >= 40);
              return (
                <div key={p.code} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${count > 0 ? 'bg-muted/50' : 'opacity-50'}`}>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${hasCritical ? 'bg-destructive' : count > 0 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="font-mono text-xs text-muted-foreground w-7">{p.code}</span>
                  <span className="flex-1 truncate">{p.label}</span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{count}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {critiques.length > 0 && (
        <AnomalyAlert
          title={`${critiques.length} risque${critiques.length > 1 ? 's' : ''} critique${critiques.length > 1 ? 's' : ''} — action immédiate requise`}
          severity="error"
        />
      )}

      {/* ─── Form ─── */}
      {form && (
        <Card className="border-primary shadow-card-hover">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Processus Cartop@le</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.processus} onChange={e => setForm({ ...form, processus: e.target.value })}>
                  {PROCESSUS_LIST.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Risque identifié</Label><Input value={form.risque} onChange={e => setForm({ ...form, risque: e.target.value })} placeholder="Décrire le risque..." /></div>
              <div className="space-y-1">
                <Label className="text-xs">Probabilité (1-5)</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.probabilite} onChange={e => setForm({ ...form, probabilite: e.target.value })}>
                  {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Impact (1-5)</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.impact} onChange={e => setForm({ ...form, impact: e.target.value })}>
                  {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Maîtrise (1-5, 5 = non maîtrisé)</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.maitrise} onChange={e => setForm({ ...form, maitrise: e.target.value })}>
                  {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Action corrective</Label><Input value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Responsable</Label><AgentSelect value={form.responsable || ''} onChange={(display) => setForm({ ...form, responsable: display })} placeholder="Choisir dans l'équipe…" /></div>
              <div className="space-y-1">
                <Label className="text-xs">Échéance</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })}>
                  {['Permanent', 'Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Statut</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                  {['À lancer', 'Planifié', 'En cours', 'Réalisé'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
              <span className="text-sm">Note de risque :</span>
              <span className="text-2xl font-bold">{(parseInt(form.probabilite) || 1) * (parseInt(form.impact) || 1) * (parseInt(form.maitrise) || 1)}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={submit}>Valider</Button>
              <Button variant="outline" onClick={() => setForm(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Table ─── */}
      {items.length === 0 && !form && (
        <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">
          Aucun risque enregistré. Utilisez « Nouveau risque » pour commencer l'analyse Cartop@le.
        </CardContent></Card>
      )}

      {sorted.length > 0 && (
        <>
          {/* Vue desktop */}
          <Card className="shadow-card hidden md:block">
            <CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left p-2">Processus</th>
                    <th className="text-left p-2">Risque</th>
                    <th className="p-2">P</th><th className="p-2">I</th><th className="p-2">M</th>
                    <th className="p-2">Note</th><th className="p-2">Criticité</th>
                    <th className="text-left p-2">Action</th><th className="p-2">Statut</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(r => {
                    const n = r.probabilite * r.impact * r.maitrise;
                    const rl = riskLevel(r);
                    return (
                      <tr key={r.id} className={`border-b transition-colors ${rl.bg}`}>
                        <td className="p-2 font-bold text-xs">{r.processus}</td>
                        <td className="p-2 max-w-[200px]">{r.risque}</td>
                        <td className="p-2 text-center">{r.probabilite}</td>
                        <td className="p-2 text-center">{r.impact}</td>
                        <td className="p-2 text-center">{r.maitrise}</td>
                        <td className="p-2 text-center font-mono font-bold text-lg">{n}</td>
                        <td className="p-2"><Badge variant={rl.color}>{rl.label}</Badge></td>
                        <td className="p-2 text-xs max-w-[180px]">{r.action}</td>
                        <td className="p-2"><Badge variant={r.statut === 'Réalisé' ? 'secondary' : 'default'}>{r.statut}</Badge></td>
                        <td className="p-2"><div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...r, probabilite: String(r.probabilite), impact: String(r.impact), maitrise: String(r.maitrise) })}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== r.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
          {/* Vue mobile */}
          <div className="md:hidden space-y-2">
            {sorted.map(r => {
              const n = r.probabilite * r.impact * r.maitrise;
              const rl = riskLevel(r);
              return (
                <Card key={r.id} className={rl.label === 'CRITIQUE' ? 'border-destructive' : ''}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">{r.processus}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-lg">{n}</span>
                        <Badge variant={rl.color} className="text-[10px]">{rl.label}</Badge>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{r.risque}</p>
                    <div className="grid grid-cols-3 gap-1 text-xs text-center">
                      <div className="bg-muted rounded p-1"><p className="text-muted-foreground">P</p><p className="font-bold">{r.probabilite}</p></div>
                      <div className="bg-muted rounded p-1"><p className="text-muted-foreground">I</p><p className="font-bold">{r.impact}</p></div>
                      <div className="bg-muted rounded p-1"><p className="text-muted-foreground">M</p><p className="font-bold">{r.maitrise}</p></div>
                    </div>
                    {r.action && <p className="text-xs text-muted-foreground">→ {r.action}</p>}
                    <div className="flex items-center justify-between">
                      <Badge variant={r.statut === 'Réalisé' ? 'secondary' : 'default'} className="text-[10px]">{r.statut}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm({ ...r, probabilite: String(r.probabilite), impact: String(r.impact), maitrise: String(r.maitrise) })}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => save(items.filter(i => i.id !== r.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/CommandePublique.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { EPCPItem, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function CommandePublique() {
  const [items, setItems] = useState<EPCPItem[]>(() => loadState('epcp', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: EPCPItem[]) => { setItems(d); saveState('epcp', d); };

  const submit = () => {
    if (!form || !form.objet) return;
    const item: EPCPItem = { id: form.id || crypto.randomUUID(), objet: form.objet, nature: form.nature, previsionnel: parseFloat(form.previsionnel) || 0, engage: parseFloat(form.engage) || 0, procedure: form.procedure, referenceMarche: form.referenceMarche };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const totPrev = items.reduce((s, x) => s + x.previsionnel, 0);
  const totEng = items.reduce((s, x) => s + x.engage, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commande Publique</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : CMP 2024 — Suivi des engagements et procédures</p>
        </div>
        <Button onClick={() => setForm({ objet: '', nature: 'Fournitures', previsionnel: '', engage: '', procedure: 'Gré à gré', referenceMarche: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Marchés</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(totPrev)}</p><p className="text-xs text-muted-foreground">Prévisionnel</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(totEng)}</p><p className="text-xs text-muted-foreground">Engagé</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nature</Label><Input value={form.nature} onChange={e => setForm({ ...form, nature: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Prévisionnel (€)</Label><Input type="number" value={form.previsionnel} onChange={e => setForm({ ...form, previsionnel: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Engagé (€)</Label><Input type="number" value={form.engage} onChange={e => setForm({ ...form, engage: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Procédure</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.procedure} onChange={e => setForm({ ...form, procedure: e.target.value })}>
                <option>Gré à gré</option><option>MAPA</option><option>Formalisée</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Réf. marché</Label><Input value={form.referenceMarche} onChange={e => setForm({ ...form, referenceMarche: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun marché enregistré.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Objet</th><th className="p-2">Nature</th><th className="text-right p-2">Prév.</th><th className="text-right p-2">Engagé</th><th className="p-2">Procédure</th><th className="p-2">Réf.</th><th></th></tr></thead>
            <tbody>{items.map(x => (
              <tr key={x.id} className="border-b">
                <td className="p-2 font-bold">{x.objet}</td><td className="p-2">{x.nature}</td>
                <td className="p-2 text-right font-mono">{fmt(x.previsionnel)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.engage)}</td>
                <td className="p-2">{x.procedure}</td><td className="p-2 font-mono text-xs">{x.referenceMarche}</td>
                <td className="p-2"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, previsionnel: String(x.previsionnel), engage: String(x.engage) })}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  );
}

```

### FICHIER : src/pages/ControleCaisse.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { ControleCaisseItem, BILLETS, PIECES, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_CAISSE } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

export default function ControleCaisse() {
  const [items, setItems] = useState<ControleCaisseItem[]>(() => loadState('ctrl_caisse', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('ctrl_caisse_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('ctrl_caisse_checks', u); };
  const [form, setForm] = useState<any>(null);

  const save = (d: ControleCaisseItem[]) => { setItems(d); saveState('ctrl_caisse', d); };

  const billetageTotal = (b: Record<string, number>) => {
    let t = 0;
    BILLETS.forEach(v => { t += (b['b' + v] || 0) * v; });
    PIECES.forEach(v => { const k = 'p' + String(v).replace('.', ''); t += (b[k] || 0) * v; });
    return t;
  };

  const submit = () => {
    if (!form) return;
    const reel = parseFloat(form.reel) || 0;
    const theo = parseFloat(form.theorique) || 0;
    const ecart = reel - theo;
    const item: ControleCaisseItem = {
      id: form.id || crypto.randomUUID(), date: form.date, regisseur: form.regisseur,
      type: form.type, plafond: parseFloat(form.plafond) || 0, theorique: theo, reel,
      ecart, statut: Math.abs(ecart) < 0.01 ? 'Conforme' : 'Écart', observations: form.observations,
      journalCaisse: form.journalCaisse, billetage: form.billetage || {},
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const ecarts = items.filter(x => x.ecart !== 0);
  const journauxAbsents = items.filter(x => x.journalCaisse === false);

  return (
    <ModulePageLayout
      title="Contrôle de caisse"
      section="CONTRÔLES SUR PLACE"
      description="Contrôle inopiné de la caisse de l'agent comptable et des régisseurs. Comptage physique des espèces, vérification du journal de caisse et rapprochement avec le solde théorique."
      refs={[
        { code: 'M9-6 § 3.2.1', label: 'Vérification de la caisse' },
        { code: 'Art. 18 GBCP', label: 'Contrôle inopiné' },
        { code: 'Décret 2019-798', label: 'Art. 17 — Régies' },
      ]}
      headerActions={
        <Button
          className="bg-white/20 hover:bg-white/30 text-white border-white/25"
          variant="outline"
          onClick={() => setForm({ date: new Date().toISOString().split('T')[0], regisseur: '', type: 'Avances restauration', plafond: '', theorique: '', reel: '', observations: '', journalCaisse: null, billetage: {} })}
        >
          <Plus className="h-4 w-4 mr-2" /> Nouveau contrôle
        </Button>
      }
      completedChecks={(CONTROLES_CAISSE).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_CAISSE).length}
    >
      <DoctrineEPLE theme="controle-caisse" titre="Contrôle inopiné de caisse" resume="Billetage, plafond, PV signé, écart en compte d'attente 476/477" />
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Contrôles effectués</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${ecarts.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{ecarts.length}</p><p className="text-xs text-muted-foreground">Écarts détectés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${journauxAbsents.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{journauxAbsents.length}</p><p className="text-xs text-muted-foreground">Journaux absents</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.filter(x => x.statut === 'Conforme').length}</p><p className="text-xs text-muted-foreground">Conformes</p></CardContent></Card>
      </div>

      {journauxAbsents.length > 0 && (
        <AnomalyAlert title="Journal de caisse absent — Anomalie majeure" description="L'absence de journal de caisse constitue un manquement à l'obligation de tenue comptable (M9-6 § 3.2.1)." severity="error" />
      )}

      {form && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-lg">Saisie du contrôle</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Régisseur</Label><Input value={form.regisseur} onChange={e => setForm({ ...form, regisseur: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Type</Label><Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Plafond (€)</Label><Input type="number" value={form.plafond} onChange={e => setForm({ ...form, plafond: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde théorique (€)</Label><Input type="number" value={form.theorique} onChange={e => setForm({ ...form, theorique: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde réel compté (€)</Label><Input type="number" value={form.reel} onChange={e => setForm({ ...form, reel: e.target.value })} /></div>
            </div>

            {/* Billetage */}
            <div className="p-4 rounded-lg border border-primary bg-primary/5">
              <h4 className="text-sm font-bold text-primary mb-3">Billétage — Comptage des espèces</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold mb-2">Billets</p>
                  {BILLETS.map(v => (
                    <div key={v} className="flex items-center gap-2 mb-1">
                      <span className="text-xs w-12 text-right font-semibold">{v} €</span>
                      <Input type="number" min={0} className="w-16 h-7 text-xs" value={form.billetage?.['b' + v] || ''} onChange={e => setForm({ ...form, billetage: { ...form.billetage, ['b' + v]: parseInt(e.target.value) || 0 } })} />
                      <span className="text-xs text-muted-foreground">{((form.billetage?.['b' + v] || 0) * v).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold mb-2">Pièces</p>
                  {PIECES.map(v => {
                    const k = 'p' + String(v).replace('.', '');
                    return (
                      <div key={v} className="flex items-center gap-2 mb-1">
                        <span className="text-xs w-12 text-right font-semibold">{v < 1 ? `${(v * 100).toFixed(0)}c` : `${v} €`}</span>
                        <Input type="number" min={0} className="w-16 h-7 text-xs" value={form.billetage?.[k] || ''} onChange={e => setForm({ ...form, billetage: { ...form.billetage, [k]: parseInt(e.target.value) || 0 } })} />
                        <span className="text-xs text-muted-foreground">{((form.billetage?.[k] || 0) * v).toFixed(2)} €</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 p-2 bg-primary/10 rounded flex items-center justify-between">
                <span className="font-bold text-primary">Total compté : {billetageTotal(form.billetage || {}).toFixed(2)} €</span>
                <Button size="sm" variant="outline" onClick={() => setForm({ ...form, reel: billetageTotal(form.billetage || {}).toFixed(2) })}>↓ Reporter</Button>
              </div>
            </div>

            {/* Journal de caisse */}
            <div className={`p-3 rounded-lg border ${form.journalCaisse === false ? 'border-destructive bg-destructive/10' : form.journalCaisse === true ? 'border-green-500 bg-green-50' : 'border-border'}`}>
              <p className="text-xs font-bold mb-2">Journal de caisse — Vérification réglementaire</p>
              <p className="text-xs text-muted-foreground mb-2">Réf.: Décret 2012-1246, art. 18 — M9.6</p>
              <div className="flex gap-2">
                <Button size="sm" variant={form.journalCaisse === true ? 'default' : 'outline'} onClick={() => setForm({ ...form, journalCaisse: true })}>✓ Présent</Button>
                <Button size="sm" variant={form.journalCaisse === false ? 'destructive' : 'outline'} onClick={() => setForm({ ...form, journalCaisse: false })}>✗ Absent</Button>
              </div>
              {form.journalCaisse === false && <p className="text-xs text-destructive mt-2 font-bold">ANOMALIE MAJEURE — Absence de journal de caisse.</p>}
            </div>

            <Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Observations..." rows={2} />
            <div className="flex gap-2">
              <Button onClick={submit}>Valider</Button>
              <Button variant="outline" onClick={() => setForm(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun contrôle. Cliquez « Nouveau contrôle ».</CardContent></Card>}

      {items.map(x => (
        <Card key={x.id} className={x.ecart !== 0 ? 'border-destructive' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div><span className="font-bold">{fmtDate(x.date)}</span> — {x.regisseur} <Badge variant={x.statut === 'Conforme' ? 'secondary' : 'destructive'} className="ml-2">{x.statut}</Badge></div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setForm({ ...x, plafond: String(x.plafond), theorique: String(x.theorique), reel: String(x.reel) })}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Théorique</span><p className="font-mono font-bold">{fmt(x.theorique)}</p></div>
              <div><span className="text-muted-foreground text-xs">Réel</span><p className="font-mono font-bold">{fmt(x.reel)}</p></div>
              <div><span className="text-muted-foreground text-xs">Écart</span><p className={`font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(x.ecart)}</p></div>
              <div><span className="text-muted-foreground text-xs">Journal</span><p className="font-bold">{x.journalCaisse === true ? '✓' : x.journalCaisse === false ? '✗ ABSENT' : '—'}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Caisse" description="M9-6 § 3.2.1 — Art. 18 GBCP" badge={`${(CONTROLES_CAISSE).filter(c => regChecks[c.id]).length}/${(CONTROLES_CAISSE).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_CAISSE.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Dashboard.tsx

```tsx
import { SECTIONS } from '@/lib/audit-modules';
import { ICON_MAP } from '@/lib/icon-map';
import { useAuditProgress } from '@/hooks/useAuditProgress';
import { useModules } from '@/hooks/useModules';
import { useAuditParams } from '@/hooks/useAuditStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavLink } from '@/components/NavLink';
import { CartoRisque, getSelectedEtablissement, getAgenceComptable } from '@/lib/types';
import { loadState } from '@/lib/store';
import {
  FileText, Shield, ChevronRight,
  Users, Activity, ShieldCheck, TrendingDown, AlertTriangle, Building2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CalendrierAlertesWidget } from '@/components/CalendrierAlertesWidget';
import { CockpitIntelligent } from '@/components/CockpitIntelligent';
import { AlertesConsolidees } from '@/components/AlertesConsolidees';
import { ParcoursProgress } from '@/components/ParcoursProgress';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { CockpitMaturiteCICF } from '@/components/CockpitMaturiteCICF';

import heroImg from '@/assets/hero-audit.png';
import sectionControles from '@/assets/section-controles.png';
import sectionVerification from '@/assets/section-verification.png';
import sectionComptable from '@/assets/section-comptable.png';
import sectionFinances from '@/assets/section-finances.png';
import sectionControleInterne from '@/assets/section-controle-interne.png';
import sectionRestitution from '@/assets/section-restitution.png';

// Module images
import modRegies from '@/assets/mod-regies.png';
import modStocks from '@/assets/mod-stocks.png';
import modRapprochement from '@/assets/mod-rapprochement.png';
import modVerification from '@/assets/mod-verification.png';
import modOrdonnateur from '@/assets/mod-ordonnateur.png';
import modDroitsConstates from '@/assets/mod-droits-constates.png';
import modDepenses from '@/assets/mod-depenses.png';
import modVoyages from '@/assets/mod-voyages.png';
import modRestauration from '@/assets/mod-restauration.png';
import modAnalyseFinanciere from '@/assets/mod-analyse-financiere.png';
import modFondsRoulement from '@/assets/mod-fonds-roulement.png';
import modRecouvrement from '@/assets/mod-recouvrement.png';
import modMarches from '@/assets/mod-marches.png';
import modSubventions from '@/assets/mod-subventions.png';
import modBudgetsAnnexes from '@/assets/mod-budgets-annexes.png';
import modCartographie from '@/assets/mod-cartographie.png';
import modOrganigramme from '@/assets/mod-organigramme.png';
import modPlanAction from '@/assets/mod-plan-action.png';
import modPlanControle from '@/assets/mod-plan-controle.png';
import modPvAudit from '@/assets/mod-pv-audit.png';
import modAnnexeComptable from '@/assets/mod-annexe-comptable.png';
import modPisteAudit from '@/assets/mod-piste-audit.png';
import modParametres from '@/assets/mod-parametres.png';

const MODULE_IMAGES: Record<string, string> = {
  regies: modRegies, stocks: modStocks, rapprochement: modRapprochement,
  verification: modVerification, ordonnateur: modOrdonnateur,
  'droits-constates': modDroitsConstates, depenses: modDepenses,
  voyages: modVoyages, restauration: modRestauration,
  'analyse-financiere': modAnalyseFinanciere, 'fonds-roulement': modFondsRoulement,
  recouvrement: modRecouvrement, marches: modMarches, subventions: modSubventions,
  'budgets-annexes': modBudgetsAnnexes, cartographie: modCartographie,
  organigramme: modOrganigramme, 'plan-action': modPlanAction,
  'plan-controle': modPlanControle, 'pv-audit': modPvAudit,
  'annexe-comptable': modAnnexeComptable, 'piste-audit': modPisteAudit,
  parametres: modParametres,
};

const RISK_COLORS = ['hsl(0, 72%, 51%)', 'hsl(25, 95%, 53%)', 'hsl(45, 93%, 47%)', 'hsl(142, 71%, 45%)'];

const SECTION_CONFIG: Record<string, { color: string; bgClass: string; image: string; borderColor: string }> = {
  'CONTRÔLES SUR PLACE': {
    color: 'text-section-controles',
    bgClass: 'from-[#3B82F6] to-[#60A5FA]',
    borderColor: 'border-l-[#3B82F6]',
    image: sectionControles,
  },
  'VÉRIFICATION & ORDONNATEUR': {
    color: 'text-section-verification',
    bgClass: 'from-[#2D8C5A] to-[#3DA96E]',
    borderColor: 'border-l-[#2D8C5A]',
    image: sectionVerification,
  },
  'GESTION COMPTABLE': {
    color: 'text-section-comptable',
    bgClass: 'from-[#7C4DDB] to-[#9B6FE8]',
    borderColor: 'border-l-[#7C4DDB]',
    image: sectionComptable,
  },
  'FINANCES & BUDGET': {
    color: 'text-section-finances',
    bgClass: 'from-[#D4920A] to-[#E5A832]',
    borderColor: 'border-l-[#D4920A]',
    image: sectionFinances,
  },
  'CONTRÔLE INTERNE': {
    color: 'text-section-controle-interne',
    bgClass: 'from-[#168F75] to-[#20B090]',
    borderColor: 'border-l-[#168F75]',
    image: sectionControleInterne,
  },
  'AUDIT & RESTITUTION': {
    color: 'text-section-restitution',
    bgClass: 'from-[#2B4C8C] to-[#3D66B0]',
    borderColor: 'border-l-[#2B4C8C]',
    image: sectionRestitution,
  },
};

function KpiCard({ icon: Icon, label, value, sublabel, delay }: {
  icon: React.ElementType; label: string; value: string | number; sublabel?: string; delay: number;
}) {
  return (
    <Card
      className="shadow-card hover:shadow-card-hover transition-all duration-300 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
          {sublabel && <p className="text-[10px] text-muted-foreground/70 truncate">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [modules, updateModules] = useModules();
  const { params } = useAuditParams();
  const currentEtab = getSelectedEtablissement(params);
  const agence = getAgenceComptable(params);
  const auditProgress = useAuditProgress();
  const allNonParam = modules.filter(m => m.id !== 'parametres');
  const enabledOnly = allNonParam.filter(m => m.enabled);
  const displayModules = allNonParam;

  const risques: CartoRisque[] = loadState('cartographie', []);

  const riskDistrib = risques.reduce((acc, r) => {
    const n = r.probabilite * r.impact * r.maitrise;
    if (n >= 40) acc[0].value++;
    else if (n >= 20) acc[1].value++;
    else if (n >= 10) acc[2].value++;
    else acc[3].value++;
    return acc;
  }, [
    { name: 'Critique', value: 0 },
    { name: 'Majeur', value: 0 },
    { name: 'Moyen', value: 0 },
    { name: 'Faible', value: 0 },
  ]);

  const criticalCount = riskDistrib[0].value + riskDistrib[1].value;

  const processByRisk = Object.entries(
    risques.reduce<Record<string, number>>((acc, r) => {
      acc[r.processus] = (acc[r.processus] || 0) + r.probabilite * r.impact * r.maitrise;
      return acc;
    }, {})
  ).map(([name, score]) => ({ name: name.length > 15 ? name.substring(0, 15) + '…' : name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-2xl overflow-hidden gradient-hero shadow-elevated opacity-0 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/30" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img src={heroImg} alt="" className="h-full w-full object-cover object-left opacity-20 mix-blend-luminosity" />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-foreground/60 text-xs font-semibold tracking-widest uppercase mb-1">
                Tableau de bord
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
                {agence ? agence.nom : 'Audit comptable EPLE'}
              </h1>
              {currentEtab && (
                <p className="text-primary-foreground/70 mt-1 text-sm">
                  {currentEtab.nom} ({currentEtab.uai}) — Exercice {params.exercice}
                </p>
              )}
              {!currentEtab && (
                <p className="text-primary-foreground/70 mt-1 text-sm">
                  Commencez par renseigner les{' '}
                  <NavLink to="/parametres" className="underline text-primary-foreground hover:text-primary-foreground/90">
                    paramètres de l'audit
                  </NavLink>.
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground text-xs">
                <Shield className="h-3 w-3 mr-1" />
                v7.0
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ✨ COCKPIT MATURITÉ CICF — score, KPI animés, radar, export PDF ─── */}
      <CockpitMaturiteCICF />

      {/* ─── 📚 DOCTRINE EPLE — pilotage CICF, cadre M9-6 / GBCP ─── */}
      <DoctrineEPLE
        theme="cockpit"
        titre="Pilotage du contrôle interne — Tableau de bord AC"
        resume="Cockpit centralisé : score conformité, alertes cross-modules, risques critiques, plan de contrôle."
      />

      {/* ─── 🚀 COCKPIT INTELLIGENT — Score conformité + Top alertes cross-modules ─── */}
      <CockpitIntelligent />

      {/* ─── 🧭 PROGRESSION DU PARCOURS — frise des 7 étapes + bouton Continuer ─── */}
      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '90ms' }}>
        <ParcoursProgress />
      </div>

      {/* ─── 🚨 CENTRE D'ALERTES CONSOLIDÉES — anomalies critiques tous modules ─── */}
      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '120ms' }}>
        <AlertesConsolidees />
      </div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard icon={ShieldCheck} label="Score global" value={auditProgress.totalItems > 0 ? auditProgress.percentage + '%' : '—'} sublabel={auditProgress.totalItems > 0 ? `${auditProgress.totalChecked}/${auditProgress.totalItems} contrôles` : 'conformité audit'} delay={0} />
        <KpiCard icon={Activity} label="Modules actifs" value={enabledOnly.length} sublabel={`sur ${allNonParam.length} disponibles`} delay={50} />
        <KpiCard icon={AlertTriangle} label="Risques identifiés" value={risques.length} sublabel={criticalCount > 0 ? `${criticalCount} critique(s)` : undefined} delay={100} />
        <KpiCard icon={Users} label="Auditeurs" value={params.equipe.filter(m => m.isAuditeur).length} sublabel={params.equipe.length > 0 ? `${params.equipe.length} dans l'équipe` : undefined} delay={150} />
        <KpiCard icon={Building2} label="Établissements" value={params.etablissements.length} sublabel={currentEtab ? currentEtab.ville : undefined} delay={200} />
      </div>

      {/* ─── Calendrier annuel : alertes AC ─── */}
      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '230ms' }}>
        <CalendrierAlertesWidget />
      </div>

      {/* ─── Risk Charts ─── */}
      {risques.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Répartition des risques
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={riskDistrib.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} strokeWidth={2} label={({ name, value }) => `${name}: ${value}`}>
                    {riskDistrib.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Score de risque par processus
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={processByRisk} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {processByRisk.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 40 ? RISK_COLORS[0] : entry.score >= 20 ? RISK_COLORS[1] : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Section Progress ─── */}
      {auditProgress.totalItems > 0 && (
        <Card className="shadow-card opacity-0 animate-fade-in" style={{ animationDelay: '280ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Progression par section
              <Badge variant="secondary" className="ml-auto text-[10px]">{auditProgress.percentage}% global</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SECTIONS.map(section => {
              const sp = auditProgress.sections[section];
              if (!sp || sp.total === 0) return null;
              const config = SECTION_CONFIG[section];
              const sectionColor = config?.bgClass?.match(/#[0-9A-Fa-f]{6}/)?.[0] || 'hsl(var(--primary))';
              return (
                <div key={section} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground w-[140px] truncate">{section}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sp.percentage}%`, background: sectionColor }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground w-[36px] text-right">{sp.percentage}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ─── Module Sections ─── */}
      <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Modules d'audit</h2>
          {enabledOnly.length < allNonParam.length && (
            <Badge variant="secondary" className="text-[10px]">
              {enabledOnly.length}/{allNonParam.length} dans le périmètre
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SECTIONS.map(section => {
            const sectionModules = displayModules.filter(m => m.section === section);
            if (sectionModules.length === 0) return null;
            const config = SECTION_CONFIG[section];
            const enabledInSection = sectionModules.filter(m => m.enabled).length;

            return (
              <Card key={section} className="shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group border-l-4" style={{ borderLeftColor: config.bgClass.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#1A56A8' }}>
                {/* Section header */}
                <div className={`bg-gradient-to-r ${config.bgClass} px-4 py-3 flex flex-col gap-2`}>
                  <div className="flex items-center gap-3">
                    <img src={config.image} alt="" className="h-8 w-8 object-contain rounded-md bg-white/20 p-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase truncate">{section}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] shrink-0">
                    {enabledInSection}/{sectionModules.length}
                  </Badge>
                  </div>
                  {auditProgress.sections[section]?.total > 0 && (
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${auditProgress.sections[section].percentage}%` }} />
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="space-y-0.5">
                    {sectionModules.map(mod => {
                      const Icon = ICON_MAP[mod.icon] || FileText;
                      const modImage = MODULE_IMAGES[mod.id];
                      return (
                        <NavLink
                          key={mod.id}
                          to={mod.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group/item ${!mod.enabled ? 'opacity-40' : ''}`}
                          activeClassName="bg-primary/8"
                        >
                          {modImage ? (
                            <img src={modImage} alt="" className="h-7 w-7 object-contain rounded flex-shrink-0" />
                          ) : (
                            <Icon className={`h-4 w-4 ${config.color} flex-shrink-0`} />
                          )}
                          <span className="text-sm font-medium flex-1 text-foreground truncate">{mod.label}</span>
                          {mod.enabled && (
                            <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </NavLink>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ─── Team ─── */}
      {params.equipe.filter(m => m.isAuditeur).length > 0 && (
        <Card className="shadow-card opacity-0 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Auditeurs désignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {params.equipe.filter(m => m.isAuditeur).map(m => (
                <Badge key={m.id} variant="secondary" className="text-xs px-3 py-1.5">
                  {m.prenom} {m.nom} — {m.fonction}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

```

### FICHIER : src/pages/Depenses.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, ModuleSection, ComplianceCheck, AnomalyAlert } from '@/components/ModulePageLayout';
import { MOTIFS_SUSPENSION_GBCP, CONTROLES_AGENT_COMPTABLE, PIECES_JUSTIFICATIVES_DEPENSES, SEUILS_MARCHES_2026 } from '@/lib/regulatory-data';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

export default function DepensesPage() {
  const [suspensions, setSuspensions] = useState<Record<string, boolean>>(() => loadState('depenses_suspensions_v2', {}));
  const [controles, setControles] = useState<Record<string, boolean>>(() => loadState('depenses_controles_ac', {}));
  const [pieces, setPieces] = useState<Record<string, boolean>>(() => loadState('depenses_pieces_v2', {}));
  const [montantMandat, setMontantMandat] = useState<string>(() => loadState('depenses_montant', ''));
  const [observations, setObservations] = useState<string>(() => loadState('depenses_obs', ''));

  const toggleSuspension = (idx: number) => {
    const updated = { ...suspensions, [idx]: !suspensions[idx] };
    setSuspensions(updated); saveState('depenses_suspensions_v2', updated);
  };
  const toggleControle = (id: string) => {
    const updated = { ...controles, [id]: !controles[id] };
    setControles(updated); saveState('depenses_controles_ac', updated);
  };
  const togglePiece = (id: string) => {
    const updated = { ...pieces, [id]: !pieces[id] };
    setPieces(updated); saveState('depenses_pieces_v2', updated);
  };

  const montant = parseFloat(montantMandat) || 0;
  const seuilAtteint = SEUILS_MARCHES_2026.filter(s => montant >= s.seuil).pop();

  const allChecks = [
    ...CONTROLES_AGENT_COMPTABLE.depenses.map(c => controles[c.id]),
    ...PIECES_JUSTIFICATIVES_DEPENSES.map(p => pieces[p.id]),
    ...MOTIFS_SUSPENSION_GBCP.map((_, i) => suspensions[i]),
  ];
  const completed = allChecks.filter(Boolean).length;
  const total = allChecks.length;

  return (
    <ModulePageLayout
      title="Dépenses"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Contrôle de la validité de la liquidation, vérification des pièces justificatives et motifs de suspension du paiement."
      refs={[
        { code: 'Art. 19 GBCP', label: 'Contrôles de l\'agent comptable' },
        { code: 'Art. 38 GBCP', label: 'Motifs de suspension' },
        { code: 'Arrêté 25/07/2013', label: 'Pièces justificatives' },
        { code: 'Décrets 2025', label: 'Seuils commande publique 2026' },
      ]}
      completedChecks={completed}
      totalChecks={total}
    >
      <DoctrineEPLE theme="depenses" titre="Chaîne de la dépense publique" resume="Engagement → liquidation → DP → paiement, PJ, DGP 30 j" />
      {/* ─── Contrôles de l'agent comptable (art. 19 GBCP) ─── */}
      <ModuleSection
        title="Contrôles de l'agent comptable en matière de dépenses"
        description="Article 19 du décret n°2012-1246 du 7 novembre 2012 (GBCP)"
        badge={`${CONTROLES_AGENT_COMPTABLE.depenses.filter(c => controles[c.id]).length}/${CONTROLES_AGENT_COMPTABLE.depenses.length}`}
      >
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_AGENT_COMPTABLE.depenses.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={controles[item.id] || false}
                onChange={() => toggleControle(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Motifs de suspension (art. 38 GBCP) ─── */}
      <ModuleSection
        title="Motifs de suspension du paiement"
        description="Article 38 du décret n°2012-1246 — Les 5 cas de suspension par l'agent comptable"
      >
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {MOTIFS_SUSPENSION_GBCP.map((item, idx) => (
              <ComplianceCheck
                key={idx}
                label={item.motif}
                checked={suspensions[idx] || false}
                onChange={() => toggleSuspension(idx)}
                severity={item.severity}
                detail={`${item.ref} — ${item.detail}`}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Pièces justificatives ─── */}
      <ModuleSection
        title="Vérification des pièces justificatives"
        description="Arrêté du 25 juillet 2013 — Liste des pièces justificatives des dépenses publiques locales"
        badge={`${PIECES_JUSTIFICATIVES_DEPENSES.filter(p => pieces[p.id]).length}/${PIECES_JUSTIFICATIVES_DEPENSES.length}`}
      >
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {PIECES_JUSTIFICATIVES_DEPENSES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={pieces[item.id] || false}
                onChange={() => togglePiece(item.id)}
                severity={item.obligatoire ? 'majeur' : 'normal'}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Seuils commande publique 2026 ─── */}
      <ModuleSection
        title="Contrôle des seuils de commande publique"
        description="Décrets n°2025-1386 et n°2025-1383 du 18 décembre 2025 — Seuils applicables en 2026"
      >
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Montant de la dépense / du marché (€ HT)</Label>
              <Input
                type="number"
                value={montantMandat}
                onChange={e => { setMontantMandat(e.target.value); saveState('depenses_montant', e.target.value); }}
                placeholder="0.00"
                className="max-w-xs"
              />
            </div>
            {seuilAtteint && (
              <div className={`p-4 rounded-lg border ${montant >= 143_000 ? 'bg-destructive/10 border-destructive' : montant >= 90_000 ? 'bg-orange-50 border-orange-400 dark:bg-orange-950/20' : 'bg-accent/10 border-accent'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <Badge className="text-xs">{seuilAtteint.label}</Badge>
                </div>
                <p className="text-sm">{seuilAtteint.consigne}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">{seuilAtteint.ref}</p>
              </div>
            )}
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
              {SEUILS_MARCHES_2026.map((s, i) => (
                <p key={i} className={montant >= s.seuil ? 'font-bold text-foreground' : ''}>
                  {s.label} : {s.consigne.split('.')[0]}.
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Observations ─── */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-bold">Observations de l'auditeur</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={e => { setObservations(e.target.value); saveState('depenses_obs', e.target.value); }}
            placeholder="Constats sur les dépenses vérifiées, anomalies, recommandations..."
            rows={5}
            className="resize-y"
          />
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/DroitsConstates.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { loadState, saveState } from '@/lib/store';
import { fmt, fmtDate, ECHELONS_BOURSES } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONTROLES_DROITS_CONSTATES } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ TYPES ═══ */
interface EleveVerifie {
  id: string; nom: string; prenom: string; classe: string;
  regime: string; /* internat | demi-pension */
  montantDu: number; montantPaye: number; observations: string;
}

interface BoursierEleve {
  id: string; nom: string; classe: string; echelon: number;
  annuel: number; t1: number; t2: number; t3: number; verse: number;
  reliquat: number; statut: string;
  responsableLegal: string; responsableVerifie: boolean;
}

interface FondSocial {
  id: string; type: string; nom: string; objet: string;
  montant: number; decision: string; dateCommission: string; compte: string;
  // Champs pour le contrôle FSC
  fraisScolaires: number; montantBourse: number;
}

interface PrimeAide {
  id: string; nom: string; type: string; montant: number; dateVersement: string; observations: string;
}

export default function DroitsConstatesPage() {
  // ═══ FRAIS SCOLAIRES ═══
  const [eleves, setEleves] = useState<EleveVerifie[]>(() => loadState('droits_constates_eleves', []));
  const [obsGenerales, setObsGenerales] = useState(() => loadState('droits_constates_obs', ''));

  // ═══ BOURSES ═══
  const [boursiers, setBoursiers] = useState<BoursierEleve[]>(() => loadState('bourses', []));
  const [formBourse, setFormBourse] = useState<any>(null);

  // ═══ FONDS SOCIAUX ═══
  const [fondsSociaux, setFondsSociaux] = useState<FondSocial[]>(() => loadState('fonds_sociaux', []));
  const [formFS, setFormFS] = useState<any>(null);

  // ═══ PRIMES & AUTRES AIDES ═══
  const [primes, setPrimes] = useState<PrimeAide[]>(() => loadState('droits_primes', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('dc_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('dc_checks', u); };
  const [formPrime, setFormPrime] = useState<any>(null);

  const saveEleves = (d: EleveVerifie[]) => { setEleves(d); saveState('droits_constates_eleves', d); };
  const saveBoursiers = (d: BoursierEleve[]) => { setBoursiers(d); saveState('bourses', d); };
  const saveFS = (d: FondSocial[]) => { setFondsSociaux(d); saveState('fonds_sociaux', d); };
  const savePrimes = (d: PrimeAide[]) => { setPrimes(d); saveState('droits_primes', d); };

  const addEleve = () => saveEleves([...eleves, { id: crypto.randomUUID(), nom: '', prenom: '', classe: '', regime: 'demi-pension', montantDu: 0, montantPaye: 0, observations: '' }]);
  const updateEleve = (id: string, partial: Partial<EleveVerifie>) => saveEleves(eleves.map(e => e.id === id ? { ...e, ...partial } : e));

  // ═══ BOURSE SUBMIT ═══
  const submitBourse = () => {
    if (!formBourse || !formBourse.nom) return;
    const ech = parseInt(formBourse.echelon) || 6;
    const ann = ECHELONS_BOURSES[ech] || 0;
    const t1 = parseFloat(formBourse.t1) || 0, t2 = parseFloat(formBourse.t2) || 0, t3 = parseFloat(formBourse.t3) || 0;
    const verse = t1 + t2 + t3;
    const item: BoursierEleve = {
      id: formBourse.id || crypto.randomUUID(), nom: formBourse.nom, classe: formBourse.classe,
      echelon: ech, annuel: ann, t1, t2, t3, verse, reliquat: ann - verse,
      statut: verse >= ann ? 'Soldé' : verse < ann / 3 ? 'Retard versement' : 'En cours',
      responsableLegal: formBourse.responsableLegal || '',
      responsableVerifie: formBourse.responsableVerifie || false,
    };
    if (formBourse.id) saveBoursiers(boursiers.map(i => i.id === formBourse.id ? item : i));
    else saveBoursiers([...boursiers, item]);
    setFormBourse(null);
  };

  // ═══ FONDS SOCIAL SUBMIT avec contrôle FSC ═══
  const submitFS = () => {
    if (!formFS || !formFS.nom) return;
    const montant = parseFloat(formFS.montant) || 0;
    const fraisScolaires = parseFloat(formFS.fraisScolaires) || 0;
    const montantBourse = parseFloat(formFS.montantBourse) || 0;
    const item: FondSocial = {
      id: formFS.id || crypto.randomUUID(), type: formFS.type, nom: formFS.nom,
      objet: formFS.objet, montant, decision: formFS.decision,
      dateCommission: formFS.dateCommission, compte: '6576',
      fraisScolaires, montantBourse,
    };
    if (formFS.id) saveFS(fondsSociaux.map(i => i.id === formFS.id ? item : i));
    else saveFS([...fondsSociaux, item]);
    setFormFS(null);
  };

  const submitPrime = () => {
    if (!formPrime || !formPrime.nom) return;
    const item: PrimeAide = { id: formPrime.id || crypto.randomUUID(), nom: formPrime.nom, type: formPrime.type, montant: parseFloat(formPrime.montant) || 0, dateVersement: formPrime.dateVersement, observations: formPrime.observations };
    if (formPrime.id) savePrimes(primes.map(i => i.id === formPrime.id ? item : i));
    else savePrimes([...primes, item]);
    setFormPrime(null);
  };

  // Détection anomalie FSC : bourse + FSC > frais scolaires → versement interdit
  const checkFSCAnomalie = (fs: FondSocial) => {
    if (fs.type !== 'FSC' || !fs.fraisScolaires) return null;
    const totalAides = fs.montantBourse + fs.montant;
    if (totalAides > fs.fraisScolaires) {
      const excedent = totalAides - fs.fraisScolaires;
      return `⚠️ ANOMALIE (Circ. 2017-122) : L'aide FSC (${fmt(fs.montant)}) + bourse (${fmt(fs.montantBourse)}) = ${fmt(totalAides)}, ce qui dépasse les frais scolaires (${fmt(fs.fraisScolaires)}) de ${fmt(excedent)}. Cela revient à verser ${fmt(excedent)} à la famille, ce qui est interdit.`;
    }
    return null;
  };

  const totBoursesAnnuel = boursiers.reduce((s, x) => s + x.annuel, 0);
  const totBoursesVerse = boursiers.reduce((s, x) => s + x.verse, 0);
  const nbRetard = boursiers.filter(x => x.statut === 'Retard versement').length;
  const nbRespNonVerifie = boursiers.filter(x => !x.responsableVerifie).length;

  return (
    <ModulePageLayout
      title="Droits constatés"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Vérification de la chaîne de constatation des droits : fait générateur, liquidation, émission du titre, notification au débiteur et suivi du recouvrement sous le régime RGP."
      refs={[
        { code: "M9-6 § 4.2", label: "Droits constatés" },
        { code: "Art. 20 GBCP", label: "Recouvrement des recettes" },
        { code: "Ord. 2022-408", label: "RGP" },
        { code: "Art. R.421-58 C.Édu", label: "Recettes de l'EPLE" },
      ]}
      completedChecks={(CONTROLES_DROITS_CONSTATES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_DROITS_CONSTATES).length}
    >
      <DoctrineEPLE theme="droits-constates" titre="Droits constatés & titres de recette" resume="Art. 22-23 GBCP — constatation, liquidation, rattachement à l'exercice" />

      <div>
          <p className="text-sm text-muted-foreground">Droits de l'établissement (frais scolaires) et droits des élèves (bourses, fonds sociaux, primes).</p>
      </div>

      <Tabs defaultValue="frais" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frais">Frais scolaires</TabsTrigger>
          <TabsTrigger value="bourses">Bourses</TabsTrigger>
          <TabsTrigger value="fonds-sociaux">Fonds sociaux</TabsTrigger>
          <TabsTrigger value="primes">Primes & aides</TabsTrigger>
        </TabsList>

        {/* ═══ FRAIS SCOLAIRES ═══ */}
        <TabsContent value="frais" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Frais d'internat et de demi-pension — vérification des droits constatés</p>
            <Button onClick={addEleve}><Plus className="h-4 w-4 mr-2" /> Ajouter un élève</Button>
          </div>

          {eleves.length === 0 && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun élève saisi. Ajoutez les élèves dont vous avez vérifié les droits constatés.</CardContent></Card>}

          {eleves.map(eleve => (
            <Card key={eleve.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1">
                    <div className="space-y-1"><Label className="text-xs">Nom</Label><Input value={eleve.nom} onChange={e => updateEleve(eleve.id, { nom: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Prénom</Label><Input value={eleve.prenom} onChange={e => updateEleve(eleve.id, { prenom: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Classe</Label><Input value={eleve.classe} onChange={e => updateEleve(eleve.id, { classe: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Régime</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={eleve.regime} onChange={e => updateEleve(eleve.id, { regime: e.target.value })}>
                        <option value="demi-pension">Demi-pension</option><option value="internat">Internat</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label className="text-xs">Dû (€)</Label><Input type="number" value={eleve.montantDu || ''} onChange={e => updateEleve(eleve.id, { montantDu: parseFloat(e.target.value) || 0 })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Payé (€)</Label><Input type="number" value={eleve.montantPaye || ''} onChange={e => updateEleve(eleve.id, { montantPaye: parseFloat(e.target.value) || 0 })} /></div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-2" onClick={() => saveEleves(eleves.filter(e => e.id !== eleve.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Input placeholder="Observations" value={eleve.observations} onChange={e => updateEleve(eleve.id, { observations: e.target.value })} />
              </CardContent>
            </Card>
          ))}

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Observations générales</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={obsGenerales} onChange={e => { setObsGenerales(e.target.value); saveState('droits_constates_obs', e.target.value); }} rows={4} placeholder="Observations sur les droits constatés..." />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ BOURSES ═══ */}
        <TabsContent value="bourses" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Réf. : M9-6 § 3.2.7.6.2 — Programme 230 — Barème 2024-2025</p>
            <Button onClick={() => setFormBourse({ nom: '', classe: '', echelon: '6', t1: '', t2: '', t3: '', responsableLegal: '', responsableVerifie: false })}><Plus className="h-4 w-4 mr-2" /> Nouvel élève</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="shadow-card"><CardContent className="p-4"><p className="text-xl font-bold">{fmt(totBoursesAnnuel)}</p><p className="text-xs text-muted-foreground">Total annuel</p></CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4"><p className="text-xl font-bold text-green-600">{fmt(totBoursesVerse)}</p><p className="text-xs text-muted-foreground">Versé</p></CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4"><p className="text-xl font-bold">{fmt(totBoursesAnnuel - totBoursesVerse)}</p><p className="text-xs text-muted-foreground">Reliquat</p></CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4"><p className={`text-xl font-bold ${nbRetard > 0 ? 'text-destructive' : 'text-green-600'}`}>{nbRetard}</p><p className="text-xs text-muted-foreground">Retards</p></CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4"><p className={`text-xl font-bold ${nbRespNonVerifie > 0 ? 'text-orange-500' : 'text-green-600'}`}>{nbRespNonVerifie}</p><p className="text-xs text-muted-foreground">RL non vérifié</p></CardContent></Card>
          </div>

          {nbRespNonVerifie > 0 && (
            <div className="p-3 border border-orange-400 bg-orange-50 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <p className="text-sm text-orange-800"><strong>Contrôle :</strong> {nbRespNonVerifie} boursier(s) dont le responsable légal percevant la bourse n'a pas été vérifié. Il convient de s'assurer que c'est bien le bon responsable légal qui perçoit les bourses.</p>
            </div>
          )}

          {formBourse && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Nom élève</Label><Input value={formBourse.nom} onChange={e => setFormBourse({ ...formBourse, nom: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Classe</Label><Input value={formBourse.classe} onChange={e => setFormBourse({ ...formBourse, classe: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Échelon</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formBourse.echelon} onChange={e => setFormBourse({ ...formBourse, echelon: e.target.value })}>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Éch. {n} — {ECHELONS_BOURSES[n]} €</option>)}
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Versé T1 (€)</Label><Input type="number" value={formBourse.t1} onChange={e => setFormBourse({ ...formBourse, t1: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Versé T2 (€)</Label><Input type="number" value={formBourse.t2} onChange={e => setFormBourse({ ...formBourse, t2: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Versé T3 (€)</Label><Input type="number" value={formBourse.t3} onChange={e => setFormBourse({ ...formBourse, t3: e.target.value })} /></div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Responsable légal percevant la bourse</Label><Input value={formBourse.responsableLegal} onChange={e => setFormBourse({ ...formBourse, responsableLegal: e.target.value })} placeholder="Nom du responsable légal" /></div>
                  <div className={`p-3 rounded-lg border ${formBourse.responsableVerifie ? 'border-green-500 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
                    <p className="text-xs font-bold mb-2">Le bon RL perçoit-il la bourse ?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant={formBourse.responsableVerifie ? 'default' : 'outline'} onClick={() => setFormBourse({ ...formBourse, responsableVerifie: true })}>✓ Vérifié</Button>
                      <Button size="sm" variant={!formBourse.responsableVerifie ? 'secondary' : 'outline'} onClick={() => setFormBourse({ ...formBourse, responsableVerifie: false })}>✗ Non vérifié</Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2"><Button onClick={submitBourse}>Valider</Button><Button variant="outline" onClick={() => setFormBourse(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {boursiers.length === 0 && !formBourse && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun boursier enregistré.</CardContent></Card>}
          {boursiers.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Élève</th><th className="p-2">Classe</th><th className="p-2">Éch.</th><th className="text-right p-2">Annuel</th><th className="text-right p-2">Versé</th><th className="text-right p-2">Reliquat</th><th className="p-2">RL</th><th className="p-2">Statut</th><th></th></tr></thead>
                <tbody>{boursiers.map(x => (
                  <tr key={x.id} className={`border-b ${x.statut === 'Retard versement' ? 'bg-destructive/5' : ''}`}>
                    <td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.classe}</td><td className="p-2 text-center">{x.echelon}</td>
                    <td className="p-2 text-right font-mono">{fmt(x.annuel)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.verse)}</td>
                    <td className={`p-2 text-right font-mono font-bold ${x.reliquat > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(x.reliquat)}</td>
                    <td className="p-2 text-center">{x.responsableVerifie ? '✓' : <span className="text-orange-500 font-bold">?</span>}</td>
                    <td className="p-2"><Badge variant={x.statut === 'Soldé' ? 'secondary' : x.statut === 'Retard versement' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                    <td className="p-2"><div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormBourse({ ...x, echelon: String(x.echelon), t1: String(x.t1), t2: String(x.t2), t3: String(x.t3) })}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveBoursiers(boursiers.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ FONDS SOCIAUX ═══ */}
        <TabsContent value="fonds-sociaux" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Réf. : Circ. 2017-122 — Programme 230 — Comptes 6576/7411</p>
            <Button onClick={() => setFormFS({ type: 'FSC', nom: '', objet: '', montant: '', decision: 'Accordé', dateCommission: new Date().toISOString().split('T')[0], fraisScolaires: '', montantBourse: '' })}><Plus className="h-4 w-4 mr-2" /> Nouvelle aide</Button>
          </div>

          <div className="p-3 border border-primary/30 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium">🔍 <strong>Contrôle spécifique FSC :</strong> Pour chaque aide du Fonds Social des Cantines, l'application vérifie que le cumul bourse + FSC ne dépasse pas les frais scolaires de l'élève, conformément à la circulaire 2017-122. Un dépassement reviendrait à verser de l'argent à la famille, ce qui est interdit.</p>
          </div>

          {formFS && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formFS.type} onChange={e => setFormFS({ ...formFS, type: e.target.value })}>
                      <option value="FSL">Fonds Social Lycéen</option><option value="FSC">Fonds Social Cantine</option><option value="FS">Fonds Social Collégien</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Bénéficiaire</Label><Input value={formFS.nom} onChange={e => setFormFS({ ...formFS, nom: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={formFS.objet} onChange={e => setFormFS({ ...formFS, objet: e.target.value })} placeholder="Fournitures, Cantine..." /></div>
                  <div className="space-y-1"><Label className="text-xs">Montant aide (€)</Label><Input type="number" value={formFS.montant} onChange={e => setFormFS({ ...formFS, montant: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Décision</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formFS.decision} onChange={e => setFormFS({ ...formFS, decision: e.target.value })}>
                      <option>Accordé</option><option>Refusé</option><option>En attente</option><option>Accord partiel</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Date commission</Label><Input type="date" value={formFS.dateCommission} onChange={e => setFormFS({ ...formFS, dateCommission: e.target.value })} /></div>
                </div>

                {formFS.type === 'FSC' && (
                  <>
                    <Separator />
                    <p className="text-xs font-bold text-primary">Contrôle FSC — Circ. 2017-122</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Frais scolaires de l'élève (€)</Label><Input type="number" value={formFS.fraisScolaires} onChange={e => setFormFS({ ...formFS, fraisScolaires: e.target.value })} placeholder="Ex: 100" /></div>
                      <div className="space-y-1"><Label className="text-xs">Montant bourse nationale (€)</Label><Input type="number" value={formFS.montantBourse} onChange={e => setFormFS({ ...formFS, montantBourse: e.target.value })} placeholder="Ex: 80" /></div>
                    </div>
                    {(() => {
                      const frais = parseFloat(formFS.fraisScolaires) || 0;
                      const bourse = parseFloat(formFS.montantBourse) || 0;
                      const aide = parseFloat(formFS.montant) || 0;
                      if (frais > 0 && (bourse + aide) > frais) {
                        const excedent = bourse + aide - frais;
                        return (
                          <div className="p-3 border border-destructive bg-destructive/10 rounded-lg">
                            <p className="text-sm text-destructive font-bold">⚠️ ANOMALIE : Bourse ({fmt(bourse)}) + FSC ({fmt(aide)}) = {fmt(bourse + aide)} &gt; Frais scolaires ({fmt(frais)})</p>
                            <p className="text-xs text-destructive mt-1">Cela revient à verser {fmt(excedent)} à la famille, ce qui est interdit par la circulaire 2017-122.</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}

                <div className="flex gap-2"><Button onClick={submitFS}>Valider</Button><Button variant="outline" onClick={() => setFormFS(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {fondsSociaux.length === 0 && !formFS && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucune aide enregistrée.</CardContent></Card>}
          {fondsSociaux.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">Type</th><th className="text-left p-2">Bénéficiaire</th><th className="p-2">Objet</th><th className="text-right p-2">Montant</th><th className="p-2">Décision</th><th className="p-2">Alerte</th><th></th></tr></thead>
                <tbody>{fondsSociaux.map(x => {
                  const anomalie = checkFSCAnomalie(x);
                  return (
                    <tr key={x.id} className={`border-b ${anomalie ? 'bg-destructive/5' : ''}`}>
                      <td className="p-2"><Badge>{x.type}</Badge></td><td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.objet}</td>
                      <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                      <td className="p-2"><Badge variant={x.decision === 'Accordé' ? 'secondary' : x.decision === 'Refusé' ? 'destructive' : 'default'}>{x.decision}</Badge></td>
                      <td className="p-2">{anomalie ? <AlertTriangle className="h-4 w-4 text-destructive" /> : '✓'}</td>
                      <td className="p-2"><div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormFS({ ...x, montant: String(x.montant), fraisScolaires: String(x.fraisScolaires || ''), montantBourse: String(x.montantBourse || '') })}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveFS(fondsSociaux.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ PRIMES & AIDES ═══ */}
        <TabsContent value="primes" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Primes, aides diverses, gratifications — droits des élèves</p>
            <Button onClick={() => setFormPrime({ nom: '', type: 'Prime d\'équipement', montant: '', dateVersement: '', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </div>

          {formPrime && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Bénéficiaire</Label><Input value={formPrime.nom} onChange={e => setFormPrime({ ...formPrime, nom: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formPrime.type} onChange={e => setFormPrime({ ...formPrime, type: e.target.value })}>
                      <option>Prime d'équipement</option><option>Prime d'internat</option><option>Bourse au mérite</option><option>Allocation rentrée</option><option>Autre aide</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={formPrime.montant} onChange={e => setFormPrime({ ...formPrime, montant: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Date versement</Label><Input type="date" value={formPrime.dateVersement} onChange={e => setFormPrime({ ...formPrime, dateVersement: e.target.value })} /></div>
                </div>
                <Input placeholder="Observations" value={formPrime.observations} onChange={e => setFormPrime({ ...formPrime, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitPrime}>Valider</Button><Button variant="outline" onClick={() => setFormPrime(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {primes.length === 0 && !formPrime && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucune prime ou aide enregistrée.</CardContent></Card>}
          {primes.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Bénéficiaire</th><th className="p-2">Type</th><th className="text-right p-2">Montant</th><th className="p-2">Date</th><th className="text-left p-2">Observations</th><th></th></tr></thead>
                <tbody>{primes.map(x => (
                  <tr key={x.id} className="border-b">
                    <td className="p-2 font-bold">{x.nom}</td><td className="p-2"><Badge>{x.type}</Badge></td>
                    <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                    <td className="p-2 text-xs">{fmtDate(x.dateVersement)}</td><td className="p-2 text-xs">{x.observations}</td>
                    <td className="p-2"><div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormPrime({ ...x, montant: String(x.montant) })}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => savePrimes(primes.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Droits constatés" description="M9-6 § 4.2 — Art. 20 GBCP — RGP" badge={`${(CONTROLES_DROITS_CONSTATES).filter(c => regChecks[c.id]).length}/${(CONTROLES_DROITS_CONSTATES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_DROITS_CONSTATES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/FondsRoulement.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { loadState, saveState } from '@/lib/store';
import { fmt } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CONTROLES_FDR } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { FondsRoulementModule } from '@/components/FondsRoulementModule';

const COLORS_CHART = {
  green: 'hsl(152, 60%, 40%)',
  red: 'hsl(0, 72%, 51%)',
  orange: 'hsl(25, 95%, 53%)',
  primary: 'hsl(220, 65%, 38%)',
  purple: 'hsl(270, 50%, 50%)',
};

interface PrelevementDetail {
  id: string; objet: string; montant: number; voteCA: string; dateCA: string;
}

export default function FondsRoulementPage() {
  const [data, setData] = useState(() => loadState('fdr_data_v2', {
    // A — FDR Comptable
    fdrComptable: '',
    // 1 — Provisions et dépréciations (comptes 15,29,39,49,59)
    provisions: '',
    // 2 — Dépôts et cautions reçus (165)
    depotsCautions: '',
    // 3 — Stocks
    stocks: '',
    // 4 — Créances douteuses (416)
    creancesDouteuses: '',
    // 5 — Créances > 1 an non provisionnées
    creancesLongues: '',
    // 6 — Réserve de fonctionnement nécessaire (BFR)
    reserveFonctionnement: '',
    // 7 — Prélèvements FDR votés au BP ou DBM
    prelevementsVotes: '',
    // C — Charges décaissables (comptes 60 à 65 hors 658)
    chargesDecaissables: '',
    // Prélèvement envisagé
    prelevementEnvisage: '',
    motifPrelevement: '',
    // Observations
    obsOrdonnateur: '',
    avisAgentComptable: '',
    dateCA: '',
    obs: '',
  }));

  const [prelevements, setPrelevements] = useState<PrelevementDetail[]>(() => loadState('fdr_prelevements', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('fdr_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('fdr_checks', u); };
  const [formPrel, setFormPrel] = useState<any>(null);

  const update = (k: string, v: string) => { const n = { ...data, [k]: v }; setData(n); saveState('fdr_data_v2', n); };
  const savePrel = (d: PrelevementDetail[]) => { setPrelevements(d); saveState('fdr_prelevements', d); };

  const submitPrel = () => {
    if (!formPrel) return;
    const item: PrelevementDetail = { id: formPrel.id || crypto.randomUUID(), objet: formPrel.objet, montant: parseFloat(formPrel.montant) || 0, voteCA: formPrel.voteCA, dateCA: formPrel.dateCA };
    if (formPrel.id) savePrel(prelevements.map(i => i.id === formPrel.id ? item : i));
    else savePrel([...prelevements, item]);
    setFormPrel(null);
  };

  // Calculs FDRM
  const A = parseFloat(data.fdrComptable) || 0;
  const v1 = parseFloat(data.provisions) || 0;
  const v2 = parseFloat(data.depotsCautions) || 0;
  const v3 = parseFloat(data.stocks) || 0;
  const v4 = parseFloat(data.creancesDouteuses) || 0;
  const v5 = parseFloat(data.creancesLongues) || 0;
  const v6 = parseFloat(data.reserveFonctionnement) || 0;
  const v7 = parseFloat(data.prelevementsVotes) || 0;

  // B = A - 1 - 2 - 3 - 4 - 5 - 6 - 7
  const B = A - v1 - v2 - v3 - v4 - v5 - v6 - v7;

  // C = charges décaissables / 360
  const chargesTotal = parseFloat(data.chargesDecaissables) || 0;
  const C = chargesTotal > 0 ? chargesTotal / 360 : 0;

  // Jours de fonctionnement
  const joursDisponibles = C > 0 ? Math.round(B / C) : 0;

  // Prélèvement
  const prel = parseFloat(data.prelevementEnvisage) || 0;
  const totalPrelDetails = prelevements.reduce((s, p) => s + p.montant, 0);
  const BApres = B - prel;
  const joursApres = C > 0 ? Math.round(BApres / C) : 0;

  // Seuil critique : 30 jours
  const seuilCritique = C * 30;
  const margePrelevement = B - seuilCritique;

  const avis = useMemo(() => {
    if (!A || !chargesTotal) return null;
    if (joursApres < 30) return { type: 'critique', text: `AVIS DÉFAVORABLE — Le fonds de roulement disponible résiduel (${joursApres} jours) est inférieur au seuil critique de 30 jours. L'établissement risque de ne pas pouvoir faire face à ses charges courantes. Il est recommandé de ne pas procéder au prélèvement ou de le réduire significativement.` };
    if (joursApres < 60) return { type: 'vigilance', text: `AVIS RÉSERVÉ — Le fonds de roulement disponible après prélèvement (${joursApres} jours) est en zone de vigilance. L'établissement dispose d'une marge de sécurité limitée. Un suivi renforcé de la trésorerie est conseillé.` };
    if (joursApres < 90) return { type: 'acceptable', text: `AVIS FAVORABLE SOUS RÉSERVE — Le fonds de roulement disponible après prélèvement (${joursApres} jours) reste acceptable. L'établissement conserve une capacité d'autofinancement suffisante mais la vigilance reste de mise.` };
    return { type: 'confortable', text: `AVIS FAVORABLE — Le fonds de roulement disponible après prélèvement (${joursApres} jours) est confortable. L'établissement dispose d'une réserve financière importante permettant de faire face aux imprévus.` };
  }, [A, chargesTotal, joursApres]);

  const pieData = prel > 0 ? [
    { name: 'Prélevé', value: prel },
    { name: 'FDR résiduel', value: Math.max(0, BApres) },
  ] : [];

  const barData = [
    { name: 'FDR comptable (A)', montant: A },
    { name: 'FDR disponible (B)', montant: B },
    { name: 'FDR après prélèvement', montant: BApres },
    { name: 'Seuil critique (30j)', montant: seuilCritique },
  ];

  return (
    <ModulePageLayout
      title="Fonds de roulement"
      section="FINANCES & BUDGET"
      description="Analyse du fonds de roulement disponible selon la méthodologie IGAENR 2016-071 (rapport n°2016-071). Note méthodologique : cette page utilise le diviseur C/360 (charges décaissables annuelles / 360 jours) conformément au rapport IGAENR, ce qui est distinct de la méthode M9-6 § 4.5.3 utilisée dans le module Analyse financière (DRFN/365). Les deux méthodes coexistent légitimement : la première sert à évaluer le prélèvement sur FDR, la seconde à produire les indicateurs du compte financier."
      refs={[
        { code: "M9-6 § 4.5.3.1", label: "Fonds de roulement" },
        { code: "M9-6 § 4.5.3", label: "Indicateurs financiers" },
        { code: "DRFN", label: "Dénominateur des jours de FDR" },
      ]}
      completedChecks={(CONTROLES_FDR).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_FDR).length}
    >
      <DoctrineEPLE theme="fonds-roulement" titre="Fonds de roulement (FDR)" resume="M9-6 § 4.5.3 — seuil prudentiel ≥ 30 jours de DRFN" />

      {/* ─── Module enrichi : import balance, double camembert, feu tricolore, avis motivé auto ─── */}
      <ModuleSection title="Analyse automatisée depuis la balance Op@le" description="Auto-remplissage des agrégats M9-6, simulateur de prélèvement, double camembert avant/après PFR, avis motivé auto-généré, exports PDF / Word.">
        <FondsRoulementModule />
      </ModuleSection>

      {/* ─── Saisie manuelle classique (méthode IGAENR 2016-071) ─── */}

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-xs">Date du Conseil d'Administration</Label><Input type="date" value={data.dateCA} onChange={e => update('dateCA', e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Motif du prélèvement</Label><Input value={data.motifPrelevement} onChange={e => update('motifPrelevement', e.target.value)} placeholder="Ex: Acquisition matériel pédagogique, travaux..." /></div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau FDRM conforme au rapport IGAENR */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Éléments de calcul — Rapport IGAENR 2016-071</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2 text-left border text-xs w-8">#</th>
                  <th className="p-2 text-left border text-xs">Éléments de calcul</th>
                  <th className="p-2 text-left border text-xs">Comptes</th>
                  <th className="p-2 text-right border text-xs w-40">Montant (€)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-primary/5 font-bold">
                  <td className="p-2 border">A</td>
                  <td className="p-2 border">FONDS DE ROULEMENT COMPTABLE</td>
                  <td className="p-2 border text-xs text-muted-foreground">Arrêté à la clôture de l'exercice précédent</td>
                  <td className="p-2 border"><Input type="number" className="text-right font-bold" value={data.fdrComptable} onChange={e => update('fdrComptable', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">1</td>
                  <td className="p-2 border">FDR lié à des dépenses futures, probables ou certaines</td>
                  <td className="p-2 border text-xs text-muted-foreground">Provisions et dépréciations : 15, 29, 39, 49, 59</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.provisions} onChange={e => update('provisions', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">2</td>
                  <td className="p-2 border">Dépôts et cautions reçus</td>
                  <td className="p-2 border text-xs text-muted-foreground">Compte 165</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.depotsCautions} onChange={e => update('depotsCautions', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">3</td>
                  <td className="p-2 border">FDR affecté à des activités particulières</td>
                  <td className="p-2 border text-xs text-muted-foreground">Stocks</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.stocks} onChange={e => update('stocks', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">4</td>
                  <td className="p-2 border">Créances douteuses</td>
                  <td className="p-2 border text-xs text-muted-foreground">Compte 416</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.creancesDouteuses} onChange={e => update('creancesDouteuses', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">5</td>
                  <td className="p-2 border">Créances supérieures à 1 an non provisionnées</td>
                  <td className="p-2 border text-xs text-muted-foreground"></td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.creancesLongues} onChange={e => update('creancesLongues', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">6</td>
                  <td className="p-2 border">Réserve de fonctionnement nécessaire à l'activité</td>
                  <td className="p-2 border text-xs text-muted-foreground">BFR</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.reserveFonctionnement} onChange={e => update('reserveFonctionnement', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">7</td>
                  <td className="p-2 border">Part du FDR déjà mobilisée</td>
                  <td className="p-2 border text-xs text-muted-foreground">Prélèvements sur FDR votés au BP ou DBM</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.prelevementsVotes} onChange={e => update('prelevementsVotes', e.target.value)} /></td>
                </tr>
                <tr className="bg-primary/10 font-bold">
                  <td className="p-2 border">B</td>
                  <td className="p-2 border">FONDS DE ROULEMENT DISPONIBLE (= A − 1 − 2 − 3 − 4 − 5 − 6 − 7)</td>
                  <td className="p-2 border"></td>
                  <td className="p-2 border text-right"><span className={B >= 0 ? 'text-green-700' : 'text-destructive'}>{fmt(B)}</span></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="p-2 border">C</td>
                  <td className="p-2 border">Charges décaissables annuelles</td>
                  <td className="p-2 border text-xs text-muted-foreground">Comptes 60 à 65 hors 658</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.chargesDecaissables} onChange={e => update('chargesDecaissables', e.target.value)} /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="p-2 border"></td>
                  <td className="p-2 border">Montant d'une journée de fonctionnement (C/360)</td>
                  <td className="p-2 border"></td>
                  <td className="p-2 border text-right font-mono font-bold">{C > 0 ? fmt(C) : '—'}</td>
                </tr>
                <tr className="bg-primary/10 font-bold text-lg">
                  <td className="p-2 border"></td>
                  <td className="p-2 border">ÉVALUATION DU FDR DISPONIBLE EN JOURS (= B / C)</td>
                  <td className="p-2 border"></td>
                  <td className={`p-2 border text-right ${joursDisponibles < 30 ? 'text-destructive' : joursDisponibles < 60 ? 'text-orange-500' : 'text-green-700'}`}>{joursDisponibles} jours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Synthèse chiffrée */}
      {A > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{fmt(A)}</p><p className="text-xs text-muted-foreground">FDR comptable</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${B >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(B)}</p><p className="text-xs text-muted-foreground">FDR disponible</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${joursDisponibles < 30 ? 'text-destructive' : joursDisponibles < 60 ? 'text-orange-500' : 'text-green-600'}`}>{joursDisponibles}j</p><p className="text-xs text-muted-foreground">Jours disponibles</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{fmt(seuilCritique)}</p><p className="text-xs text-muted-foreground">Seuil critique (30j)</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${margePrelevement > 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(margePrelevement)}</p><p className="text-xs text-muted-foreground">Marge de prélèvement</p></CardContent></Card>
        </div>
      )}

      {/* Prélèvement envisagé */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Prélèvement envisagé</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Montant du prélèvement (€)</Label><Input type="number" value={data.prelevementEnvisage} onChange={e => update('prelevementEnvisage', e.target.value)} /></div>
            <div className="space-y-1">
              <Label>FDR disponible après prélèvement</Label>
              <div className={`h-10 flex items-center px-3 rounded-md border text-sm font-bold ${BApres >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-destructive/10 text-destructive border-destructive'}`}>{fmt(BApres)} ({joursApres} jours)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État détaillé des prélèvements */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">État détaillé des prélèvements</CardTitle>
          <p className="text-xs text-muted-foreground">Détail des propositions de prélèvements à soumettre au CA</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button size="sm" onClick={() => setFormPrel({ objet: '', montant: '', voteCA: 'Proposition', dateCA: data.dateCA })}><Plus className="h-4 w-4 mr-2" /> Ajouter un prélèvement</Button>

          {formPrel && (
            <div className="p-4 border border-primary rounded-lg space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={formPrel.objet} onChange={e => setFormPrel({ ...formPrel, objet: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={formPrel.montant} onChange={e => setFormPrel({ ...formPrel, montant: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Statut</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formPrel.voteCA} onChange={e => setFormPrel({ ...formPrel, voteCA: e.target.value })}>
                    <option>Proposition</option><option>Voté CA antérieur</option><option>Voté BP</option><option>Voté DBM</option>
                  </select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Date CA</Label><Input type="date" value={formPrel.dateCA} onChange={e => setFormPrel({ ...formPrel, dateCA: e.target.value })} /></div>
              </div>
              <div className="flex gap-2"><Button size="sm" onClick={submitPrel}>Valider</Button><Button size="sm" variant="outline" onClick={() => setFormPrel(null)}>Annuler</Button></div>
            </div>
          )}

          {prelevements.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Objet</th><th className="text-right p-2">Montant</th><th className="p-2">Statut</th><th className="p-2">Date CA</th><th></th></tr></thead>
              <tbody>
                {prelevements.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2 font-bold">{p.objet}</td>
                    <td className="p-2 text-right font-mono font-bold">{fmt(p.montant)}</td>
                    <td className="p-2"><Badge>{p.voteCA}</Badge></td>
                    <td className="p-2 text-xs">{p.dateCA}</td>
                    <td className="p-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => savePrel(prelevements.filter(i => i.id !== p.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-bold">
                  <td className="p-2">TOTAL</td><td className="p-2 text-right font-mono">{fmt(totalPrelDetails)}</td><td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Graphiques */}
      {A > 0 && prel > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-sm text-center">Répartition du FDR disponible</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill={COLORS_CHART.red} />
                    <Cell fill={BApres >= 0 ? COLORS_CHART.green : COLORS_CHART.red} />
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-sm text-center">Comparaison des niveaux</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [fmt(v), 'Montant']} />
                  <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
                    <Cell fill={COLORS_CHART.primary} />
                    <Cell fill={B >= 0 ? COLORS_CHART.green : COLORS_CHART.red} />
                    <Cell fill={BApres >= 0 ? COLORS_CHART.green : COLORS_CHART.red} />
                    <Cell fill={COLORS_CHART.orange} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Avis */}
      {avis && (
        <Card className={`border-l-4 ${avis.type === 'critique' ? 'border-l-destructive' : avis.type === 'vigilance' ? 'border-l-orange-500' : 'border-l-green-500'}`}>
          <CardHeader><CardTitle className="text-lg">Avis de l'agent comptable</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed font-medium">{avis.text}</p>
            <Separator />
            <div className="space-y-1"><Label className="text-xs">Observations de l'ordonnateur</Label><Textarea value={data.obsOrdonnateur} onChange={e => update('obsOrdonnateur', e.target.value)} rows={3} placeholder="L'ordonnateur saisit ses observations ici..." /></div>
            <div className="space-y-1"><Label className="text-xs">Avis consultatif de l'agent comptable</Label><Textarea value={data.avisAgentComptable} onChange={e => update('avisAgentComptable', e.target.value)} rows={3} placeholder="L'agent comptable saisit son avis ici..." /></div>
            <p className="text-xs text-muted-foreground italic">Ce document sera transmis au rectorat et présenté aux membres du conseil d'administration, accompagné des éléments de l'analyse financière.</p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Observations générales</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={data.obs} onChange={e => update('obs', e.target.value)} rows={4} placeholder="Observations sur le fonds de roulement..." />
        </CardContent>
      </Card>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Fonds de roulement" description="M9-6 § 4.5.3 — Recommandation CRC" badge={`${(CONTROLES_FDR).filter(c => regChecks[c.id]).length}/${(CONTROLES_FDR).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_FDR.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/FondsSociaux.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { FondSocial, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_FONDS_SOCIAUX } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/** Plafond indicatif d'aide individuelle FSL/FSC : au-delà, examen renforcé en commission. */
const PLAFOND_AIDE_INDIVIDUELLE = 600;
/** Une aide annuelle cumulée ne doit pas dépasser le montant de la facture (frais scolaires + DP). */
const PLAFOND_BOURSE_FSC_ANNUEL = 1500;

export default function FondsSociaux() {
  const [items, setItems] = useState<FondSocial[]>(() => loadState('fonds_sociaux', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('fonds_sociaux_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('fonds_sociaux_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: FondSocial[]) => { setItems(d); saveState('fonds_sociaux', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const item: FondSocial = { id: form.id || crypto.randomUUID(), type: form.type, nom: form.nom, objet: form.objet, montant: parseFloat(form.montant) || 0, decision: form.decision, dateCommission: form.dateCommission, compte: '6576' };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <ModulePageLayout
      title="Fonds sociaux"
      section="GESTION COMPTABLE"
      description="Gestion des fonds sociaux lycéens (FSL) et fonds sociaux cantine. Attribution par la commission présidée par le chef d'établissement, respect de l'anonymat et traçabilité."
      refs={[
        { code: "Art. R.531-29 C.Édu", label: "Fonds social lycéen" },
        { code: "Circ. 98-044", label: "Fonds social cantine" },
        { code: "M9-6 § 4.2", label: "Suivi comptable" },
      ]}
      completedChecks={(CONTROLES_FONDS_SOCIAUX).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_FONDS_SOCIAUX).length}
    >
      <DoctrineEPLE theme="fonds-sociaux" titre="Fonds sociaux (collégien / lycéen / cantine)" resume="Circulaire 2017-122 — commission, plafond bourses + FSC ≤ frais scolaires" />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Demandes traitées</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(items.reduce((s,x) => s + (x.montant || 0), 0))}</p><p className="text-xs text-muted-foreground mt-0.5">Montant attribué</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.type === 'FSL').length}</p><p className="text-xs text-muted-foreground mt-0.5">Fonds social lycéen</p></CardContent></Card>
      </div>

      {/* Alertes plafonds — Circ. 98-044 et 2017-122 */}
      {(() => {
        const accordes = items.filter(i => i.decision === 'Accordé');
        const depassementUnitaire = accordes.filter(i => (i.montant || 0) > PLAFOND_AIDE_INDIVIDUELLE);
        const cumuls = new Map<string, number>();
        accordes.forEach(i => cumuls.set(i.nom, (cumuls.get(i.nom) || 0) + (i.montant || 0)));
        const depassementCumul = Array.from(cumuls.entries()).filter(([, m]) => m > PLAFOND_BOURSE_FSC_ANNUEL);
        if (depassementUnitaire.length === 0 && depassementCumul.length === 0) return null;
        return (
          <div className="space-y-2">
            {depassementUnitaire.length > 0 && (
              <ControlAlert
                level="alerte"
                title={`${depassementUnitaire.length} aide${depassementUnitaire.length > 1 ? 's' : ''} dépassant le plafond unitaire de ${fmt(PLAFOND_AIDE_INDIVIDUELLE)}`}
                description="Au-delà de ce seuil, l'attribution doit faire l'objet d'un examen renforcé en commission, avec pièces justificatives complètes (avis d'imposition, situation familiale)."
                action="Vérifier la motivation au PV de commission, l'anonymisation du dossier et la traçabilité (compte 6576)."
                refLabel="Circ. 98-044 — Fonds sociaux"
              />
            )}
            {depassementCumul.length > 0 && (
              <ControlAlert
                level="critique"
                title={`${depassementCumul.length} bénéficiaire${depassementCumul.length > 1 ? 's' : ''} : aide cumulée FSC + bourse > ${fmt(PLAFOND_BOURSE_FSC_ANNUEL)}/an`}
                description="Le cumul des aides (bourse nationale + fonds social) ne doit pas excéder le coût total de la scolarité (frais d'internat / DP + fournitures). Tout excédent doit être restitué."
                action="Recalculer la facture annuelle de chaque bénéficiaire concerné et procéder à la régularisation (titre de recette ou réduction de l'aide). Tracer en commission."
                refLabel="Circ. 2017-122 — Aides sociales aux familles"
              />
            )}
          </div>
        );
      })()}

      <div className="flex justify-end">
        <Button onClick={() => setForm({ type: 'FSL', nom: '', objet: '', montant: '', decision: 'Accordé', dateCommission: new Date().toISOString().split('T')[0] })}><Plus className="h-4 w-4 mr-2" /> Nouvelle aide</Button>
      </div>

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="FSL">Fonds Social Lycéen</option><option value="FSC">Fonds Social Cantine</option><option value="FS">Fonds Social Collégien</option>
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Bénéficiaire</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} placeholder="Fournitures, Cantine..." /></div>
              <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Décision</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.decision} onChange={e => setForm({ ...form, decision: e.target.value })}>
                  <option>Accordé</option><option>Refusé</option><option>En attente</option><option>Accord partiel</option>
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Date commission</Label><Input type="date" value={form.dateCommission} onChange={e => setForm({ ...form, dateCommission: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune aide enregistrée.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>{items.map(x => (
              <tr key={x.id} className="border-b">
                <td className="p-2"><Badge>{x.type}</Badge></td><td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.objet}</td>
                <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                <td className="p-2"><Badge variant={x.decision === 'Accordé' ? 'secondary' : x.decision === 'Refusé' ? 'destructive' : 'default'}>{x.decision}</Badge></td>
                <td className="p-2 text-xs">{x.dateCommission}</td>
                <td className="p-2"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, montant: String(x.montant) })}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent></Card>
      )}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Fonds sociaux" description="Circ. 98-044" badge={`${(CONTROLES_FONDS_SOCIAUX).filter(c => regChecks[c.id]).length}/${(CONTROLES_FONDS_SOCIAUX).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_FONDS_SOCIAUX.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Marches.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2, Pencil } from 'lucide-react';
import { MarchePublic, SEUILS_MARCHES, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_MARCHES } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ Détection saucissonnage : marchés de même nature dont le cumul 12 mois dépasse un seuil formalisé ═══ */
const SEUIL_FORMALISE = 216000;            // € HT — seuil procédure formalisée fournitures/services (UE 2026-2027)
const SEUIL_DISPENSE = 60000;              // € HT — seuil de dispense rehaussé (Décret 2025-1386)
const SEUIL_CUMUL_SUSPECT = 60000;         // € HT — au-dessus, risque de fractionnement à signaler

function normaliseObjet(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').trim();
}
function similarite(a: string, b: string): number {
  const sa = new Set(normaliseObjet(a).split(/\s+/).filter(w => w.length > 3));
  const sb = new Set(normaliseObjet(b).split(/\s+/).filter(w => w.length > 3));
  if (!sa.size || !sb.size) return 0;
  let inter = 0; sa.forEach(w => { if (sb.has(w)) inter++; });
  return inter / Math.min(sa.size, sb.size);
}
interface ClusterSaucissonnage {
  motCle: string; nature: string; total: number; nb: number; ids: string[];
}

const NATURES = ['Fournitures', 'Services', 'Travaux', 'Fournitures et services', 'Prestations intellectuelles'];
const PROCEDURES = ['Gré à gré (< 60 000 €)', 'MAPA simplifié', 'MAPA avec publicité', 'Appel d\'offres ouvert', 'Appel d\'offres restreint', 'Procédure négociée', 'Dialogue compétitif'];

export default function MarchesPage() {
  const [marches, setMarches] = useState<MarchePublic[]>(() => loadState('marches', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('marches_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('marches_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (m: MarchePublic[]) => { setMarches(m); saveState('marches', m); };

  const submit = () => {
    if (!form || !form.objet) return;
    const item: MarchePublic = {
      id: form.id || crypto.randomUUID(), objet: form.objet,
      montant: parseFloat(form.montant) || 0, typeMarche: form.typeMarche,
      dateNotification: form.dateNotification, observations: form.observations || '',
    };
    if (form.id) save(marches.map(m => m.id === form.id ? item : m));
    else save([...marches, item]);
    setForm(null);
  };

  const remove = (id: string) => save(marches.filter(m => m.id !== id));
  const totMontant = marches.reduce((s, m) => s + m.montant, 0);

  /* ═══ Détection auto saucissonnage : regroupe les marchés similaires (objet + nature) ═══ */
  const clustersSaucissonnage = useMemo<ClusterSaucissonnage[]>(() => {
    const visited = new Set<string>();
    const clusters: ClusterSaucissonnage[] = [];
    for (const m of marches) {
      if (visited.has(m.id)) continue;
      const groupe = marches.filter(x =>
        x.typeMarche === m.typeMarche &&
        (x.id === m.id || similarite(x.objet, m.objet) >= 0.5)
      );
      if (groupe.length < 2) continue;
      const total = groupe.reduce((s, g) => s + (g.montant || 0), 0);
      groupe.forEach(g => visited.add(g.id));
      if (total >= SEUIL_CUMUL_SUSPECT) {
        clusters.push({
          motCle: m.objet.slice(0, 40), nature: m.typeMarche,
          total, nb: groupe.length, ids: groupe.map(g => g.id),
        });
      }
    }
    return clusters.sort((a, b) => b.total - a.total);
  }, [marches]);

  return (
    <ModulePageLayout
      title="Commande et marchés publics"
      section="FINANCES & BUDGET"
      description="Vérification de la conformité des procédures d'achat selon les seuils en vigueur, respect des obligations de publicité et de mise en concurrence."
      refs={[
        { refKey: 'ccp-r2122-8', label: 'Dispense < 40 K€' },
        { refKey: 'ccp-r2124', label: 'MAPA' },
        { refKey: 'ccp-seuils-2026', label: 'Seuils 2026' },
        { refKey: 'ce-l421-14', label: 'Contrôle légalité > 90 K€' },
        { refKey: 'ccp-saucissonnage', label: 'Anti-fractionnement' },
        { refKey: 'ccp-delai-paiement', label: 'Délai 30 j' },
      ]}
      completedChecks={(CONTROLES_MARCHES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_MARCHES).length}
    >
      <DoctrineEPLE theme="marches" titre="Commande publique & marchés" resume="Seuils CCP 2026 — procédure adaptée à la nature et au montant" />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{marches.length}</p><p className="text-xs text-muted-foreground mt-0.5">Marchés suivis</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(totMontant)}</p><p className="text-xs text-muted-foreground mt-0.5">Montant total</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{marches.filter(x => (x.montant||0) >= 60000).length}</p><p className="text-xs text-muted-foreground mt-0.5">MAPA (≥ 60 K€)</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{marches.filter(x => (x.montant||0) >= 216000).length}</p><p className="text-xs text-muted-foreground mt-0.5">Procédure formalisée (≥ 216 K€)</p></CardContent></Card>
      </div>

      {/* ═══ ALERTE SAUCISSONNAGE AUTO ═══ */}
      {clustersSaucissonnage.length > 0 && (
        <div className="space-y-2">
          {clustersSaucissonnage.map((c, idx) => (
            <ControlAlert key={idx}
              level={c.total >= SEUIL_FORMALISE ? 'critique' : 'alerte'}
              title={`Risque de fractionnement détecté — « ${c.motCle}… »`}
              description={`${c.nb} marchés similaires de nature « ${c.nature} » totalisent ${fmt(c.total)}. ${c.total >= SEUIL_FORMALISE ? 'Le cumul dépasse le seuil de procédure formalisée (216 000 € HT) : passation séparée potentiellement irrégulière.' : 'Le cumul dépasse le seuil de dispense (60 000 € HT) sans publicité : à justifier ou regrouper.'}`}
              refKey="ccp-saucissonnage"
              action={c.total >= SEUIL_FORMALISE
                ? 'Réinterroger la computation des seuils (besoin homogène) et engager une procédure formalisée pour le besoin global.'
                : 'Vérifier la computation des seuils par familles homogènes (CCP art. R.2121-1) ou regrouper en MAPA avec publicité.'} />
          ))}
        </div>
      )}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles commande publique" description="CCP — Décrets 2025-1386/1383 — Seuils 2026" badge={`${(CONTROLES_MARCHES).filter(c => regChecks[c.id]).length}/${(CONTROLES_MARCHES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_MARCHES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      <div className="flex justify-end">
        <Button onClick={() => setForm({ objet: '', montant: '', typeMarche: 'Fournitures', dateNotification: '', observations: '' })}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un marché
        </Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Objet du marché</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Montant (€ HT)</Label><Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nature</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.typeMarche} onChange={e => setForm({ ...form, typeMarche: e.target.value })}>
                {NATURES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Date de notification</Label><Input type="date" value={form.dateNotification} onChange={e => setForm({ ...form, dateNotification: e.target.value })} /></div>
          </div>

          {/* Alerte seuils en temps réel */}
          {(() => {
            const montant = parseFloat(form.montant) || 0;
            const seuilAtteint = SEUILS_MARCHES.filter(s => montant >= s.seuil).pop();
            const seuilProchain = SEUILS_MARCHES.find(s => montant < s.seuil);
            return (
              <>
                {seuilAtteint && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-bold text-destructive">Seuil franchi : {seuilAtteint.label}</span>
                    </div>
                    <p className="text-xs">{seuilAtteint.consigne}</p>
                  </div>
                )}
                {seuilProchain && montant > 0 && (
                  <p className="text-xs text-muted-foreground">Prochain seuil : {seuilProchain.label}</p>
                )}
              </>
            );
          })()}

          <div className="space-y-1"><Label className="text-xs">Observations</Label>
            <Textarea value={form.observations || ''} onChange={e => setForm({ ...form, observations: e.target.value })} rows={3} placeholder="Observations, procédure suivie, référence..." />
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {marches.length === 0 && !form && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun marché enregistré.</CardContent></Card>
      )}

      {marches.map(marche => {
        const seuilAtteint = SEUILS_MARCHES.filter(s => marche.montant >= s.seuil).pop();
        return (
          <Card key={marche.id} className={seuilAtteint ? 'border-l-4 border-l-destructive' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{marche.objet}</span>
                    {seuilAtteint && <Badge variant="destructive">{seuilAtteint.label}</Badge>}
                  </div>
                  {seuilAtteint && <p className="text-xs text-destructive mt-1">{seuilAtteint.consigne}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...marche, montant: String(marche.montant) })}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(marche.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/MentionsLegales.tsx

```tsx
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function MentionsLegales() {
  return (
    <ModulePageLayout title="Mentions légales" section="AUDIT & RESTITUTION" description="Informations légales, réglementaires et RGPD">
      <Card>
        <CardContent className="prose prose-sm max-w-none p-6 space-y-6 text-foreground">
          <div>
            <h2 className="text-base font-bold text-foreground">Nature de l'outil</h2>
            <p className="text-sm text-muted-foreground mt-1">
              CIC Expert Pro est un outil d'aide au contrôle interne comptable et financier (CICF) destiné aux agents comptables d'EPLE. Il ne se substitue en aucun cas aux textes officiels, instructions codificatrices et circulaires en vigueur. L'utilisateur demeure seul responsable de ses actes de gestion.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Base légale de la mission</h2>
            <p className="text-sm text-muted-foreground mt-1">
              L'agent comptable exerce ses fonctions en application du décret n°2012-1246 du 7 novembre 2012 relatif à la gestion budgétaire et comptable publique (GBCP), de l'instruction codificatrice M9-6 et des articles R.421-9 et suivants du Code de l'éducation.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Responsable du traitement (RGPD)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              L'agent comptable utilisant l'application dans le cadre de ses fonctions est responsable du traitement des données saisies. La base légale est l'exécution d'une mission de service public (art. 6.1.e RGPD). Aucune donnée n'est transmise à des tiers à des fins commerciales.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Hébergement</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Application hébergée sur Vercel (San Francisco, CA, USA) et base de données Supabase. Les données d'audit sont stockées localement dans le navigateur (localStorage). Les données de compte sont gérées par Supabase Auth.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Références réglementaires — version en vigueur</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Instruction M9-6 · Décret GBCP 2012-1246 · Code de l'éducation · Décrets 2019-798 et 2020-128 (régies) · Ordonnance 2022-408 (RGP) · Décrets 2025-1386 et 2025-1383 (marchés publics, seuils au 1er avril 2026) · Circulaire du 16 juillet 2024 (voyages scolaires).
            </p>
          </div>
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/NotFound.tsx

```tsx
import { useLocation, NavLink } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto p-8">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-3xl font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>404</span>
        </div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Page introuvable
        </h1>
        <p className="text-sm text-muted-foreground">
          La page <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code> n'existe pas dans CIC Expert Pro.
        </p>
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retour au tableau de bord
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;

```

### FICHIER : src/pages/Ordonnateur.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useState, useRef, useCallback } from 'react';
import { loadState, saveState } from '@/lib/store';
import { useAuditParamsContext } from '@/contexts/AuditParamsContext';
import { getSelectedEtablissement } from '@/lib/types';
import { FileText, Send, Printer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { CONTROLES_ORDONNATEUR } from '@/lib/regulatory-data';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

const ORDONNATEUR_SECTIONS = [
  { key: 'qualite', title: 'Qualité et accréditation', icon: '🏛' },
  { key: 'budget', title: 'Actes budgétaires', icon: '📊' },
  { key: 'engagement', title: 'Engagements et commande publique', icon: '📝' },
] as const;

const ALL_ITEMS = [
  ...CONTROLES_ORDONNATEUR.qualite,
  ...CONTROLES_ORDONNATEUR.budget,
  ...CONTROLES_ORDONNATEUR.engagement,
];

interface AccreditationData {
  academie: string;
  denomination: string;
  nomOrdonnateur: string;
  prenomOrdonnateur: string;
  rue: string;
  complement: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone: string;
  datePriseEffet: string;
  outilSignature: string;
  lieuCertification: string;
  dateCertification: string;
}

interface DelegationData {
  nomDelegataire: string;
  prenomDelegataire: string;
  qualiteDelegataire: string;
  fonctionDelegataire: string;
  domaines: string;
  lieuCertification: string;
  dateCertification: string;
  dateNotification: string;
}

const DEFAULT_ACCREDITATION: AccreditationData = {
  academie: '', denomination: '', nomOrdonnateur: '', prenomOrdonnateur: '',
  rue: '', complement: '', codePostal: '', ville: '', email: '', telephone: '',
  datePriseEffet: '', outilSignature: "Validation par l'utilisation du seul profil ordonnateur dans le PGI OP@LE",
  lieuCertification: '', dateCertification: '',
};

const DEFAULT_DELEGATION: DelegationData = {
  nomDelegataire: '', prenomDelegataire: '', qualiteDelegataire: '',
  fonctionDelegataire: '', domaines: '', lieuCertification: '',
  dateCertification: '', dateNotification: '',
};

export default function OrdonnateurPage() {
  const { params } = useAuditParamsContext();
  const etab = getSelectedEtablissement(params);

  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadState('ordonnateur_checks', {}));
  const [obs, setObs] = useState(() => loadState('ordonnateur_obs', ''));

  const [accreditation, setAccreditation] = useState<AccreditationData>(() => {
    const saved = loadState<AccreditationData | null>('ordonnateur_accreditation', null);
    if (saved) return saved;
    return {
      ...DEFAULT_ACCREDITATION,
      academie: etab?.academie || '',
      denomination: etab?.nom || '',
      nomOrdonnateur: etab?.ordonnateur?.split(' ').slice(1).join(' ') || '',
      prenomOrdonnateur: etab?.ordonnateur?.split(' ')[0] || '',
      rue: etab?.adresse || '',
      codePostal: etab?.codePostal || '',
      ville: etab?.ville || '',
    };
  });

  const [delegation, setDelegation] = useState<DelegationData>(() =>
    loadState('ordonnateur_delegation', DEFAULT_DELEGATION)
  );

  const printRef = useRef<HTMLDivElement>(null);
  const delegPrintRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    saveState('ordonnateur_checks', updated);
  };

  const updateAccreditation = useCallback((field: keyof AccreditationData, value: string) => {
    setAccreditation(prev => {
      const next = { ...prev, [field]: value };
      saveState('ordonnateur_accreditation', next);
      return next;
    });
  }, []);

  const updateDelegation = useCallback((field: keyof DelegationData, value: string) => {
    setDelegation(prev => {
      const next = { ...prev, [field]: value };
      saveState('ordonnateur_delegation', next);
      return next;
    });
  }, []);

  const handlePrint = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error("Impossible d'ouvrir la fenêtre d'impression"); return; }
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Document</title>
      <style>
        body { font-family: 'Marianne', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 18px; text-align: center; margin-bottom: 8px; }
        h2 { font-size: 14px; text-align: center; margin-bottom: 24px; color: #444; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td, th { border: 1px solid #999; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f0f0f0; font-weight: 600; width: 40%; }
        .signature-block { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; }
        .signature-line { border-bottom: 1px solid #333; height: 60px; margin-top: 8px; }
        .footer { margin-top: 40px; font-size: 11px; color: #666; text-align: center; }
        .ref { font-size: 11px; color: #666; margin-bottom: 16px; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      ${ref.current.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleSendByEmail = () => {
    const subject = encodeURIComponent(`Accréditation ordonnateur – ${accreditation.denomination}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint le formulaire d'accréditation de l'ordonnateur pour l'établissement ${accreditation.denomination}.\n\nCe document est à compléter, signer et retourner à l'agent comptable.\n\nCordialement.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
    toast.success("Votre client de messagerie va s'ouvrir avec le message pré-rempli.");
  };

  const completedCount = ALL_ITEMS.filter(i => checks[i.id]).length;

  return (
    <ModulePageLayout
      title="Contrôle de l'ordonnateur"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Vérification de la qualité de l'ordonnateur, des délégations de signature, de l'accréditation auprès du comptable, et de la conformité des actes budgétaires."
      refs={[
        { code: 'Art. R.421-9 C.Édu', label: 'Ordonnateur de droit' },
        { code: 'Art. R.421-13 C.Édu', label: 'Délégation de signature' },
        { code: 'Art. R.421-68 C.Édu', label: 'Accréditation' },
        { code: 'Art. 8-10 GBCP', label: 'Engagement et certification' },
      ]}
      completedChecks={completedCount}
      totalChecks={ALL_ITEMS.length}
    >
      <DoctrineEPLE theme="ordonnateur" titre="Contrôle de l'ordonnateur" resume="Accréditation, spécimens de signature, séparation art. 10 GBCP" />
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{completedCount}/{ALL_ITEMS.length}</p><p className="text-xs text-muted-foreground mt-0.5">Points vérifiés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{ALL_ITEMS.filter(i => i.severity === 'critique' && !checks[i.id]).length}</p><p className="text-xs text-muted-foreground mt-0.5">Critiques restants</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{params.etablissements.length}</p><p className="text-xs text-muted-foreground mt-0.5">Établissements</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${completedCount === ALL_ITEMS.length ? 'text-green-600' : 'text-foreground'}`}>{Math.round(completedCount / ALL_ITEMS.length * 100)}%</p><p className="text-xs text-muted-foreground mt-0.5">Conformité</p></CardContent></Card>
      </div>

      <Tabs defaultValue="controle" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="controle">Points de contrôle</TabsTrigger>
          <TabsTrigger value="accreditation">
            <FileText className="h-4 w-4 mr-2" />
            Accréditation
          </TabsTrigger>
          <TabsTrigger value="delegation">Délégation de signature</TabsTrigger>
        </TabsList>

        {/* ─── ONGLET 1 : POINTS DE CONTRÔLE ─── */}
        <TabsContent value="controle" className="space-y-6 mt-4">
          {ORDONNATEUR_SECTIONS.map(section => {
            const items = CONTROLES_ORDONNATEUR[section.key as keyof typeof CONTROLES_ORDONNATEUR];
            const sectionCompleted = items.filter(i => checks[i.id]).length;
            return (
              <ModuleSection key={section.key} title={`${section.icon} ${section.title}`} badge={`${sectionCompleted}/${items.length}`}>
                <Card className="shadow-card">
                  <CardContent className="p-3 space-y-2">
                    {items.map(item => (
                      <ComplianceCheck
                        key={item.id}
                        label={item.label}
                        checked={checks[item.id] || false}
                        onChange={() => toggle(item.id)}
                        severity={item.severity}
                        detail={item.ref}
                      />
                    ))}
                  </CardContent>
                </Card>
              </ModuleSection>
            );
          })}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Observations</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={obs} onChange={e => { setObs(e.target.value); saveState('ordonnateur_obs', e.target.value); }} placeholder="Observations..." rows={5} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ONGLET 2 : FORMULAIRE D'ACCRÉDITATION ─── */}
        <TabsContent value="accreditation" className="space-y-6 mt-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Formulaire d'accréditation de l'ordonnateur</CardTitle>
              <CardDescription>
                Arrêté du 25 juillet 2013 — Art. 7 — Notification au comptable public assignataire de la qualité d'ordonnateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Académie</Label>
                  <Input value={accreditation.academie} onChange={e => updateAccreditation('academie', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Dénomination de l'établissement et cachet</Label>
                  <Input value={accreditation.denomination} onChange={e => updateAccreditation('denomination', e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'ordonnateur</Label>
                  <Input value={accreditation.nomOrdonnateur} onChange={e => updateAccreditation('nomOrdonnateur', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prénoms</Label>
                  <Input value={accreditation.prenomOrdonnateur} onChange={e => updateAccreditation('prenomOrdonnateur', e.target.value)} />
                </div>
              </div>

              <Separator />
              <p className="text-sm font-medium text-muted-foreground">Adresse postale</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rue</Label>
                  <Input value={accreditation.rue} onChange={e => updateAccreditation('rue', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Complément</Label>
                  <Input value={accreditation.complement} onChange={e => updateAccreditation('complement', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input value={accreditation.codePostal} onChange={e => updateAccreditation('codePostal', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input value={accreditation.ville} onChange={e => updateAccreditation('ville', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adresse de messagerie électronique</Label>
                  <Input type="email" value={accreditation.email} onChange={e => updateAccreditation('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de téléphone</Label>
                  <Input type="tel" value={accreditation.telephone} onChange={e => updateAccreditation('telephone', e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de prise d'effet de la qualité d'ordonnateur</Label>
                  <Input type="date" value={accreditation.datePriseEffet} onChange={e => updateAccreditation('datePriseEffet', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Outil de signature électronique</Label>
                  <Input value={accreditation.outilSignature} onChange={e => updateAccreditation('outilSignature', e.target.value)} />
                </div>
              </div>

              <Separator />
              <p className="text-sm font-medium text-muted-foreground">Certification</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lieu</Label>
                  <Input value={accreditation.lieuCertification} onChange={e => updateAccreditation('lieuCertification', e.target.value)} placeholder="Certifié exact, à..." />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={accreditation.dateCertification} onChange={e => updateAccreditation('dateCertification', e.target.value)} />
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic mt-2">
                Signature de l'ordonnateur servant de spécimen au comptable public pour opérer ses contrôles (décret n° 2012-1246 du 7 novembre 2012).
              </p>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handlePrint(printRef)} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer / PDF
                </Button>
                <Button onClick={handleSendByEmail} variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer par e-mail
                </Button>
                <Button variant="ghost" onClick={() => {
                  setAccreditation(DEFAULT_ACCREDITATION);
                  saveState('ordonnateur_accreditation', DEFAULT_ACCREDITATION);
                  toast.info('Formulaire réinitialisé');
                }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version imprimable cachée */}
          <div className="hidden">
            <div ref={printRef}>
              <h1>FORMULAIRE D'ACCRÉDITATION DE L'ORDONNATEUR</h1>
              <h2>Arrêté du 25 juillet 2013 — Art. 7</h2>
              <p className="ref">Notification au comptable public assignataire de la qualité d'ordonnateur</p>
              <table>
                <tbody>
                  <tr><th>Académie</th><td>{accreditation.academie}</td></tr>
                  <tr><th>Établissement (dénomination et cachet)</th><td>{accreditation.denomination}</td></tr>
                  <tr><th>Nom de l'ordonnateur</th><td>{accreditation.nomOrdonnateur}</td></tr>
                  <tr><th>Prénoms</th><td>{accreditation.prenomOrdonnateur}</td></tr>
                  <tr><th>Rue</th><td>{accreditation.rue}</td></tr>
                  <tr><th>Complément</th><td>{accreditation.complement}</td></tr>
                  <tr><th>Code postal</th><td>{accreditation.codePostal}</td></tr>
                  <tr><th>Ville</th><td>{accreditation.ville}</td></tr>
                  <tr><th>Adresse de messagerie</th><td>{accreditation.email}</td></tr>
                  <tr><th>Téléphone</th><td>{accreditation.telephone}</td></tr>
                  <tr><th>Date de prise d'effet</th><td>{accreditation.datePriseEffet}</td></tr>
                  <tr><th>Outil de signature électronique</th><td>{accreditation.outilSignature}</td></tr>
                </tbody>
              </table>
              <p>Certifié exact, à {accreditation.lieuCertification || '………………'}, le {accreditation.dateCertification || '………………'}</p>
              <p style={{ marginTop: '16px', fontSize: '12px' }}>
                Signature de l'ordonnateur servant de spécimen au comptable public pour opérer ses contrôles définis par le décret n° 2012-1246 du 7 novembre 2012 relatif à la gestion budgétaire et comptable publique.
              </p>
              <div className="signature-block">
                <div className="signature-box">
                  <p><strong>Signature de l'ordonnateur</strong></p>
                  <div className="signature-line"></div>
                </div>
              </div>
              <p className="footer">Document généré par AuditEPLE</p>
            </div>
          </div>
        </TabsContent>

        {/* ─── ONGLET 3 : DÉLÉGATION DE SIGNATURE ─── */}
        <TabsContent value="delegation" className="space-y-6 mt-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Délégation de signature de l'ordonnateur</CardTitle>
              <CardDescription>
                Art. R.421-13 du code de l'éducation — Le chef d'établissement peut déléguer sa signature pour l'exercice des fonctions d'ordonnateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Identité du délégataire</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={delegation.nomDelegataire} onChange={e => updateDelegation('nomDelegataire', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={delegation.prenomDelegataire} onChange={e => updateDelegation('prenomDelegataire', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Qualité</Label>
                  <Input value={delegation.qualiteDelegataire} onChange={e => updateDelegation('qualiteDelegataire', e.target.value)} placeholder="Ex : Chef d'établissement adjoint" />
                </div>
                <div className="space-y-2">
                  <Label>Fonction</Label>
                  <Input value={delegation.fonctionDelegataire} onChange={e => updateDelegation('fonctionDelegataire', e.target.value)} placeholder="Ex : Adjoint gestionnaire" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Domaines délégués</Label>
                <Textarea value={delegation.domaines} onChange={e => updateDelegation('domaines', e.target.value)}
                  placeholder="Préciser les domaines pour lesquels la signature est déléguée..." rows={3} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Lieu de certification</Label>
                  <Input value={delegation.lieuCertification} onChange={e => updateDelegation('lieuCertification', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date de certification</Label>
                  <Input type="date" value={delegation.dateCertification} onChange={e => updateDelegation('dateCertification', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date de notification (acte exécutoire)</Label>
                  <Input type="date" value={delegation.dateNotification} onChange={e => updateDelegation('dateNotification', e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handlePrint(delegPrintRef)} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer / PDF
                </Button>
                <Button variant="ghost" onClick={() => {
                  setDelegation(DEFAULT_DELEGATION);
                  saveState('ordonnateur_delegation', DEFAULT_DELEGATION);
                  toast.info('Formulaire réinitialisé');
                }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version imprimable cachée */}
          <div className="hidden">
            <div ref={delegPrintRef}>
              <h1>DÉLÉGATION DE SIGNATURE DE L'ORDONNATEUR</h1>
              <h2>Art. R.421-13 du code de l'éducation</h2>
              <p className="ref">Vu le code de l'éducation, notamment les articles L.421-3, R.421-13</p>
              <p style={{ margin: '16px 0' }}>Le Chef d'établissement <strong>{accreditation.nomOrdonnateur} {accreditation.prenomOrdonnateur}</strong> de l'établissement <strong>{accreditation.denomination}</strong> délègue sa signature :</p>
              <table>
                <tbody>
                  <tr><th>Nom du délégataire</th><td>{delegation.nomDelegataire}</td></tr>
                  <tr><th>Prénom</th><td>{delegation.prenomDelegataire}</td></tr>
                  <tr><th>Qualité</th><td>{delegation.qualiteDelegataire}</td></tr>
                  <tr><th>Fonction</th><td>{delegation.fonctionDelegataire}</td></tr>
                  <tr><th>Domaines délégués</th><td>{delegation.domaines}</td></tr>
                </tbody>
              </table>
              <div className="signature-block" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div style={{ width: '45%' }}>
                  <p><strong>Le Chef d'établissement</strong></p>
                  <p>Nom : {accreditation.nomOrdonnateur}</p>
                  <div style={{ borderBottom: '1px solid #333', height: '60px', marginTop: '8px' }}></div>
                  <p style={{ fontSize: '12px' }}>Date : {delegation.dateCertification || '………………'}</p>
                </div>
                <div style={{ width: '45%' }}>
                  <p><strong>Signature du délégataire</strong></p>
                  <div style={{ borderBottom: '1px solid #333', height: '60px', marginTop: '8px' }}></div>
                  <p style={{ fontSize: '12px' }}>Date : {delegation.dateCertification || '………………'}</p>
                </div>
              </div>
              <p style={{ marginTop: '24px', fontSize: '12px' }}>
                Date de publication/notification certifiant l'acte exécutoire : {delegation.dateNotification || '………………'}
              </p>
              <p className="footer" style={{ marginTop: '40px', fontSize: '11px', color: '#666', textAlign: 'center' }}>Document généré par AuditEPLE</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageLayout>
  );
}

```

