export interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  telephone: string;
}

export interface AuditParams {
  etablissement: string;
  uai: string;
  adresse: string;
  ville: string;
  codePostal: string;
  academie: string;
  typeEtablissement: string;
  agentComptable: string;
  ordonnateur: string;
  dateDebut: string;
  dateFin: string;
  exercice: string;
  equipe: TeamMember[];
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
  coutMatieres: number;
  coutPersonnel: number;
  coutEnergie: number;
  coutTotal: number;
  tarif: number;
  frequentation: number;
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
  status: 'conforme' | 'anomalie' | 'non_verifie';
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
  { seuil: 40000, label: '40 000 €', consigne: 'Marché à procédure adaptée (MAPA) : obligation de publicité et de mise en concurrence adaptées au montant et à la nature du marché.' },
  { seuil: 90000, label: '90 000 €', consigne: 'MAPA avec obligation de publicité : publication sur le profil d\'acheteur et dans un support de publication adapté. Transmission au contrôle de légalité obligatoire.' },
  { seuil: 221000, label: '221 000 €', consigne: 'Procédure formalisée obligatoire : appel d\'offres ouvert ou restreint. Publication au JOUE et au BOAMP.' },
  { seuil: 5382000, label: '5 382 000 €', consigne: 'Seuil européen pour les marchés de travaux : procédure formalisée avec publication au JOUE obligatoire.' },
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
  'Liquidation dépenses', 'Mandatement', 'Émission titres', 'Recouvrement',
  'Tenue comptabilité', 'Contrôle caisse', 'Inventaire stocks', 'Rapprochement bancaire',
  'Suivi bourses', 'Gestion régies', 'Commande publique', 'Voyages scolaires',
  'Paye', 'Patrimoine', 'Restauration',
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
  etablissement: '', uai: '', adresse: '', ville: '', codePostal: '',
  academie: '', typeEtablissement: '', agentComptable: '', ordonnateur: '',
  dateDebut: '', dateFin: '', exercice: new Date().getFullYear().toString(), equipe: [],
};

export const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0);
export const fmtDate = (d: string) => d ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d)) : '—';
