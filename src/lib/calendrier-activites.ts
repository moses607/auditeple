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
