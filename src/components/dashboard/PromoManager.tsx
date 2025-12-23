import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Calendar, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";

interface Promo {
    id: string; // Changed to string (UUID)
    business_id: string;
    title: string;
    description: string | null;
    active: boolean; // Computed field
    valid_until: string | null;
    created_at: string;
}

interface PromoManagerProps {
    planId: 'free' | 'launch' | 'featured';
    businessName?: string;
    businessId?: string; // Added prop for filtering
}

export function PromoManager({ planId, businessName, businessId }: PromoManagerProps) {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPromoData, setNewPromoData] = useState({ title: "", description: "", validUntil: "" });

    useEffect(() => {
        if (businessId) {
            fetchPromos();
        }
    }, [businessId]);

    const fetchPromos = async () => {
        try {
            if (!businessId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("promotions")
                .select("*")
                .eq("business_id", businessId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const typedPromos: Promo[] = (data as any[] || []).map(p => ({
                ...p,
                active: p.valid_until ? new Date(p.valid_until) > new Date() : true
            }));

            setPromos(typedPromos);
        } catch (error) {
            console.error("Error fetching promos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePromo = async () => {
        if (!businessId || !newPromoData.title) return;

        try {
            const { error } = await supabase
                .from("promotions")
                .insert([{
                    business_id: businessId,
                    title: newPromoData.title,
                    description: newPromoData.description,
                    valid_until: newPromoData.validUntil || null
                }] as any);

            if (error) throw error;

            await fetchPromos();
            setIsCreating(false);
            setNewPromoData({ title: "", description: "", validUntil: "" });
        } catch (error) {
            console.error("Error creating promo:", error);
            alert("Error al guardar la promoción");
        }
    };

    const handleDeletePromo = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

        try {
            const { error } = await supabase
                .from("promotions")
                .delete()
                .eq("id", id);

            if (error) throw error;
            await fetchPromos();
        } catch (error) {
            console.error("Error deleting promo:", error);
            alert("Error al eliminar");
        }
    };

    const handleUpgrade = () => {
        const message = `Hola, quiero mejorar mi plan para el negocio "${businessName || 'Mi Negocio'}" a Premium.`;
        const url = `https://wa.me/528112345678?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const canCreatePromos = planId !== 'free';

    if (!businessId) return <div className="text-center p-4">Cargando negocio...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Mis Promociones</h3>
                {canCreatePromos ? (
                    <Button onClick={() => setIsCreating(true)} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Promo
                    </Button>
                ) : (
                    <div className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20">
                        Plan Gratuito
                    </div>
                )}
            </div>

            {!canCreatePromos && (
                <div className="glass-card p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-center space-y-3">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto text-yellow-500">
                        <Tag className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold">Desbloquea las Promociones</h4>
                    <p className="text-sm text-muted-foreground">
                        Mejora tu plan para crear ofertas irresistibles y atraer más clientes.
                    </p>
                    <Button variant="premium" size="sm" className="w-full max-w-xs" onClick={handleUpgrade}>
                        Mejorar Plan
                    </Button>
                </div>
            )}

            {isCreating && (
                <div className="glass-card p-4 rounded-xl space-y-4 border border-primary/20">
                    <h4 className="font-medium">Crear Nueva Promoción</h4>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Título (ej. 2x1 en Tacos)"
                            value={newPromoData.title}
                            onChange={(e) => setNewPromoData({ ...newPromoData, title: e.target.value })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                        <textarea
                            placeholder="Descripción y condiciones..."
                            value={newPromoData.description}
                            onChange={(e) => setNewPromoData({ ...newPromoData, description: e.target.value })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 h-20 resize-none"
                        />
                        <input
                            type="date"
                            value={newPromoData.validUntil}
                            onChange={(e) => setNewPromoData({ ...newPromoData, validUntil: e.target.value })}
                            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                        <div className="flex gap-2">
                            <Button variant="premium" size="sm" onClick={handleSavePromo}>
                                Guardar
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setIsCreating(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
                ) : promos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No tienes promociones activas.</div>
                ) : (
                    promos.map((promo) => (
                        <div
                            key={promo.id}
                            className={`glass-card p-4 rounded-xl flex justify-between items-start ${!promo.active ? "opacity-60" : ""
                                }`}
                        >
                            <div className="flex gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${promo.active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{promo.title}</h4>
                                    <p className="text-xs text-muted-foreground">{promo.description}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/80">
                                        <Calendar className="w-3 h-3" />
                                        <span>Vence: {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString() : 'Siempre'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeletePromo(promo.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
