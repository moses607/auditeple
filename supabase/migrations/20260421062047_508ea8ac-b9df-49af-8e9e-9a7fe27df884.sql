-- Active REPLICA IDENTITY FULL pour recevoir les anciennes lignes (utile pour DELETE/UPDATE)
ALTER TABLE public.calendrier_annuel REPLICA IDENTITY FULL;
ALTER TABLE public.plan_actions REPLICA IDENTITY FULL;

-- Ajoute les tables à la publication realtime (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'calendrier_annuel'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calendrier_annuel;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'plan_actions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_actions;
  END IF;
END $$;