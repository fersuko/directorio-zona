import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { Save } from "lucide-react";

interface AddBusinessFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        name: string;
        category: string;
        address: string;
        description: string;
        lat: number;
        lng: number;
        phone?: string;
        website?: string;
    };
}

export function AddBusinessForm({ onSuccess, onCancel, initialData }: AddBusinessFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        category: initialData?.category || "Restaurante",
        address: initialData?.address || "",
        description: initialData?.description || "",
        lat: initialData?.lat || 25.6667,
        lng: initialData?.lng || -100.3167,
        phone: initialData?.phone || "",
        website: initialData?.website || "",
        plan_id: "free"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get current user to assign as owner
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Error: No se pudo identificar al usuario administrador.");
                return;
            }

            const businessData = {
                ...formData,
                owner_id: user.id // Assign current admin as owner initially
            };

            const { error } = await supabase
                .from("businesses")
                .insert([businessData] as any);

            if (error) throw error;

            alert("Negocio agregado exitosamente");
            onSuccess();
        } catch (error: any) {
            console.error("Error adding business:", error);
            alert(`Error al agregar negocio: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Negocio</label>
                    <input
                        required
                        type="text"
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Restaurante">Restaurante</option>
                        <option value="Cafetería">Cafetería</option>
                        <option value="Bar">Bar</option>
                        <option value="Tienda">Tienda</option>
                        <option value="Servicio">Servicio</option>
                        <option value="Salud">Salud</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                        rows={3}
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Dirección</label>
                    <input
                        type="text"
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Latitud</label>
                    <input
                        type="number"
                        step="any"
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.lat}
                        onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Longitud</label>
                    <input
                        type="number"
                        step="any"
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.lng}
                        onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Plan Inicial</label>
                    <select
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.plan_id}
                        onChange={e => setFormData({ ...formData, plan_id: e.target.value })}
                    >
                        <option value="free">Gratuito</option>
                        <option value="launch">Lanzamiento</option>
                        <option value="featured">Destacado</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <Button variant="ghost" onClick={onCancel} type="button">
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Guardando..." : (
                        <span className="flex items-center gap-2">
                            <Save className="w-4 h-4" /> Guardar Negocio
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}
