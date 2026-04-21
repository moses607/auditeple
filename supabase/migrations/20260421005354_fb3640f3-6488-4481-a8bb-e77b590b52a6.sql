
-- ───────────────────────────────────────────────────────────────────
-- ENUMS
-- ───────────────────────────────────────────────────────────────────
CREATE TYPE public.audit_type AS ENUM ('periodique', 'thematique', 'inopine', 'prise_fonction');
CREATE TYPE public.audit_status AS ENUM ('en_cours', 'cloture', 'envoye_contradiction', 'contradictoire_clos');
CREATE TYPE public.point_result_status AS ENUM ('non_audite', 'conforme', 'anomalie_mineure', 'anomalie_majeure', 'non_applicable');
CREATE TYPE public.pv_status AS ENUM ('brouillon', 'envoye', 'observe', 'finalise');

-- ───────────────────────────────────────────────────────────────────
-- TABLE: audits
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupement_id UUID NOT NULL,
  etablissement_id UUID NOT NULL,
  user_id UUID NOT NULL,
  libelle TEXT NOT NULL,
  type_audit public.audit_type NOT NULL DEFAULT 'periodique',
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  date_audit DATE NOT NULL DEFAULT CURRENT_DATE,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "domaine_id": ["point_1", "point_2", ...] }
  status public.audit_status NOT NULL DEFAULT 'en_cours',
  agent_comptable_id UUID,
  ordonnateur_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir audits de mon groupement" ON public.audits
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Créer audit dans mon groupement" ON public.audits
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_groupement(auth.uid(), groupement_id) AND user_id = auth.uid());

CREATE POLICY "Modifier audits de mon groupement" ON public.audits
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Supprimer audits de mon groupement" ON public.audits
  FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE TRIGGER trg_audits_updated
  BEFORE UPDATE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ───────────────────────────────────────────────────────────────────
-- TABLE: audit_points_results
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE public.audit_points_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  domaine_id TEXT NOT NULL,
  point_index INTEGER NOT NULL,
  point_libelle TEXT NOT NULL,
  status public.point_result_status NOT NULL DEFAULT 'non_audite',
  constat TEXT,
  anomalies TEXT,
  action_corrective TEXT,
  responsable_action TEXT,
  delai_action DATE,
  pieces_jointes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (audit_id, domaine_id, point_index)
);

ALTER TABLE public.audit_points_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir résultats de mes audits" ON public.audit_points_results
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = audit_points_results.audit_id
      AND public.user_belongs_to_groupement(auth.uid(), a.groupement_id)
  ));

CREATE POLICY "Créer résultats dans mes audits" ON public.audit_points_results
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = audit_points_results.audit_id
      AND public.user_belongs_to_groupement(auth.uid(), a.groupement_id)
  ));

CREATE POLICY "Modifier résultats de mes audits" ON public.audit_points_results
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = audit_points_results.audit_id
      AND public.user_belongs_to_groupement(auth.uid(), a.groupement_id)
  ));

CREATE POLICY "Supprimer résultats de mes audits" ON public.audit_points_results
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = audit_points_results.audit_id
      AND public.user_belongs_to_groupement(auth.uid(), a.groupement_id)
  ));

CREATE TRIGGER trg_audit_points_updated
  BEFORE UPDATE ON public.audit_points_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ───────────────────────────────────────────────────────────────────
-- TABLE: pv_contradictoires
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE public.pv_contradictoires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  groupement_id UUID NOT NULL,
  status public.pv_status NOT NULL DEFAULT 'brouillon',
  email_ordonnateur TEXT,
  envoye_at TIMESTAMPTZ,
  delai_jours INTEGER NOT NULL DEFAULT 15,
  observations_ordonnateur JSONB DEFAULT '{}'::jsonb, -- { "point_id": "observation" }
  observation_globale TEXT,
  signature_ordonnateur_at TIMESTAMPTZ,
  signature_ordonnateur_ip TEXT,
  finalise_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pv_contradictoires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir PV de mon groupement" ON public.pv_contradictoires
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Créer PV dans mon groupement" ON public.pv_contradictoires
  FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Modifier PV de mon groupement" ON public.pv_contradictoires
  FOR UPDATE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE POLICY "Supprimer PV de mon groupement" ON public.pv_contradictoires
  FOR DELETE TO authenticated
  USING (public.user_belongs_to_groupement(auth.uid(), groupement_id));

CREATE TRIGGER trg_pv_updated
  BEFORE UPDATE ON public.pv_contradictoires
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ───────────────────────────────────────────────────────────────────
-- TABLE: pv_access_tokens (lien magique sécurisé)
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE public.pv_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pv_id UUID NOT NULL REFERENCES public.pv_contradictoires(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email_destinataire TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pv_tokens_token ON public.pv_access_tokens(token);

ALTER TABLE public.pv_access_tokens ENABLE ROW LEVEL SECURITY;

-- Pas de policy SELECT/INSERT publique : tout passe par l'edge function en service-role.
-- Un user authentifié peut voir les tokens de son groupement (via PV).
CREATE POLICY "Voir tokens de mes PV" ON public.pv_access_tokens
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pv_contradictoires p
    WHERE p.id = pv_access_tokens.pv_id
      AND public.user_belongs_to_groupement(auth.uid(), p.groupement_id)
  ));

-- ───────────────────────────────────────────────────────────────────
-- INDEX utiles
-- ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_audits_groupement ON public.audits(groupement_id);
CREATE INDEX idx_audits_etablissement ON public.audits(etablissement_id);
CREATE INDEX idx_audit_points_audit ON public.audit_points_results(audit_id);
CREATE INDEX idx_pv_audit ON public.pv_contradictoires(audit_id);
CREATE INDEX idx_pv_groupement ON public.pv_contradictoires(groupement_id);
