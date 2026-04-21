ALTER TABLE public.audit_points_results
  ADD COLUMN IF NOT EXISTS updated_by uuid;

CREATE OR REPLACE FUNCTION public.set_audit_point_updated_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_points_results_updated_by ON public.audit_points_results;
CREATE TRIGGER trg_audit_points_results_updated_by
BEFORE INSERT OR UPDATE ON public.audit_points_results
FOR EACH ROW
EXECUTE FUNCTION public.set_audit_point_updated_by();