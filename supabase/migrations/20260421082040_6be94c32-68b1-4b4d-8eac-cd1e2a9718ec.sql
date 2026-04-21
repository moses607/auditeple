ALTER TABLE public.audits REPLICA IDENTITY FULL;
ALTER TABLE public.audit_points_results REPLICA IDENTITY FULL;
ALTER TABLE public.risque_ajustements REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.audits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_points_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risque_ajustements;