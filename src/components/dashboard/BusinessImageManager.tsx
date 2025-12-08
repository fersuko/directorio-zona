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

    const handleUploadSuccess = async (url: string) => {
        if (!businessId) return;

        try {
            // Update business record with new image URL
            // Using raw REST API since auto-generated types don't include image_url yet
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const session = await supabase.auth.getSession();

            const response = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${businessId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey || '',
                    'Authorization': `Bearer ${session.data.session?.access_token || ''}`
                },
                body: JSON.stringify({ image_url: url })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to update image: ${error}`);
            }

            setCurrentImage(url);
            alert("¡Imagen actualizada con éxito! ✅");
        } catch (error) {
            console.error("Error updating business image:", error);
            alert("Error al guardar la imagen. Por favor intenta de nuevo.");
        }
    };

    if (loading) {
        return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;
    }

    if (!businessId) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                    No se encontró ningún negocio asociado a tu cuenta.
                </p>
                <p className="text-sm text-muted-foreground">
                    Contacta a soporte para registrar tu negocio.
                </p>
            </div>
        );
    }

    return (
        <ImageUpload
            businessId={businessId}
            currentImageUrl={currentImage}
            onUploadSuccess={handleUploadSuccess}
        />
    );
}
