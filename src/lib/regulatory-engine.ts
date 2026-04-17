/**
 * Regulatory Engine — Référentiel central des règles M9-6, GBCP, CE, CCP, RGP.
 * Réutilisable depuis tous les modules pour afficher tooltips, alertes contextuelles,
 * scoring et générer des observations PV cohérentes.
 */

export type SourceLegale =
  | 'GBCP' | 'M9-6' | 'CE' | 'CCP' | 'RGP' | 'CIRCULAIRE' | 'ARRÊTÉ' | 'DÉCRET';

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

  // ─── Régies ───
  {
    id: 'reg-2019-798',
    source: 'DÉCRET',
    reference: 'Décret 2019-798 du 26 juillet 2019',
    titre: 'Régies de recettes et d\'avances',
    resume: "Plafonds : avances fonctionnement 2 000 €, restauration 3 000 €, encaisse régie de recettes 10 000 €. Délai de versement au comptable : 7 jours.",
    motsCles: ['régie', 'plafond', 'avance', 'recette'],
  },

  // ─── RGP ───
  {
    id: 'rgp-l131-9',
    source: 'RGP',
    reference: 'Art. L.131-9 à L.131-15 CJF — Ord. 2022-408',
    titre: 'Régime de Responsabilité du Gestionnaire Public',
    resume: "Remplace la RPP. La responsabilité de l'AC peut être engagée pour faute grave (méconnaissance des règles d'engagement, de liquidation, de paiement) ayant causé un préjudice financier significatif.",
    motsCles: ['RGP', 'responsabilité', 'gestionnaire public'],
  },

  // ─── Prescription / déchéance ───
  {
    id: 'presc-quadri',
    source: 'CIRCULAIRE',
    reference: 'Loi du 31 décembre 1968',
    titre: 'Déchéance quadriennale',
    resume: "Sont prescrites au profit de l'État, des départements, des communes et des établissements publics, toutes créances qui n'ont pas été payées dans un délai de quatre ans à partir du premier jour de l'année suivant celle au cours de laquelle les droits ont été acquis.",
    motsCles: ['prescription', 'déchéance', 'quadriennale', '4 ans'],
  },

  // ─── Bourses & fonds sociaux ───
  {
    id: 'circ-2017-122',
    source: 'CIRCULAIRE',
    reference: 'Circulaire n° 2017-122',
    titre: 'Fonds sociaux — versement interdit à la famille',
    resume: "Le total Bourse + Fonds Social ne peut excéder le montant des frais scolaires dus. Tout excédent est interdit à la famille (versement direct).",
    motsCles: ['fonds social', 'FSC', 'bourse', 'famille'],
  },

  // ─── Voyages ───
  {
    id: 'circ-voyages',
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
  };
  return map[source];
}
