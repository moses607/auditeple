-- Resserrer la policy INSERT trop permissive
DROP POLICY IF EXISTS "Insérer un groupement" ON public.groupements_comptables;

CREATE POLICY "Insérer un groupement (utilisateur authentifié)"
  ON public.groupements_comptables
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger : auto-rattachement admin du créateur au nouveau groupement
CREATE OR REPLACE FUNCTION public.auto_attach_creator_to_groupement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.user_groupements (user_id, groupement_id, est_admin)
    VALUES (auth.uid(), NEW.id, true)
    ON CONFLICT (user_id, groupement_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_attach_creator ON public.groupements_comptables;
CREATE TRIGGER trg_auto_attach_creator
  AFTER INSERT ON public.groupements_comptables
  FOR EACH ROW EXECUTE FUNCTION public.auto_attach_creator_to_groupement();