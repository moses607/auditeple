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
