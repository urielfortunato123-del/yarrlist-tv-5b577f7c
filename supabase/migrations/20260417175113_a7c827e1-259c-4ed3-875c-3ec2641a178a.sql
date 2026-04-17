CREATE TABLE public.app_version (
  id INT PRIMARY KEY DEFAULT 1,
  version TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.app_version ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app version"
ON public.app_version FOR SELECT
USING (true);

INSERT INTO public.app_version (id, version) VALUES (1, '1.0.0');

ALTER PUBLICATION supabase_realtime ADD TABLE public.app_version;
ALTER TABLE public.app_version REPLICA IDENTITY FULL;