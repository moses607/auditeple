import type { Periodicite, Categorie } from './calendrier-activites';

export interface ActiviteCalendrier {
  id: string;
  modeleId?: string; // référence à ACTIVITES_MODELES si dérivée
  titre: string;
  categorie: Categorie;
  periodicite: Periodicite;
  moisDebut: number;
  moisFin?: number;
  description: string;
  reference?: string;
  responsable: 'AC' | 'ER' | 'AC+ER';
  criticite: 'haute' | 'moyenne' | 'info';
  /** Date d'échéance personnalisable au format YYYY-MM-DD */
  dateEcheance?: string;
  /** IDs des établissements rattachés concernés (vide si tousEtablissements) */
  etablissementsIds: string[];
  /** Si vrai : tous les établissements du groupement */
  tousEtablissements: boolean;
  /** Notes libres */
  notes?: string;
  /** Suivi de réalisation */
  realisee?: boolean;
  realiseeAt?: string; // ISO datetime
  realiseePar?: string; // nom de l'utilisateur
}
