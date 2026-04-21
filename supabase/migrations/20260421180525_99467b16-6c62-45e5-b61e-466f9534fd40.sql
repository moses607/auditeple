-- Crée une fonction RPC atomique pour créer un groupement et lier le créateur,
-- contournant les évaluations RLS prématurées sur le RETURNING.
CREATE OR REPLACE FUNCTION public.create_groupement_with_link(_payload jsonb)
RETURNS public.groupements_comptables
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.groupements_comptables;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  INSERT INTO public.groupements_comptables (
    libelle, academie, siege, telephone, email_agent_comptable,
    email_rectorat_daf, email_rectorat_inspection, email_crc,
    couleur_principale, devise, seuil_alerte_score, logo_url,
    signature_ac_url, lycee_siege_id, actif
  )
  VALUES (
    COALESCE(_payload->>'libelle', 'Nouveau groupement'),
    COALESCE(_payload->>'academie', 'Guadeloupe'),
    _payload->>'siege',
    _payload->>'telephone',
    _payload->>'email_agent_comptable',
    _payload->>'email_rectorat_daf',
    _payload->>'email_rectorat_inspection',
    _payload->>'email_crc',
    COALESCE(_payload->>'couleur_principale', '#1e40af'),
    COALESCE(_payload->>'devise', 'Liberté · Égalité · Fraternité'),
    COALESCE((_payload->>'seuil_alerte_score')::int, 60),
    _payload->>'logo_url',
    _payload->>'signature_ac_url',
    NULLIF(_payload->>'lycee_siege_id','')::uuid,
    COALESCE((_payload->>'actif')::boolean, true)
  )
  RETURNING * INTO _row;

  INSERT INTO public.user_groupements (user_id, groupement_id, est_admin)
  VALUES (_uid, _row.id, true)
  ON CONFLICT (user_id, groupement_id) DO NOTHING;

  RETURN _row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_groupement_with_link(jsonb) TO authenticated;