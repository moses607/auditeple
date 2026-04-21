-- Table : Calendrier comptable annuel
CREATE TABLE public.calendrier_annuel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  groupement_id UUID NOT NULL,
  activite_ref TEXT NOT NULL,
  libelle TEXT NOT NULL,
  description TEXT,
  mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
  date_limite DATE,
  categorie TEXT,
  criticite TEXT NOT NULL DEFAULT 'moyenne',
  reference_reglementaire TEXT,
  responsable_role TEXT,
  responsable_agent_id UUID,
  statut TEXT NOT NULL DEFAULT 'a_faire',
  custom BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendrier_annuel_groupement ON public.calendrier_annuel(groupement_id);
CREATE INDEX idx_calendrier_annuel_mois ON public.calendrier_annuel(groupement_id, mois);

ALTER TABLE public.calendrier_annuel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir calendrier de mon groupement"
  ON public.calendrier_annuel FOR SELECT TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Créer calendrier dans mon groupement"
  ON public.calendrier_annuel FOR INSERT TO authenticated
  WITH CHECK (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Modifier calendrier de mon groupement"
  ON public.calendrier_annuel FOR UPDATE TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Supprimer calendrier de mon groupement"
  ON public.calendrier_annuel FOR DELETE TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE TRIGGER update_calendrier_annuel_updated_at
  BEFORE UPDATE ON public.calendrier_annuel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table : Plan d'action CICF
CREATE TABLE public.plan_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  groupement_id UUID NOT NULL,
  origine TEXT NOT NULL,
  origine_ref TEXT NOT NULL,
  origine_label TEXT NOT NULL,
  libelle TEXT NOT NULL,
  description TEXT,
  criticite TEXT NOT NULL DEFAULT 'moyenne',
  responsable TEXT,
  responsable_role TEXT,
  responsable_agent_id UUID,
  echeance DATE,
  statut TEXT NOT NULL DEFAULT 'a_faire',
  reference TEXT,
  cycle TEXT,
  commentaires TEXT,
  alerte_envoyee DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (groupement_id, origine_ref)
);

CREATE INDEX idx_plan_actions_groupement ON public.plan_actions(groupement_id);
CREATE INDEX idx_plan_actions_statut ON public.plan_actions(groupement_id, statut);
CREATE INDEX idx_plan_actions_echeance ON public.plan_actions(groupement_id, echeance);

ALTER TABLE public.plan_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir plan action de mon groupement"
  ON public.plan_actions FOR SELECT TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Créer action dans mon groupement"
  ON public.plan_actions FOR INSERT TO authenticated
  WITH CHECK (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Modifier action de mon groupement"
  ON public.plan_actions FOR UPDATE TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Supprimer action de mon groupement"
  ON public.plan_actions FOR DELETE TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE TRIGGER update_plan_actions_updated_at
  BEFORE UPDATE ON public.plan_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();