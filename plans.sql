-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY, -- 'free', 'launch', 'featured'
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plans
INSERT INTO public.plans (id, name, description, price, features) VALUES
('free', 'Gratuito', 'Plan básico para tener presencia en el directorio.', 0, '["basic_listing"]'::jsonb),
('launch', 'Plan de Lanzamiento', 'Plan especial para fundadores. Mismos beneficios que Destacado.', 0, '["cover_photo", "promos", "stats", "premium_badge"]'::jsonb),
('featured', 'Plan Destacado', 'Plan completo para maximizar visibilidad.', 499, '["cover_photo", "promos", "stats", "premium_badge"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    features = EXCLUDED.features;

-- Add plan_id to businesses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'plan_id') THEN
        ALTER TABLE public.businesses ADD COLUMN plan_id TEXT REFERENCES public.plans(id) DEFAULT 'free';
    END IF;
END $$;

-- Update existing premium businesses to 'featured' (optional migration)
-- UPDATE public.businesses SET plan_id = 'featured' WHERE is_premium = true;
