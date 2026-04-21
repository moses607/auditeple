/**
 * Plan comptable M9-6 / GBCP — Préfixes pour agrégation balance Op@le.
 * Basé uniquement sur les préfixes (jamais sur des sous-codes complets) afin
 * que les évolutions M9-6 restent maintenables.
 *
 * Convention : un compte a un solde débiteur (sDeb) et un solde créditeur (sCred)
 * issus de la balance. solde_net = sDeb - sCred.
 */

export type SoldeSens = 'D' | 'C' | 'NET'; // Débiteur, Créditeur, Net

export interface PrefixeRule {
  prefixes: string[];          // ex: ['10', '13']
  exclude?: string[];          // préfixes à exclure (ex: ['166','169'] pour les emprunts)
  sens: SoldeSens;             // sens du solde à retenir
  label: string;               // libellé court pour le tableau synoptique
}

// ───────────────────── RESSOURCES STABLES (passif haut) ─────────────────────
export const RESSOURCES_STABLES: Record<string, PrefixeRule> = {
  dotations:        { prefixes: ['10'],       sens: 'C', label: 'Dotations, fonds et réserves' },
  reportNouveau:    { prefixes: ['11'],       sens: 'NET', label: 'Report à nouveau' },
  resultat:         { prefixes: ['12'],       sens: 'NET', label: "Résultat de l'exercice" },
  subvInvest:       { prefixes: ['13'],       sens: 'C', label: "Subventions d'investissement nettes" },
  provReglementees: { prefixes: ['14'],       sens: 'C', label: 'Provisions réglementées' },
  provRC:           { prefixes: ['15'],       sens: 'C', label: 'Provisions pour risques et charges' },
  emprunts:         { prefixes: ['16'], exclude: ['166', '169'], sens: 'C', label: 'Emprunts et dettes LT' },
  liaisonBA:        { prefixes: ['185'],      sens: 'NET', label: 'Comptes de liaison budgets annexes' },
};

// ───────────────────── EMPLOIS STABLES (actif haut, valeur nette) ─────────────────────
export const EMPLOIS_STABLES: Record<string, PrefixeRule> = {
  immoIncorp:    { prefixes: ['20'],       sens: 'D', label: 'Immobilisations incorporelles brutes' },
  immoCorp:      { prefixes: ['21', '23'], sens: 'D', label: 'Immobilisations corporelles brutes' },
  immoFin:       { prefixes: ['26', '27'], sens: 'D', label: 'Immobilisations financières' },
  amortissements:{ prefixes: ['28'],       sens: 'C', label: 'Amortissements (à déduire)' },
  deprImmos:     { prefixes: ['29'],       sens: 'C', label: 'Dépréciations immos (à déduire)' },
};

// ───────────────────── BFR — Actif circulant d'exploitation ─────────────────────
export const BFR_ACTIF: Record<string, PrefixeRule> = {
  stocks:        { prefixes: ['31','32','33','34','35','36','37','38'], sens: 'D', label: 'Stocks bruts' },
  deprStocks:    { prefixes: ['39'], sens: 'C', label: 'Dépréciations stocks (à déduire)' },
  creancesFam:   { prefixes: ['411','416','418'], sens: 'D', label: 'Créances familles / clients' },
  deprCreances:  { prefixes: ['49'], sens: 'C', label: 'Dépréciations créances (à déduire)' },
  creancesEtat:  { prefixes: ['441','443','444','4418','4428'], sens: 'D', label: 'Créances État, collectivités' },
  creancesDiv:   { prefixes: ['46'], sens: 'D', label: 'Créances diverses' },
  transitActif:  { prefixes: ['47'], sens: 'D', label: 'Comptes transitoires actif' },
};

