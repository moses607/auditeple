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
          email_agent_comptable: string | null
          id: string
          libelle: string
          logo_url: string | null
          siege: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          academie?: string
          actif?: boolean
          couleur_principale?: string | null
          created_at?: string
          email_agent_comptable?: string | null
          id?: string
          libelle: string
          logo_url?: string | null
          siege?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          academie?: string
          actif?: boolean
          couleur_principale?: string | null
          created_at?: string
          email_agent_comptable?: string | null
          id?: string
          libelle?: string
          logo_url?: string | null
          siege?: string | null
          telephone?: string | null
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
      etablissement_type:
        | "EPLE"
        | "LYCEE"
        | "LYCEE_PRO"
        | "COLLEGE"
        | "CFA"
        | "GRETA"
        | "EREA"
        | "SEGPA"
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
      ],
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
    },
  },
} as const
