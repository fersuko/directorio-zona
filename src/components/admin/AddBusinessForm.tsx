import { useState } from "react";
import { supabase } from "../../lib/supabase"; // Main client (Admin session)
import { createClient } from "@supabase/supabase-js"; // For temp client
import { Button } from "../ui/Button";
import { Save, MapPin, Loader2, CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { geocodeAddress } from "../../lib/geocoding";

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
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeResult, setGeocodeResult] = useState("");

    // Owner Management State
    const [ownerEmail, setOwnerEmail] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [ownerStatus, setOwnerStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle');
    const [foundOwnerName, setFoundOwnerName] = useState("");

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

    const handleGeocode = async () => {
        if (!formData.address.trim()) {
            alert("Por favor ingresa una dirección primero");
            return;
        }

        setGeocoding(true);
        setGeocodeResult("");

        try {
            const result = await geocodeAddress(formData.address, "Monterrey, Nuevo León");

            if (result.success) {
                setFormData({
                    ...formData,
                    lat: result.lat,
                    lng: result.lng
                });
                setGeocodeResult(`✅ Encontrado: ${result.displayName}`);
            } else {
                setGeocodeResult(`❌ ${result.error}`);
            }
        } catch (error) {
            setGeocodeResult("❌ Error al buscar la dirección");
        } finally {
            setGeocoding(false);
        }
    };

    const checkOwnerEmail = async () => {
        if (!ownerEmail.trim() || !ownerEmail.includes('@')) return;

        setOwnerStatus('checking');
        setOwnerPassword(""); // Reset password if re-checking

        try {
            const { data } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('email', ownerEmail.trim().toLowerCase())
                .single();

            if (data) {
                setOwnerStatus('found');
                setFoundOwnerName((data as any).full_name || "Usuario existente");
            } else {
                setOwnerStatus('not_found');
            }
        } catch (error) {
            // Assume not found if error (e.g. 0 rows)
            setOwnerStatus('not_found');
        }
    };

    const createNewOwner = async () => {
        // Create a temporary client to avoid logging out the admin
        const tempClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false, // Critical: Don't save this session
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );

        const { data, error } = await tempClient.auth.signUp({
            email: ownerEmail,
            password: ownerPassword,
        });

        if (error) throw error;
        return data.user?.id;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Error: No se pudo identificar al usuario administrador.");
                return;
            }

            let finalOwnerId = user.id; // Default to admin
            let newAccountCreated = false;

            // Handle Owner Logic
            if (ownerEmail.trim()) {
                if (ownerStatus === 'found') {
                    // Fetch ID again to be safe
                    const { data } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', ownerEmail.trim().toLowerCase())
                        .single();
                    if (data) finalOwnerId = (data as any).id;
                }
                else if (ownerStatus === 'not_found') {
                    if (!ownerPassword || ownerPassword.length < 6) {
                        alert("Para registrar un nuevo usuario, la contraseña debe tener al menos 6 caracteres.");
                        setLoading(false);
                        return;
                    }

                    try {
                        const newUserId = await createNewOwner();
                        if (newUserId) {
                            finalOwnerId = newUserId;
                            newAccountCreated = true;
                        } else {
                            throw new Error("No se pudo obtener el ID del nuevo usuario.");
                        }
                    } catch (err: any) {
                        alert(`Error creando usuario: ${err.message}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            const businessData = {
                ...formData,
                owner_id: finalOwnerId
            };

            const { error } = await supabase
                .from("businesses")
                .insert([businessData] as any);

            if (error) throw error;

            // Auto-promote user to 'business_owner' if they are just a 'user'
            // This ensures they get access to the dashboard
            if (finalOwnerId !== user.id) { // Don't change admin's role
                const { error: roleError } = await (supabase
                    .from('profiles') as any) // Cast to any to avoid strict typing issues
                    .update({ role: 'business_owner' })
                    .eq('id', finalOwnerId)
                    .eq('role', 'user'); // Only promote 'user', don't demote 'admin'

                if (roleError) console.warn("Could not promote user to business_owner:", roleError);
            }

            let successMsg = `✅ Negocio "${formData.name}" agregado.`;
            if (newAccountCreated) successMsg += `\n👤 Nuevo usuario creado y asignado como Dueño.`;
            else if (ownerEmail && ownerStatus === 'found') successMsg += `\n👤 Asignado a usuario existente (Promovido a Dueño).`;

            alert(successMsg);
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
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Ej: Av. Constitución 123, Centro"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGeocode}
                            disabled={geocoding || !formData.address.trim()}
                        >
                            {geocoding ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Buscando...
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Buscar
                                </>
                            )}
                        </Button>
                    </div>
                    {geocodeResult && (
                        <p className="text-xs mt-1 text-muted-foreground">{geocodeResult}</p>
                    )}
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
                    <label className="text-sm font-medium">Teléfono (opcional)</label>
                    <input
                        type="tel"
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ej: 81 1234 5678"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Sitio Web (opcional)</label>
                    <input
                        type="url"
                        className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                        placeholder="Ej: https://ejemplo.com"
                    />
                </div>

                <div className="space-y-2 md:col-span-2 border-t border-white/10 pt-4">
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        Dueño del Negocio / Cliente
                    </label>

                    <div className="flex gap-2">
                        <input
                            type="email"
                            className="flex-1 p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            value={ownerEmail}
                            onChange={e => {
                                setOwnerEmail(e.target.value);
                                setOwnerStatus('idle');
                            }}
                            onBlur={checkOwnerEmail}
                            placeholder="cliente@email.com"
                        />
                        {ownerStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground self-center" />}
                        {ownerStatus === 'found' && <CheckCircle className="w-5 h-5 text-green-500 self-center" />}
                        {ownerStatus === 'not_found' && ownerEmail && <AlertCircle className="w-5 h-5 text-yellow-500 self-center" />}
                    </div>

                    {ownerStatus === 'found' && (
                        <p className="text-xs text-green-400 mt-1">
                            ✓ Usuario detectado: {foundOwnerName}
                        </p>
                    )}

                    {ownerStatus === 'not_found' && ownerEmail && (
                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-3">
                            <div className="flex items-start gap-2">
                                <UserPlus className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-yellow-500">Nuevo Usuario</p>
                                    <p className="text-xs text-muted-foreground">
                                        No existe cuenta con este correo. Asigna una contraseña provisional para crearla ahora.
                                    </p>
                                </div>
                            </div>
                            <input
                                type="password"
                                className="w-full p-2 bg-black/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-500/50 outline-none"
                                value={ownerPassword}
                                onChange={e => setOwnerPassword(e.target.value)}
                                placeholder="Contraseña provisional (min. 6 carácteres)"
                            />
                        </div>
                    )}

                    {!ownerEmail && (
                        <p className="text-xs text-muted-foreground mt-1">
                            * Si se deja vacío, se asignará a tu cuenta de Admin.
                        </p>
                    )}
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
