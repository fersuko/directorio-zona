import { useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { supabase } from '../../lib/supabase';
import { Search, MapPin, Download, Loader2, CheckCircle, AlertTriangle, Store, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { uploadBusinessPhoto } from '../../lib/storage';
import { calculateDistance } from '../../utils/distance';
import { MONTERREY_CENTRO, MAX_RADIUS_KM } from '../../constants/geo';

interface GooglePlace {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
    types?: string[];
    geometry?: {
        location: {
            lat: () => number;
            lng: () => number;
        }
    };
    photos?: {
        getUrl: (opts: { maxWidth: number; maxHeight: number }) => string;
        photo_reference?: string;
    }[];
    formatted_phone_number?: string;
    website?: string;
}

declare var google: any;

interface Props {
    currentUserId?: string;
}

export const SmartIngestion = ({ currentUserId }: Props) => {
    const { isLoaded, loadError } = useGoogleMaps();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<GooglePlace[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searching, setSearching] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importStats, setImportStats] = useState<{ success: number; failed: number } | null>(null);

    const [currentImport, setCurrentImport] = useState<string>("");


    const searchPlaces = () => {
        if (!(window as any).google?.maps || !searchTerm) return;

        setSearching(true);
        setResults([]);
        setImportStats(null);

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const allResults: GooglePlace[] = [];
        const MAX_PAGES = 1; // Solo 1 página = 20 resultados máximo para ahorrar costos
        let pageCount = 0;

        const request = {
            query: searchTerm,
            location: new (window as any).google.maps.LatLng(MONTERREY_CENTRO),
            radius: MAX_RADIUS_KM * 1000, // 2000m
        };

        const callback = (places: any[] | null, status: any, pagination: any) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && places) {
                // Filter by quality markers (Google status/rating)
                const qualityPlaces = places.filter(p => (p.rating || 0) >= 3.5 || (p.user_ratings_total || 0) > 5);

                // Hyper-Strict Geographical Post-Filtering (ABSOLUTE 2KM)
                const goodPlaces = qualityPlaces.filter(p => {
                    const lat = typeof p.geometry?.location.lat === 'function' ? p.geometry.location.lat() : p.geometry?.location.lat;
                    const lng = typeof p.geometry?.location.lng === 'function' ? p.geometry.location.lng() : p.geometry?.location.lng;

                    if (!lat || !lng) return false;

                    const dist = calculateDistance(MONTERREY_CENTRO.lat, MONTERREY_CENTRO.lng, lat, lng);

                    if (dist > MAX_RADIUS_KM) {
                        console.log(`🚫 Filtrado por distancia extra-estricta (> ${MAX_RADIUS_KM}km): ${p.name} a ${dist.toFixed(2)}km`);
                        return false;
                    }

                    console.log(`✅ Aceptado por proximidad: ${p.name} a ${dist.toFixed(2)}km`);
                    return true;
                });

                allResults.push(...(goodPlaces as any[]));
                setResults([...allResults]); // Partial update for better UX

                pageCount++;
                if (pagination && pagination.hasNextPage && pageCount < MAX_PAGES) {
                    // Google requires a short delay before the next page token is valid
                    setTimeout(() => pagination.nextPage(), 2000);
                } else {
                    setSearching(false);
                }
            } else {
                console.warn("Google Maps Search failed or ended:", status);
                setSearching(false);
            }
        };

        service.textSearch(request, callback);
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === results.length && results.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(results.map(r => r.place_id)));
        }
    };

    const handleImport = async () => {
        const toImport = results.filter(r => selectedIds.has(r.place_id));
        if (toImport.length === 0) return;

        setImporting(true);
        setImportStats(null);
        let successCount = 0;
        let failCount = 0;

        try {
            const ownerId = currentUserId;

            if (!ownerId) {
                console.error("No authenticated user found for import");
                setCurrentImport("Error: No autenticado");
                setImporting(false);
                return;
            }

            for (let i = 0; i < toImport.length; i++) {
                const place = toImport[i];
                setCurrentImport(`Importando (${i + 1}/${toImport.length}): ${place.name}...`);

                try {
                    // PRE-CHECK: Avoid duplicates by Name and Address
                    const { data: existing } = await supabase
                        .from('businesses')
                        .select('id')
                        .eq('name', place.name)
                        .eq('address', place.formatted_address)
                        .maybeSingle();

                    if (existing) {
                        console.log(`⏩ Saltando duplicado: ${place.name}`);
                        successCount++; // Count as success to not show as "error" per se
                        continue;
                    }

                    // Normalize Category
                    let category = 'Otro';

                    const typeMap: Record<string, string> = {
                        'restaurant': 'Restaurante',
                        'food': 'Restaurante',
                        'meal_takeaway': 'Restaurante',
                        'cafe': 'Cafetería',
                        'bakery': 'Cafetería',
                        'bar': 'Bar',
                        'night_club': 'Bar',
                        'liquor_store': 'Tienda',
                        'store': 'Tienda',
                        'clothing_store': 'Tienda',
                        'convenience_store': 'Tienda',
                        'shopping_mall': 'Tienda',
                        'health': 'Salud',
                        'gym': 'Salud',
                        'doctor': 'Salud',
                        'hospital': 'Salud',
                        'dentist': 'Salud',
                        'beauty_salon': 'Belleza',
                        'hair_care': 'Belleza',
                        'spa': 'Belleza',
                        'school': 'Educación',
                        'primary_school': 'Educación',
                        'university': 'Educación',
                        'park': 'Entretenimiento',
                        'movie_theater': 'Entretenimiento',
                        'museum': 'Cultura',
                        'church': 'Religión'
                    };

                    // Check if any of the place types match our map
                    for (const t of (place.types || [])) {
                        if (typeMap[t]) {
                            category = typeMap[t];
                            break;
                        }
                    }

                    // Fallback formatting if no match
                    if (category === 'Otro' && place.types?.[0]) {
                        const raw = place.types[0].replace(/_/g, ' ');
                        category = raw.charAt(0).toUpperCase() + raw.slice(1);
                    }

                    // Persistence of images via shared storage logic
                    let finalImageUrl = null;
                    const primaryPhoto = place.photos?.[0];
                    if (primaryPhoto) {
                        // Get the transient Google URL directly from the Places API photo object
                        const transientUrl = primaryPhoto.getUrl({ maxWidth: 1600, maxHeight: 1600 });
                        console.log(`📷 URL transitoria obtenida para ${place.name}: ${transientUrl.substring(0, 50)}...`);

                        if (transientUrl) {
                            setCurrentImport(`💾 Guardando foto para: ${place.name}...`);
                            // Pass the full transient URL directly - storage.ts will handle it
                            const uploadedUrl = await uploadBusinessPhoto(transientUrl, place.name);

                            if (uploadedUrl) {
                                finalImageUrl = uploadedUrl;
                                console.log(`✅ Imagen guardada permanentemente para ${place.name}`);
                            } else {
                                console.warn(`⚠️ Foto no pudo subirse a Storage para "${place.name}".`);
                                finalImageUrl = null;
                            }
                        }
                    }

                    const { error } = await (supabase.from('businesses') as any).insert({
                        name: place.name,
                        description: `Importado de Google Maps. Dirección: ${place.formatted_address}`,
                        address: place.formatted_address,
                        category: category.charAt(0).toUpperCase() + category.slice(1),
                        lat: typeof place.geometry?.location.lat === 'function' ? place.geometry.location.lat() : place.geometry?.location.lat,
                        lng: typeof place.geometry?.location.lng === 'function' ? place.geometry.location.lng() : place.geometry?.location.lng,
                        rating: place.rating,
                        review_count: place.user_ratings_total,
                        is_hidden: false,
                        is_premium: false,
                        plan_id: 'free',
                        owner_id: ownerId,
                        phone: place.formatted_phone_number,
                        website: place.website,
                        image_url: finalImageUrl,
                        metadata: {
                            google_place_id: place.place_id,
                            google_photo_ref: (place.photos?.[0] as any)?.photo_reference
                        }
                    });

                    if (error) throw error;
                    successCount++;
                } catch (err: any) {
                    console.error("Failed to import:", err);
                    failCount++;
                }
            }
        } catch (generalErr) {
            console.error("Critical import error:", generalErr);
        } finally {
            setImporting(false);
            setCurrentImport("");
            setImportStats({ success: successCount, failed: failCount });
            if (successCount > 0) setSelectedIds(new Set()); // Only clear if we actually imported something
        }
    };

    const repairExistingImages = async () => {
        if (!confirm("Esto buscará negocios con imágenes rotas/temporales e intentará guardarlas permanentemente. ¿Continuar?")) return;

        setImporting(true);
        setCurrentImport("Iniciando reparación...");
        let success = 0;
        let failed = 0;

        try {
            // 1. Find businesses with google maps URLs
            const { data, error } = await supabase
                .from('businesses')
                .select('id, name, image_url')
                .like('image_url', '%maps.googleapis.com%');

            if (error) throw error;
            const businesses = data as any[];

            if (!businesses || businesses.length === 0) {
                alert("No se encontraron imágenes que requieran reparación.");
                setImporting(false);
                setCurrentImport("");
                return;
            }

            setCurrentImport(`Reparando ${businesses.length} imágenes...`);

            for (let i = 0; i < businesses.length; i++) {
                const b = businesses[i];
                setCurrentImport(`Reparando (${i + 1}/${businesses.length}): ${b.name}`);

                // Extract photo identification from the URL
                const photoRef = b.image_url.match(/photoreference=([^&]+)/)?.[1] ||
                    b.image_url.match(/1s([^&]+)/)?.[1];

                if (photoRef) {
                    const uploadedUrl = await uploadBusinessPhoto(photoRef, b.name);
                    if (uploadedUrl) {
                        const { error: updateError } = await (supabase
                            .from('businesses') as any)
                            .update({ image_url: uploadedUrl })
                            .eq('id', b.id);

                        if (!updateError) success++; else failed++;
                    } else {
                        failed++;
                    }
                } else {
                }
            }
            alert(`Reparación finalizada: ${success} arregladas, ${failed} fallidas.`);
        } catch (err) {
            console.error("Error en reparación:", err);
            alert("Error crítico durante la reparación.");
        } finally {
            setImporting(false);
            setCurrentImport("");
        }
    };

    if (loadError) {
        return (
            <div className="p-8 text-center text-red-400 bg-red-900/10 rounded-xl border border-red-900/20">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Error de Configuración</h3>
                <p>No se pudo cargar la API de Google Maps.</p>
                <p className="text-sm mt-2 opacity-70">Verifica que VITE_GOOGLE_MAPS_API_KEY esté configurada en el archivo .env</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
                <p>Conectando con Google Maps Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin className="text-indigo-400" />
                        Radar de Negocios (Zona Centro CP 64000)
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={repairExistingImages}
                        disabled={importing}
                        className="text-xs border-amber-900/50 text-amber-500 hover:bg-amber-900/20"
                    >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Reparar Imágenes Rotas
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                            placeholder="Ej. Cafeterías, Veterinarias, Tacos..."
                            className="pl-10 bg-slate-900 border-slate-600 focus:border-indigo-500"
                        />
                    </div>
                    <Button
                        onClick={searchPlaces}
                        disabled={searching || !searchTerm}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {searching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                        Buscar en Mapa
                    </Button>
                </div>
            </div>

            {/* Import Stats */}
            {importStats && (
                <div className="p-4 bg-green-900/20 border border-green-900/30 rounded-lg flex items-center gap-3 text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <span>Importación completada: {importStats.success} éxitos, {importStats.failed} fallos.</span>
                </div>
            )}

            {/* Results Grid */}
            {results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-slate-400 px-2 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-4">
                            <span>Encontrados: <strong>{results.length}</strong> negocios</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-8 text-xs border-slate-600 hover:bg-slate-700"
                            >
                                {selectedIds.size === results.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
                            </Button>
                        </div>
                        {selectedIds.size > 0 && (
                            <Button onClick={handleImport} disabled={importing} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                                {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                {importing ? (currentImport || "Importando...") : `Importar Seleccionados (${selectedIds.size})`}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((place) => (
                            <div
                                key={place.place_id}
                                onClick={() => toggleSelection(place.place_id)}
                                className={`
                                    relative p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]
                                    ${selectedIds.has(place.place_id)
                                        ? 'bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
                                `}
                            >
                                <div className="flex gap-4">
                                    {place.photos?.[0] ? (
                                        <img
                                            src={place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })}
                                            alt={place.name}
                                            className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-slate-500">
                                            <Store className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white truncate">{place.name}</h4>
                                        <p className="text-xs text-slate-400 truncate">{place.formatted_address}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center text-yellow-500 text-sm font-medium">
                                                <Star className="w-3 h-3 fill-current mr-1" />
                                                {place.rating || 'N/A'}
                                            </div>
                                            <span className="text-xs text-slate-500">({place.user_ratings_total || 0} reviews)</span>
                                        </div>
                                    </div>
                                    <div className={`
                                        w-5 h-5 rounded-full border flex items-center justify-center
                                        ${selectedIds.has(place.place_id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'}
                                    `}>
                                        {selectedIds.has(place.place_id) && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
