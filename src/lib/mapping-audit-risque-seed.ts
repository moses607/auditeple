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
