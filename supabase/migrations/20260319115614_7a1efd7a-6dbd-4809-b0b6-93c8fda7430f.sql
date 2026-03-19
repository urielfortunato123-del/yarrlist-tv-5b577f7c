
-- Table to store app changelogs/updates
CREATE TABLE public.app_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow anyone to read updates (public app, no auth)
ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read updates"
ON public.app_updates
FOR SELECT
USING (true);

-- Seed with current changelog
INSERT INTO public.app_updates (version, title, items) VALUES (
  '1.1.0',
  'Novidades do Âncora TV!',
  '[
    {"icon": "download", "title": "Instale no Celular", "description": "Agora você pode instalar o Âncora TV direto no seu celular como um app! Basta clicar em \"Instalar App\" no rodapé."},
    {"icon": "share", "title": "Compartilhe com Amigos", "description": "Use o botão \"Compartilhar\" no rodapé para enviar o Âncora TV para seus amigos via WhatsApp, Telegram e mais!"},
    {"icon": "sparkles", "title": "Novo Nome", "description": "O app agora se chama Âncora TV! Mesmo conteúdo, nova identidade. ⚓"}
  ]'
);
