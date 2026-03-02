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
  children?: { id: string; label: string; path: string }[];
}

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

export interface MarchePublic {
  id: string;
  objet: string;
  montant: number;
  typeMarche: string;
  dateNotification: string;
  observations: string;
}

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

export const DEFAULT_AUDIT_PARAMS: AuditParams = {
  etablissement: '',
  uai: '',
  adresse: '',
  ville: '',
  codePostal: '',
  academie: '',
  typeEtablissement: '',
  agentComptable: '',
  ordonnateur: '',
  dateDebut: '',
  dateFin: '',
  exercice: new Date().getFullYear().toString(),
  equipe: [],
};
