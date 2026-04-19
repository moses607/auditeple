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
        "Contrôle de la régularité des régies de recettes et d'avances : actes constitutifs, cautionnement, plafonds, contrôles inopinés, reversements.",
      cadre:
        "Décret 2019-798 du 26 juillet 2019 modernisé par 2020-128 : régime unifié des régies. Arrêté du 28 mai 1993 modifié : indemnités de responsabilité et cautionnement. Obligation de contrôle au moins une fois par an par l'agent comptable.",
      analyse:
        "Pour chaque régie : vérifier l'arrêté constitutif, l'acte de nomination du régisseur, le cautionnement souscrit, le plafond d'encaisse et de la régie d'avances, la fréquence des reversements (≥ 1/mois), la concordance comptabilité régisseur / comptabilité du comptable, la tenue des journaux et bordereaux.",
      conclusion:
        "Toute irrégularité (régie sans acte constitutif, plafond dépassé, défaut de cautionnement, reversement tardif) doit faire l'objet d'un PV de contrôle et d'une mise en demeure. Le régisseur engage sa responsabilité personnelle et pécuniaire (Ordonnance 2022-408).",
      source: 'Décret 2019-798 ; Décret 2020-128 ; Arrêté du 28 mai 1993 modifié ; Ordonnance 2022-408.',
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
};
