-- ═══ ENUM des rôles d'agents (M9-6) ═══
CREATE TYPE public.agent_role AS ENUM (
  'agent_comptable',
  'fonde_pouvoir',
  'ordonnateur',
  'ordonnateur_suppleant',
  'secretaire_general',
  'assistant_gestion',
  'regisseur_recettes',
  'regisseur_avances',
  'suppleant_regisseur',
  'magasinier',
  'chef_cuisine',
  'secretaire_intendance',
  'gestionnaire_materiel',
  'responsable_cfa_greta',
  'correspondant_cicf',
  'archiviste_comptable'
);

CREATE TYPE public.etablissement_type AS ENUM (
  'EPLE','LYCEE','LYCEE_PRO','COLLEGE','CFA','GRETA','EREA','SEGPA'
);

-- ═══ Groupements comptables ═══
CREATE TABLE public.groupements_comptables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle text NOT NULL,
  academie text NOT NULL DEFAULT 'Guadeloupe',
  siege text,
  email_agent_comptable text,
  telephone text,
  logo_url text,
  couleur_principale text DEFAULT '#1e40af',
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══ Établissements ═══
CREATE TABLE public.etablissements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groupement_id uuid NOT NULL REFERENCES public.groupements_comptables(id) ON DELETE CASCADE,
  type public.etablissement_type NOT NULL DEFAULT 'EPLE',
  nom text NOT NULL,
  uai text NOT NULL,
  siret text,
  code_budgetaire text,
  adresse text,
  code_postal text,
  ville text,
  telephone text,
  email text,
  est_agence_comptable boolean NOT NULL DEFAULT false,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(groupement_id, uai)
);

CREATE INDEX idx_etablissements_groupement ON public.etablissements(groupement_id);

-- ═══ Agents ═══
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groupement_id uuid NOT NULL REFERENCES public.groupements_comptables(id) ON DELETE CASCADE,
  etablissement_id uuid REFERENCES public.etablissements(id) ON DELETE SET NULL,
  role public.agent_role NOT NULL,
  civilite text,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text,
  telephone text,
  date_prise_fonction date,
  delegation_signature boolean NOT NULL DEFAULT false,
  signature_url text,
  actif boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agents_groupement ON public.agents(groupement_id);
CREATE INDEX idx_agents_etablissement ON public.agents(etablissement_id);
CREATE INDEX idx_agents_role ON public.agents(role);

-- ═══ Association agent ↔ multiples établissements ═══
CREATE TABLE public.etablissement_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  role_specifique public.agent_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, etablissement_id)
);

-- ═══ Lien user ↔ groupement (pour RLS) ═══
CREATE TABLE public.user_groupements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  groupement_id uuid NOT NULL REFERENCES public.groupements_comptables(id) ON DELETE CASCADE,
  est_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, groupement_id)
);

CREATE INDEX idx_user_groupements_user ON public.user_groupements(user_id);

-- ═══ Fonction security definer pour test d'appartenance ═══
CREATE OR REPLACE FUNCTION public.user_belongs_to_groupement(_user_id uuid, _groupement_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_groupements
    WHERE user_id = _user_id AND groupement_id = _groupement_id
  );
$$;

-- ═══ RLS ═══
ALTER TABLE public.groupements_comptables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etablissement_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groupements ENABLE ROW LEVEL SECURITY;

-- groupements_comptables : visible si l'utilisateur y appartient
CREATE POLICY "Voir mes groupements" ON public.groupements_comptables
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), id));

CREATE POLICY "Insérer un groupement" ON public.groupements_comptables
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Modifier mes groupements" ON public.groupements_comptables
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), id));

CREATE POLICY "Supprimer mes groupements" ON public.groupements_comptables
  FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), id));

-- etablissements
CREATE POLICY "Voir établissements de mon groupement" ON public.etablissements
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Créer établissement de mon groupement" ON public.etablissements
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Modifier établissement de mon groupement" ON public.etablissements
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Supprimer établissement de mon groupement" ON public.etablissements
  FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

-- agents
CREATE POLICY "Voir agents de mon groupement" ON public.agents
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Créer agent de mon groupement" ON public.agents
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Modifier agent de mon groupement" ON public.agents
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Supprimer agent de mon groupement" ON public.agents
  FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

-- etablissement_agents : via l'agent
CREATE POLICY "Voir liens agent-établissement" ON public.etablissement_agents
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agents a WHERE a.id = agent_id AND public.user_belongs_to_groupement(auth.uid(), a.groupement_id)));
CREATE POLICY "Créer liens agent-établissement" ON public.etablissement_agents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.agents a WHERE a.id = agent_id AND public.user_belongs_to_groupement(auth.uid(), a.groupement_id)));
CREATE POLICY "Supprimer liens agent-établissement" ON public.etablissement_agents
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agents a WHERE a.id = agent_id AND public.user_belongs_to_groupement(auth.uid(), a.groupement_id)));

-- user_groupements : chaque utilisateur voit ses propres rattachements
CREATE POLICY "Voir mes rattachements" ON public.user_groupements
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Créer mon rattachement" ON public.user_groupements
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Supprimer mon rattachement" ON public.user_groupements
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Triggers updated_at
CREATE TRIGGER trg_groupements_updated_at BEFORE UPDATE ON public.groupements_comptables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_etablissements_updated_at BEFORE UPDATE ON public.etablissements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();