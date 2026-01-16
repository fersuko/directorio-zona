import { useState } from "react";
import { supabase } from "../../lib/supabase"; // Main client (Admin session)
import { createClient } from "@supabase/supabase-js"; // For temp client
import { Button } from "../ui/Button";
import { Save, MapPin, Loader2, CheckCircle, AlertCircle, UserPlus, Search as SearchIcon, Globe } from "lucide-react";
import { geocodeAddress, getGooglePhotoUrl } from "../../lib/geocoding";
import { uploadBusinessPhoto } from "../../lib/storage";
import { useGoogleMaps } from "../../hooks/useGoogleMaps";

interface AddBusinessFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        id?: string;
        name: string;
        category: string;
        address: string;
        description: string;
        lat: number;
        lng: number;
        phone?: string;
        website?: string;
        group_name?: string;
        image_url?: string;
        plan_id?: string;
        owner_email?: string;
        owner_id?: string;
    };
}

export function AddBusinessForm({ onSuccess, onCancel, initialData }: AddBusinessFormProps) {
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeResult, setGeocodeResult] = useState("");
    useGoogleMaps();

    // Google Places Search State
    const [googleSearch, setGoogleSearch] = useState("");
    const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
    const [googleResults, setGoogleResults] = useState<any[]>([]);
    const [selectedPhotoRef, setSelectedPhotoRef] = useState<string | null>(null);

    // Owner Management State
    const [ownerEmail, setOwnerEmail] = useState(initialData?.owner_email || "");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [ownerStatus, setOwnerStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>(
        initialData?.owner_email ? 'found' : 'idle'
    );
    const [foundOwnerName, setFoundOwnerName] = useState(initialData?.owner_email ? "Dueño actual" : "");

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        category: initialData?.category || "Restaurante",
        group_name: initialData?.group_name || "Gastronomía",
        address: initialData?.address || "",
        description: initialData?.description || "",
        lat: initialData?.lat || 25.6667,
        lng: initialData?.lng || -100.3167,
        phone: initialData?.phone || "",
        website: initialData?.website || "",
        image_url: initialData?.image_url || "",
        plan_id: initialData?.plan_id || "free"
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

    const handleGoogleSearch = async () => {
        if (!googleSearch.trim() || !(window as any).google?.maps) return;

        setIsSearchingGoogle(true);
        setGoogleResults([]);

        try {
            const service = new (window as any).google.maps.places.PlacesService(document.createElement('div'));

            const request = {
                query: googleSearch,
                location: new (window as any).google.maps.LatLng(25.6866, -100.3161), // Bias to Monterrey Centro
                radius: 10000,
            };

            service.textSearch(request, (results: any[], status: any) => {
                setIsSearchingGoogle(false);
                if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
                    const mappedResults = results.map(place => ({
                        name: place.name,
                        address: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        photoReference: place.photos?.[0]?.photo_reference,
                        placeId: place.place_id
                    }));
                    setGoogleResults(mappedResults);
                } else {
                    alert("No se encontraron resultados o la API no está disponible.");
                }
            });
        } catch (error) {
            console.error("Error searching google:", error);
            setIsSearchingGoogle(false);
        }
    };

    const selectGooglePlace = (place: any) => {
        setFormData({
            ...formData,
            name: place.name,
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            image_url: place.photoReference ? getGooglePhotoUrl(place.photoReference) : formData.image_url
        });
        setSelectedPhotoRef(place.photoReference || null);
        setGoogleResults([]);
        setGoogleSearch("");
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

            // Handle Photo Persistence
            let finalImageUrl = formData.image_url;
            if (selectedPhotoRef) {
                const uploadedUrl = await uploadBusinessPhoto(selectedPhotoRef, formData.name);
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl;
                }
            }

            const businessData = {
                ...formData,
                image_url: finalImageUrl,
                owner_id: finalOwnerId,
                is_premium: formData.plan_id !== 'free',
                updated_at: new Date().toISOString()
            };

            if (initialData?.id) {
                // UPDATE existing
                const { error } = await (supabase
                    .from("businesses") as any)
                    .update(businessData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                // INSERT new
                const { error } = await (supabase
                    .from("businesses") as any)
                    .insert([businessData]);
                if (error) throw error;
            }

            let successMsg = `✅ Negocio "${formData.name}" guardado correctamente.`;
            if (newAccountCreated) successMsg += `\n👤 Nuevo usuario creado y asignado como Dueño.`;
            else if (ownerEmail && ownerStatus === 'found') successMsg += `\n👤 Asignado a usuario existente.`;

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
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Google Search Auto-fill */}
            <div className="bg-brand-blue/10 border border-brand-blue/20 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-brand-blue">
                    <Globe className="w-5 h-5" />
                    <h3 className="font-bold">Auto-rellenar con Google Maps</h3>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar negocio en Monterrey..."
                            className="w-full pl-9 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/50"
                            value={googleSearch}
                            onChange={e => setGoogleSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleGoogleSearch()}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleGoogleSearch}
                        disabled={isSearchingGoogle || !googleSearch.trim()}
                    >
                        {isSearchingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                    </Button>
                </div>

                {googleResults.length > 0 && (
                    <div className="bg-black/40 rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                        {googleResults.map((res, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => selectGooglePlace(res)}
                                className="w-full text-left p-3 hover:bg-brand-blue/20 transition-colors flex flex-col gap-1"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-sm">{res.name}</span>
                                        <span className="text-xs text-muted-foreground">{res.address}</span>
                                    </div>
                                    {res.photoReference && (
                                        <img
                                            src={getGooglePhotoUrl(res.photoReference, 100)}
                                            alt=""
                                            className="w-12 h-12 rounded-lg object-cover bg-white/5"
                                        />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-[10px] text-muted-foreground italic">
                    * Esta función utiliza inteligencia geoespacial para encontrar datos oficiales velozmente.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        <input
                            list="categories-list"
                            type="text"
                            className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Escribe o selecciona una categoría..."
                        />
                        <datalist id="categories-list">
                            <option value="Restaurante" />
                            <option value="Cafetería" />
                            <option value="Bar" />
                            <option value="Tienda" />
                            <option value="Servicios" />
                            <option value="Salud" />
                            <option value="Entretenimiento" />
                            <option value="Educación" />
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Grupo (Giro)</label>
                        <input
                            type="text"
                            className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            value={formData.group_name}
                            onChange={e => setFormData({ ...formData, group_name: e.target.value })}
                            placeholder="Ej: Gastronomía, Salud, Deporte"
                        />
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

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Vista Previa de Imagen</label>
                        <div className="flex gap-4 items-start">
                            {formData.image_url && (
                                <img
                                    src={formData.image_url}
                                    alt="Vista previa"
                                    className="w-32 h-32 rounded-xl object-cover border border-white/10"
                                />
                            )}
                            <div className="flex-1 space-y-2">
                                <label className="text-xs text-muted-foreground uppercase">URL de Imagen (Logo/Banner)</label>
                                <input
                                    type="url"
                                    className="w-full p-2 bg-muted/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-xs"
                                    value={formData.image_url}
                                    onChange={e => {
                                        setFormData({ ...formData, image_url: e.target.value });
                                        setSelectedPhotoRef(null); // Clear ref if manually changed
                                    }}
                                    placeholder="Ej: https://unsplash.com/foto..."
                                />
                                {selectedPhotoRef && (
                                    <p className="text-[10px] text-brand-blue flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Imagen seleccionada de Google (Será guardada en tu storage)
                                    </p>
                                )}
                            </div>
                        </div>
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
                            <option value="exchange">Intercambio</option>
                            <option value="premium">Premium</option>
                            <option value="launch">Lanzamiento</option>
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
        </div>
    );
}
