-- Table historique_calculs : trace les calculs effectués via les calculateurs intégrés
CREATE TABLE public.historique_calculs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  groupement_id UUID NOT NULL,
  etablissement_id UUID,
  calculateur_id TEXT NOT NULL,
  calculateur_label TEXT NOT NULL,
  contexte TEXT,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  resultat JSONB NOT NULL DEFAULT '{}'::jsonb,
  resume TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_historique_calculs_groupement ON public.historique_calculs(groupement_id, created_at DESC);
CREATE INDEX idx_historique_calculs_etablissement ON public.historique_calculs(etablissement_id, created_at DESC);
CREATE INDEX idx_historique_calculs_calculateur ON public.historique_calculs(calculateur_id, created_at DESC);

ALTER TABLE public.historique_calculs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir historique de mon groupement"
  ON public.historique_calculs FOR SELECT TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Créer historique dans mon groupement"
  ON public.historique_calculs FOR INSERT TO authenticated
  WITH CHECK (user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Supprimer historique de mon groupement"
  ON public.historique_calculs FOR DELETE TO authenticated
  USING (user_belongs_to_groupement(auth.uid(), groupement_id));