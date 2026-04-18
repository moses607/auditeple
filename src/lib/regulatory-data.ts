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
