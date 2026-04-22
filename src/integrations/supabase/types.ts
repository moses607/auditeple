export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          actif: boolean
          civilite: string | null
          created_at: string
          date_prise_fonction: string | null
          delegation_signature: boolean
          email: string | null
          etablissement_id: string | null
          groupement_id: string
          id: string
          nom: string
          notes: string | null
          prenom: string
          role: Database["public"]["Enums"]["agent_role"]
          signature_url: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          civilite?: string | null
          created_at?: string
          date_prise_fonction?: string | null
          delegation_signature?: boolean
          email?: string | null
          etablissement_id?: string | null
          groupement_id: string
          id?: string
          nom: string
          notes?: string | null
          prenom: string
          role: Database["public"]["Enums"]["agent_role"]
          signature_url?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          civilite?: string | null
          created_at?: string
          date_prise_fonction?: string | null
          delegation_signature?: boolean
          email?: string | null
          etablissement_id?: string | null
          groupement_id?: string
          id?: string
          nom?: string
          notes?: string | null
          prenom?: string
          role?: Database["public"]["Enums"]["agent_role"]
          signature_url?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_groupement_id_fkey"
            columns: ["groupement_id"]
            isOneToOne: false
            referencedRelation: "groupements_comptables"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_points_results: {
        Row: {
          action_corrective: string | null
          anomalies: string | null
          audit_id: string
          constat: string | null
          created_at: string
          delai_action: string | null
          domaine_id: string
          id: string
          pieces_jointes: Json | null
          point_index: number
          point_libelle: string
          responsable_action: string | null
          status: Database["public"]["Enums"]["point_result_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_corrective?: string | null
          anomalies?: string | null
          audit_id: string
          constat?: string | null
          created_at?: string
          delai_action?: string | null
          domaine_id: string
          id?: string
          pieces_jointes?: Json | null
          point_index: number
          point_libelle: string
          responsable_action?: string | null
          status?: Database["public"]["Enums"]["point_result_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_corrective?: string | null
          anomalies?: string | null
          audit_id?: string
          constat?: string | null
          created_at?: string
          delai_action?: string | null
          domaine_id?: string
          id?: string
          pieces_jointes?: Json | null
          point_index?: number
          point_libelle?: string
          responsable_action?: string | null
          status?: Database["public"]["Enums"]["point_result_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_points_results_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          agent_comptable_id: string | null
          created_at: string
          date_audit: string
          etablissement_id: string
          groupement_id: string
          id: string
          libelle: string
          notes: string | null
          ordonnateur_id: string | null
          periode_debut: string
          periode_fin: string
          scope: Json
          status: Database["public"]["Enums"]["audit_status"]
          type_audit: Database["public"]["Enums"]["audit_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_comptable_id?: string | null
          created_at?: string
          date_audit?: string
          etablissement_id: string
          groupement_id: string
          id?: string
          libelle: string
          notes?: string | null
          ordonnateur_id?: string | null
          periode_debut: string
          periode_fin: string
          scope?: Json
          status?: Database["public"]["Enums"]["audit_status"]
          type_audit?: Database["public"]["Enums"]["audit_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_comptable_id?: string | null
          created_at?: string
          date_audit?: string
          etablissement_id?: string
          groupement_id?: string
          id?: string
          libelle?: string
          notes?: string | null
          ordonnateur_id?: string | null
          periode_debut?: string
          periode_fin?: string
          scope?: Json
          status?: Database["public"]["Enums"]["audit_status"]
          type_audit?: Database["public"]["Enums"]["audit_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendrier_annuel: {
        Row: {
          activite_ref: string
          categorie: string | null
          created_at: string
          created_by: string | null
          criticite: string
          custom: boolean
          date_limite: string | null
          description: string | null
          groupement_id: string
          id: string
          libelle: string
          mois: number
          notes: string | null
          reference_reglementaire: string | null
          responsable_agent_id: string | null
          responsable_role: string | null
          statut: string
          updated_at: string
        }
        Insert: {
          activite_ref: string
          categorie?: string | null
          created_at?: string
          created_by?: string | null
          criticite?: string
          custom?: boolean
          date_limite?: string | null
          description?: string | null
          groupement_id: string
          id?: string
          libelle: string
          mois: number
          notes?: string | null
          reference_reglementaire?: string | null
          responsable_agent_id?: string | null
          responsable_role?: string | null
          statut?: string
          updated_at?: string
        }
        Update: {
          activite_ref?: string
          categorie?: string | null
          created_at?: string
          created_by?: string | null
          criticite?: string
          custom?: boolean
          date_limite?: string | null
          description?: string | null
          groupement_id?: string
          id?: string
          libelle?: string
          mois?: number
          notes?: string | null
          reference_reglementaire?: string | null
          responsable_agent_id?: string | null
          responsable_role?: string | null
          statut?: string
          updated_at?: string
        }
        Relationships: []
      }
      etablissement_agents: {
        Row: {
          agent_id: string
          created_at: string
          etablissement_id: string
          id: string
          role_specifique: Database["public"]["Enums"]["agent_role"] | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          etablissement_id: string
          id?: string
          role_specifique?: Database["public"]["Enums"]["agent_role"] | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          etablissement_id?: string
          id?: string
          role_specifique?: Database["public"]["Enums"]["agent_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "etablissement_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etablissement_agents_etablissement_id_fkey"
            columns: ["etablissement_id"]
            isOneToOne: false
            referencedRelation: "etablissements"
            referencedColumns: ["id"]
          },
        ]
      }
      etablissements: {
        Row: {
          actif: boolean
          adresse: string | null
          code_budgetaire: string | null
          code_postal: string | null
          created_at: string
          email: string | null
          est_agence_comptable: boolean
          groupement_id: string
          id: string
          nom: string
          score_cicf_actuel: number | null
          score_cicf_maj_at: string | null
          siret: string | null
          telephone: string | null
          type: Database["public"]["Enums"]["etablissement_type"]
          uai: string
          updated_at: string
          ville: string | null
        }
        Insert: {
          actif?: boolean
          adresse?: string | null
          code_budgetaire?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          est_agence_comptable?: boolean
          groupement_id: string
          id?: string
          nom: string
          score_cicf_actuel?: number | null
          score_cicf_maj_at?: string | null
          siret?: string | null
          telephone?: string | null
          type?: Database["public"]["Enums"]["etablissement_type"]
          uai: string
          updated_at?: string
          ville?: string | null
        }
        Update: {
          actif?: boolean
          adresse?: string | null
          code_budgetaire?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          est_agence_comptable?: boolean
          groupement_id?: string
          id?: string
          nom?: string
          score_cicf_actuel?: number | null
          score_cicf_maj_at?: string | null
          siret?: string | null
          telephone?: string | null
          type?: Database["public"]["Enums"]["etablissement_type"]
          uai?: string
          updated_at?: string
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etablissements_groupement_id_fkey"
            columns: ["groupement_id"]
            isOneToOne: false
            referencedRelation: "groupements_comptables"
            referencedColumns: ["id"]
          },
        ]
      }
      groupements_comptables: {
        Row: {
          academie: string
          actif: boolean
          couleur_principale: string | null
          created_at: string
          devise: string | null
          email_agent_comptable: string | null
          email_crc: string | null
          email_rectorat_daf: string | null
          email_rectorat_inspection: string | null
          id: string
          libelle: string
          logo_url: string | null
          lycee_siege_id: string | null
          seuil_alerte_score: number | null
          siege: string | null
          signature_ac_url: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          academie?: string
          actif?: boolean
          couleur_principale?: string | null
          created_at?: string
          devise?: string | null
          email_agent_comptable?: string | null
          email_crc?: string | null
          email_rectorat_daf?: string | null
          email_rectorat_inspection?: string | null
          id?: string
          libelle: string
          logo_url?: string | null
          lycee_siege_id?: string | null
          seuil_alerte_score?: number | null
          siege?: string | null
          signature_ac_url?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          academie?: string
          actif?: boolean
          couleur_principale?: string | null
          created_at?: string
          devise?: string | null
          email_agent_comptable?: string | null
          email_crc?: string | null
          email_rectorat_daf?: string | null
          email_rectorat_inspection?: string | null
          id?: string
          libelle?: string
          logo_url?: string | null
          lycee_siege_id?: string | null
          seuil_alerte_score?: number | null
          siege?: string | null
          signature_ac_url?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      historique_calculs: {
        Row: {
          calculateur_id: string
          calculateur_label: string
          contexte: string | null
          created_at: string
          created_by: string | null
          etablissement_id: string | null
          groupement_id: string
          id: string
          params: Json
          resultat: Json
          resume: string | null
        }
        Insert: {
          calculateur_id: string
          calculateur_label: string
          contexte?: string | null
          created_at?: string
          created_by?: string | null
          etablissement_id?: string | null
          groupement_id: string
          id?: string
          params?: Json
          resultat?: Json
          resume?: string | null
        }
        Update: {
          calculateur_id?: string
          calculateur_label?: string
          contexte?: string | null
          created_at?: string
          created_by?: string | null
          etablissement_id?: string | null
          groupement_id?: string
          id?: string
          params?: Json
          resultat?: Json
          resume?: string | null
        }
        Relationships: []
      }
      mapping_audit_risque: {
        Row: {
          created_at: string
          domaine_id: string
          groupement_id: string | null
          id: string
          point_index: number
          point_libelle: string
          ponderation: number
          risque_libelle: string
          risque_processus: string
          rubrique: string
        }
        Insert: {
          created_at?: string
          domaine_id: string
          groupement_id?: string | null
          id?: string
          point_index: number
          point_libelle: string
          ponderation?: number
          risque_libelle: string
          risque_processus: string
          rubrique: string
        }
        Update: {
          created_at?: string
          domaine_id?: string
          groupement_id?: string | null
          id?: string
          point_index?: number
          point_libelle?: string
          ponderation?: number
          risque_libelle?: string
          risque_processus?: string
          rubrique?: string
        }
        Relationships: []
      }
      plan_actions: {
        Row: {
          alerte_envoyee: string | null
          commentaires: string | null
          created_at: string
          created_by: string | null
          criticite: string
          cycle: string | null
          description: string | null
          echeance: string | null
          groupement_id: string
          id: string
          libelle: string
          origine: string
          origine_label: string
          origine_ref: string
          reference: string | null
          responsable: string | null
          responsable_agent_id: string | null
          responsable_role: string | null
          statut: string
          updated_at: string
        }
        Insert: {
          alerte_envoyee?: string | null
          commentaires?: string | null
          created_at?: string
          created_by?: string | null
          criticite?: string
          cycle?: string | null
          description?: string | null
          echeance?: string | null
          groupement_id: string
          id?: string
          libelle: string
          origine: string
          origine_label: string
          origine_ref: string
          reference?: string | null
          responsable?: string | null
          responsable_agent_id?: string | null
          responsable_role?: string | null
          statut?: string
          updated_at?: string
        }
        Update: {
          alerte_envoyee?: string | null
          commentaires?: string | null
          created_at?: string
          created_by?: string | null
          criticite?: string
          cycle?: string | null
          description?: string | null
          echeance?: string | null
          groupement_id?: string
          id?: string
          libelle?: string
          origine?: string
          origine_label?: string
          origine_ref?: string
          reference?: string | null
          responsable?: string | null
          responsable_agent_id?: string | null
          responsable_role?: string | null
          statut?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pv_access_tokens: {
        Row: {
          created_at: string
          email_destinataire: string
          expires_at: string
          id: string
          pv_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email_destinataire: string
          expires_at: string
          id?: string
          pv_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email_destinataire?: string
          expires_at?: string
          id?: string
          pv_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pv_access_tokens_pv_id_fkey"
            columns: ["pv_id"]
            isOneToOne: false
            referencedRelation: "pv_contradictoires"
            referencedColumns: ["id"]
          },
        ]
      }
      pv_contradictoires: {
        Row: {
          audit_id: string
          created_at: string
          delai_jours: number
          email_ordonnateur: string | null
          envoye_at: string | null
          finalise_at: string | null
          groupement_id: string
          id: string
          observation_globale: string | null
          observations_ordonnateur: Json | null
          signature_ordonnateur_at: string | null
          signature_ordonnateur_ip: string | null
          status: Database["public"]["Enums"]["pv_status"]
          updated_at: string
        }
        Insert: {
          audit_id: string
          created_at?: string
          delai_jours?: number
          email_ordonnateur?: string | null
          envoye_at?: string | null
          finalise_at?: string | null
          groupement_id: string
          id?: string
          observation_globale?: string | null
          observations_ordonnateur?: Json | null
          signature_ordonnateur_at?: string | null
          signature_ordonnateur_ip?: string | null
          status?: Database["public"]["Enums"]["pv_status"]
          updated_at?: string
        }
        Update: {
          audit_id?: string
          created_at?: string
          delai_jours?: number
          email_ordonnateur?: string | null
          envoye_at?: string | null
          finalise_at?: string | null
          groupement_id?: string
          id?: string
          observation_globale?: string | null
          observations_ordonnateur?: Json | null
          signature_ordonnateur_at?: string | null
          signature_ordonnateur_ip?: string | null
          status?: Database["public"]["Enums"]["pv_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pv_contradictoires_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      rapports_maturite: {
        Row: {
          accuse_reception: Json | null
          created_at: string
          destinataires: Json
          envoye_at: string | null
          envoye_par: string | null
          etablissement_id: string | null
          groupement_id: string
          id: string
          ip_envoi: string | null
          message: string | null
          objet: string | null
          pdf_url: string | null
          periode_debut: string
          periode_fin: string
          score_global: number
          status: string
          updated_at: string
        }
        Insert: {
          accuse_reception?: Json | null
          created_at?: string
          destinataires?: Json
          envoye_at?: string | null
          envoye_par?: string | null
          etablissement_id?: string | null
          groupement_id: string
          id?: string
          ip_envoi?: string | null
          message?: string | null
          objet?: string | null
          pdf_url?: string | null
          periode_debut: string
          periode_fin: string
          score_global: number
          status?: string
          updated_at?: string
        }
        Update: {
          accuse_reception?: Json | null
          created_at?: string
          destinataires?: Json
          envoye_at?: string | null
          envoye_par?: string | null
          etablissement_id?: string | null
          groupement_id?: string
          id?: string
          ip_envoi?: string | null
          message?: string | null
          objet?: string | null
          pdf_url?: string | null
          periode_debut?: string
          periode_fin?: string
          score_global?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      risque_ajustements: {
        Row: {
          created_at: string
          criticite_actuelle: string
          criticite_suggeree: string
          decided_at: string | null
          decided_by: string | null
          etablissement_id: string | null
          groupement_id: string
          id: string
          motif: string
          risque_libelle: string
          risque_processus: string
          score_anomalies: number
          source_audit_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criticite_actuelle: string
          criticite_suggeree: string
          decided_at?: string | null
          decided_by?: string | null
          etablissement_id?: string | null
          groupement_id: string
          id?: string
          motif: string
          risque_libelle: string
          risque_processus: string
          score_anomalies: number
          source_audit_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criticite_actuelle?: string
          criticite_suggeree?: string
          decided_at?: string | null
          decided_by?: string | null
          etablissement_id?: string | null
          groupement_id?: string
          id?: string
          motif?: string
          risque_libelle?: string
          risque_processus?: string
          score_anomalies?: number
          source_audit_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      scoring_snapshots: {
        Row: {
          created_at: string
          details: Json
          etablissement_id: string | null
          groupement_id: string
          id: string
          periode: string
          score_global: number
          scores_rubriques: Json
        }
        Insert: {
          created_at?: string
          details?: Json
          etablissement_id?: string | null
          groupement_id: string
          id?: string
          periode: string
          score_global: number
          scores_rubriques?: Json
        }
        Update: {
          created_at?: string
          details?: Json
          etablissement_id?: string | null
          groupement_id?: string
          id?: string
          periode?: string
          score_global?: number
          scores_rubriques?: Json
        }
        Relationships: []
      }
      user_groupements: {
        Row: {
          created_at: string
          est_admin: boolean
          groupement_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          est_admin?: boolean
          groupement_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          est_admin?: boolean
          groupement_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groupements_groupement_id_fkey"
            columns: ["groupement_id"]
            isOneToOne: false
            referencedRelation: "groupements_comptables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_groupement_with_link: {
        Args: { _payload: Json }
        Returns: {
          academie: string
          actif: boolean
          couleur_principale: string | null
          created_at: string
          devise: string | null
          email_agent_comptable: string | null
          email_crc: string | null
          email_rectorat_daf: string | null
          email_rectorat_inspection: string | null
          id: string
          libelle: string
          logo_url: string | null
          lycee_siege_id: string | null
          seuil_alerte_score: number | null
          siege: string | null
          signature_ac_url: string | null
          telephone: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "groupements_comptables"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      user_belongs_to_groupement: {
        Args: { _groupement_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      agent_role:
        | "agent_comptable"
        | "fonde_pouvoir"
        | "ordonnateur"
        | "ordonnateur_suppleant"
        | "secretaire_general"
        | "assistant_gestion"
        | "regisseur_recettes"
        | "regisseur_avances"
        | "suppleant_regisseur"
        | "magasinier"
        | "chef_cuisine"
        | "secretaire_intendance"
        | "gestionnaire_materiel"
        | "responsable_cfa_greta"
        | "correspondant_cicf"
        | "archiviste_comptable"
        | "secretaire_general_delegue"
        | "adjoint_secretaire_general"
      audit_status:
        | "en_cours"
        | "cloture"
        | "envoye_contradiction"
        | "contradictoire_clos"
      audit_type: "periodique" | "thematique" | "inopine" | "prise_fonction"
      etablissement_type:
        | "EPLE"
        | "LYCEE"
        | "LYCEE_PRO"
        | "COLLEGE"
        | "CFA"
        | "GRETA"
        | "EREA"
        | "SEGPA"
      point_result_status:
        | "non_audite"
        | "conforme"
        | "anomalie_mineure"
        | "anomalie_majeure"
        | "non_applicable"
      pv_status: "brouillon" | "envoye" | "observe" | "finalise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_role: [
        "agent_comptable",
        "fonde_pouvoir",
        "ordonnateur",
        "ordonnateur_suppleant",
        "secretaire_general",
        "assistant_gestion",
        "regisseur_recettes",
        "regisseur_avances",
        "suppleant_regisseur",
        "magasinier",
        "chef_cuisine",
        "secretaire_intendance",
        "gestionnaire_materiel",
        "responsable_cfa_greta",
        "correspondant_cicf",
        "archiviste_comptable",
        "secretaire_general_delegue",
        "adjoint_secretaire_general",
      ],
      audit_status: [
        "en_cours",
        "cloture",
        "envoye_contradiction",
        "contradictoire_clos",
      ],
      audit_type: ["periodique", "thematique", "inopine", "prise_fonction"],
      etablissement_type: [
        "EPLE",
        "LYCEE",
        "LYCEE_PRO",
        "COLLEGE",
        "CFA",
        "GRETA",
        "EREA",
        "SEGPA",
      ],
      point_result_status: [
        "non_audite",
        "conforme",
        "anomalie_mineure",
        "anomalie_majeure",
        "non_applicable",
      ],
      pv_status: ["brouillon", "envoye", "observe", "finalise"],
    },
  },
} as const
