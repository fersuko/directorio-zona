import { useState, useEffect } from "react";
import { ImageUpload } from "../ui/ImageUpload";
import { supabase } from "../../lib/supabase";

export function BusinessImageManager() {
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get current user's business
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;

            // Fetch business owned by this user
            supabase
                .from("businesses")
                .select("id, image_url")
                .eq("owner_id", user.id)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Error fetching business:", error);
                        return;
                    }
                    const business = data as { id: number; image_url?: string } | null;
                    if (business) {
                        setBusinessId(business.id);
                        setCurrentImage(business.image_url);
                    }
                    setLoading(false);
                });
        });
    }, []);

    const [saving, setSaving] = useState(false);

    const handleUploadSuccess = async (url: string) => {
        if (!businessId) return;

        try {
            setSaving(true);
            // Update business record with new image URL
            const { error } = await (supabase as any)
                .from("businesses")
                .update({ image_url: url })
                .eq("id", businessId);

            if (error) throw error;

            setCurrentImage(url);
            alert("¡Imagen actualizada con éxito! ✅");
        } catch (error) {
            console.error("Error updating business image:", error);
            alert("Error al guardar la imagen.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

    if (!businessId) {
        return (
            <div className="glass-card p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-center">
                <p className="text-sm text-muted-foreground">
                    Aún no tienes un negocio asignado. Contacta al administrador para vincular tu cuenta.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <ImageUpload
                businessId={businessId}
                currentImageUrl={currentImage}
                onUploadSuccess={handleUploadSuccess}
            />
            {saving && <p className="text-xs text-center text-primary animate-pulse">Guardando cambios en el sistema...</p>}
        </div>
    );
}
