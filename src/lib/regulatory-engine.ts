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
    resume: "Plafonds : avances fonctionnement 2 000 €, restauration 3 000 €, encaisse régie de recettes 10 000 €. Délai de versement au comptable : 7 jours. Cautionnement obligatoire au-delà de 1 220 € de fonds maniés.",
    motsCles: ['régie', 'plafond', 'avance', 'recette', 'cautionnement'],
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
    id: 'arrete-cautionnement',
    source: 'ARRÊTÉ',
    reference: 'Arrêté 28/05/1993 modifié — Décret 66-850',
    titre: 'Cautionnement du régisseur — obligatoire au-delà de 1 220 €',
    resume: "Tout régisseur dont le plafond d'avances ou le montant moyen mensuel d'encaisse excède 1 220 € doit obligatoirement souscrire un cautionnement auprès d'une association de caution mutuelle (ex. AFCM) ou fournir une caution personnelle. Le cautionnement garantit la responsabilité personnelle et pécuniaire (RPP).",
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000536293',
    motsCles: ['cautionnement', 'régisseur', '1220', 'RPP', 'AFCM'],
  },
  {
    id: 'arrete-ir-regisseur',
    source: 'ARRÊTÉ',
    reference: 'Arrêté 28/05/1993 — Décret 2008-227',
    titre: 'Indemnité de responsabilité (IR) du régisseur',
    resume: "L'indemnité de responsabilité (IR) est due au régisseur dont le plafond d'encaisse ou d'avance excède 1 220 €. Son montant annuel est calculé selon un barème par tranches du plafond. Elle compense l'engagement de la responsabilité personnelle et pécuniaire.",
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
  };
  return map[source];
}
