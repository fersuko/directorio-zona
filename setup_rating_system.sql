-- 1. Agregar columnas de calificación a la tabla businesses
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. Asegurar que los perfiles sean públicos (para ver nombres en las reseñas)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- 3. Función para recalcular el promedio y conteo
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.businesses
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews
            WHERE business_id = NEW.business_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE business_id = NEW.business_id
        )
    WHERE id = NEW.business_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para manejar borrados (OLD.business_id)
CREATE OR REPLACE FUNCTION public.update_business_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.businesses
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews
            WHERE business_id = OLD.business_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE business_id = OLD.business_id
        )
    WHERE id = OLD.business_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Triggers
DROP TRIGGER IF EXISTS on_review_added ON public.reviews;
CREATE TRIGGER on_review_added
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

DROP TRIGGER IF EXISTS on_review_deleted ON public.reviews;
CREATE TRIGGER on_review_deleted
AFTER DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_business_rating_on_delete();