// ───────────────────── BFR — Passif circulant d'exploitation ─────────────────────
export const BFR_PASSIF: Record<string, PrefixeRule> = {
  fournisseurs:  { prefixes: ['40'], sens: 'C', label: 'Dettes fournisseurs' },
  dettesEtat:    { prefixes: ['42','43','44'], sens: 'C', label: 'Dettes État, collectivités, personnel' },
  crediteursDiv: { prefixes: ['46'], sens: 'C', label: 'Créditeurs divers' },
  transitPassif: { prefixes: ['47'], sens: 'C', label: 'Comptes transitoires passif' },
  pca:           { prefixes: ['487'], sens: 'C', label: "Produits constatés d'avance" },
};

// ───────────────────── Trésorerie ─────────────────────
export const TRESORERIE_ACTIF: Record<string, PrefixeRule> = {
  vmp:           { prefixes: ['50'], sens: 'D', label: 'VMP' },
  tresor:        { prefixes: ['515'], exclude: ['515900'], sens: 'D', label: 'Compte Trésor (515 hors 515900)' },
  chequesCB:     { prefixes: ['511'], sens: 'D', label: 'Chèques et CB à encaisser' },
  caisse:        { prefixes: ['53'], sens: 'D', label: 'Caisse' },
  regies:        { prefixes: ['54'], sens: 'NET', label: 'Régies' },
};

export const TRESORERIE_PASSIF: Record<string, PrefixeRule> = {
  concoursBanc:  { prefixes: ['519'], sens: 'C', label: 'Concours bancaires courants' },
};

// ───────────────────── Charges décaissables (pour la journée de fonctionnement) ─────────────────────
export const CHARGES_DECAISSABLES: PrefixeRule = {
  prefixes: ['60','61','62','63','64'],
  sens: 'D',
  label: 'Charges décaissables (mouvements débit période)',
};

// ───────────────────── Helpers ─────────────────────

/** Une ligne de balance (issue de l'import) — strictement neutre vis-à-vis du parseur. */
export interface BalanceLigne {
  compte: string;       // 6 caractères, padStart('0')
  libelle?: string;
  sDeb: number;         // solde débiteur (>=0)
  sCred: number;        // solde créditeur (>=0)
  mDeb?: number;        // mouvement débit période (pour charges décaissables)
  mCred?: number;
}

/** Vérifie si un compte matche un préfixe donné en tenant compte des exclusions. */
function matchePrefixe(compte: string, rule: PrefixeRule): boolean {
  if (!rule.prefixes.some(p => compte.startsWith(p))) return false;
  if (rule.exclude?.some(ex => compte.startsWith(ex))) return false;
  return true;
}

/** Calcule la contribution d'une ligne selon le sens demandé. */
function contribLigne(ligne: BalanceLigne, sens: SoldeSens, useMouvements = false): number {
  const deb = useMouvements ? (ligne.mDeb ?? 0) : ligne.sDeb;
  const cred = useMouvements ? (ligne.mCred ?? 0) : ligne.sCred;
  switch (sens) {
    case 'D': return Math.max(0, deb - cred); // ne retient que la part débitrice nette
    case 'C': return Math.max(0, cred - deb); // ne retient que la part créditrice nette
    case 'NET': return deb - cred;            // peut être positif ou négatif
  }
}

/** Agrège la balance pour un ensemble de règles ; retourne le total + détail par règle. */
export function agreger(
  balance: BalanceLigne[],
  rules: Record<string, PrefixeRule>,
  useMouvements = false,
): { total: number; detail: Record<string, { montant: number; lignes: BalanceLigne[] }> } {
  const detail: Record<string, { montant: number; lignes: BalanceLigne[] }> = {};
  let total = 0;
  for (const [key, rule] of Object.entries(rules)) {
    const lignesMatch = balance.filter(l => matchePrefixe(l.compte, rule));
    const m = lignesMatch.reduce((s, l) => s + contribLigne(l, rule.sens, useMouvements), 0);
    detail[key] = { montant: m, lignes: lignesMatch };
    total += m;
  }
  return { total, detail };
}

/** Agrège pour une règle unique. */
export function agregerRegle(balance: BalanceLigne[], rule: PrefixeRule, useMouvements = false): number {
  return balance
    .filter(l => matchePrefixe(l.compte, rule))
    .reduce((s, l) => s + contribLigne(l, rule.sens, useMouvements), 0);
}
