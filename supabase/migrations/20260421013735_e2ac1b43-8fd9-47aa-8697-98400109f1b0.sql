
-- ═══ TABLES NOUVELLES ═══

CREATE TABLE public.mapping_audit_risque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupement_id UUID,                  -- NULL = mapping global (préinstallé)
  domaine_id TEXT NOT NULL,            -- ex. 'depenses', 'recettes'
  point_index INTEGER NOT NULL,        -- index du point dans le domaine
  point_libelle TEXT NOT NULL,         -- snapshot lisible
  risque_processus TEXT NOT NULL,      -- ex. 'P05 — Cycle dépenses'
  risque_libelle TEXT NOT NULL,        -- libellé du risque ciblé
  rubrique TEXT NOT NULL,              -- une des 8 rubriques scoring
  ponderation NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mapping_audit_risque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir mapping global ou de mon groupement"
  ON public.mapping_audit_risque FOR SELECT TO authenticated
  USING (groupement_id IS NULL OR public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Créer mapping de mon groupement"
  ON public.mapping_audit_risque FOR INSERT TO authenticated
  WITH CHECK (groupement_id IS NULL OR public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Modifier mapping de mon groupement"
  ON public.mapping_audit_risque FOR UPDATE TO authenticated
  USING (groupement_id IS NOT NULL AND public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Supprimer mapping de mon groupement"
  ON public.mapping_audit_risque FOR DELETE TO authenticated
  USING (groupement_id IS NOT NULL AND public.user_belongs_to_groupement(auth.uid(), groupement_id));


CREATE TABLE public.risque_ajustements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupement_id UUID NOT NULL,
  etablissement_id UUID,
  risque_processus TEXT NOT NULL,
  risque_libelle TEXT NOT NULL,
  criticite_actuelle TEXT NOT NULL,    -- 'faible'|'moyen'|'majeur'|'critique'
  criticite_suggeree TEXT NOT NULL,
  score_anomalies NUMERIC NOT NULL,
  motif TEXT NOT NULL,                 -- 'relevement'|'allègement'
  source_audit_id UUID,
  status TEXT NOT NULL DEFAULT 'en_attente', -- 'en_attente'|'accepte'|'refuse'
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risque_ajustements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir ajustements de mon groupement"
  ON public.risque_ajustements FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Créer ajustements de mon groupement"
  ON public.risque_ajustements FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Modifier ajustements de mon groupement"
  ON public.risque_ajustements FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Supprimer ajustements de mon groupement"
  ON public.risque_ajustements FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE TRIGGER trg_risque_ajustements_updated BEFORE UPDATE ON public.risque_ajustements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.scoring_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupement_id UUID NOT NULL,
  etablissement_id UUID,               -- NULL = consolidé groupement
  periode TEXT NOT NULL,               -- 'YYYY-MM'
  score_global NUMERIC NOT NULL,
  scores_rubriques JSONB NOT NULL DEFAULT '{}'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_scoring_snapshot ON public.scoring_snapshots
  (groupement_id, COALESCE(etablissement_id, '00000000-0000-0000-0000-000000000000'::uuid), periode);
ALTER TABLE public.scoring_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir snapshots de mon groupement"
  ON public.scoring_snapshots FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Créer snapshots de mon groupement"
  ON public.scoring_snapshots FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Modifier snapshots de mon groupement"
  ON public.scoring_snapshots FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Supprimer snapshots de mon groupement"
  ON public.scoring_snapshots FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));


CREATE TABLE public.rapports_maturite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupement_id UUID NOT NULL,
  etablissement_id UUID,               -- NULL = rapport consolidé
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  score_global NUMERIC NOT NULL,
  destinataires JSONB NOT NULL DEFAULT '[]'::jsonb,
  objet TEXT,
  message TEXT,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'brouillon', -- 'brouillon'|'envoye'|'echec'
  envoye_at TIMESTAMPTZ,
  envoye_par UUID,
  ip_envoi TEXT,
  accuse_reception JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rapports_maturite ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir rapports de mon groupement"
  ON public.rapports_maturite FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Créer rapports de mon groupement"
  ON public.rapports_maturite FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Modifier rapports de mon groupement"
  ON public.rapports_maturite FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE POLICY "Supprimer rapports de mon groupement"
  ON public.rapports_maturite FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));
CREATE TRIGGER trg_rapports_maturite_updated BEFORE UPDATE ON public.rapports_maturite
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ═══ ÉVOLUTIONS TABLES EXISTANTES ═══

ALTER TABLE public.groupements_comptables
  ADD COLUMN IF NOT EXISTS lycee_siege_id UUID,
  ADD COLUMN IF NOT EXISTS signature_ac_url TEXT,
  ADD COLUMN IF NOT EXISTS devise TEXT DEFAULT 'Liberté · Égalité · Fraternité',
  ADD COLUMN IF NOT EXISTS email_rectorat_daf TEXT,
  ADD COLUMN IF NOT EXISTS email_rectorat_inspection TEXT,
  ADD COLUMN IF NOT EXISTS email_crc TEXT,
  ADD COLUMN IF NOT EXISTS seuil_alerte_score INTEGER DEFAULT 60;

ALTER TABLE public.etablissements
  ADD COLUMN IF NOT EXISTS score_cicf_actuel NUMERIC,
  ADD COLUMN IF NOT EXISTS score_cicf_maj_at TIMESTAMPTZ;


-- ═══ STORAGE BUCKET (logos & signatures) ═══

INSERT INTO storage.buckets (id, name, public)
VALUES ('groupement-assets', 'groupement-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lecture publique groupement-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'groupement-assets');

CREATE POLICY "Upload authenticated groupement-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'groupement-assets');

CREATE POLICY "Update authenticated groupement-assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'groupement-assets');

CREATE POLICY "Delete authenticated groupement-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'groupement-assets');
