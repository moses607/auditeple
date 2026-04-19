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
    { ref: 'Arrêté du 28 mai 1993 modifié', citation: 'Indemnités de responsabilité des régisseurs et cautionnement.' },
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
