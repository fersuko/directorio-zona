import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Navigation, Tag } from "lucide-react";
import { useGeolocation } from "../hooks/useGeolocation";
import { calculateDistance, formatDistance } from "../utils/distance";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";
import { Button } from "../components/ui/Button";

const businesses = businessesData as Business[];

export default function PromosPage() {
    const navigate = useNavigate();
    const { coordinates, loading, error, getLocation } = useGeolocation();

    const nearbyBusinesses = useMemo(() => {
        if (!coordinates) return [];

        return businesses
            .map((business) => ({
                ...business,
                distance: calculateDistance(
                    coordinates.lat,
                    coordinates.lng,
                    business.lat,
                    business.lng
                ),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10); // Show top 10 nearest
    }, [coordinates]);

    return (
        <div className="p-4 pb-24 min-h-screen bg-background space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Cerca de Ti</h1>
                <p className="text-muted-foreground text-sm">
                    Descubre promociones y lugares a tu alrededor.
                </p>
            </div>

            {/* Location Status */}
            {!coordinates && (
                <div className="glass-card p-6 rounded-xl text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold">Activa tu ubicación</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Necesitamos saber dónde estás para mostrarte las mejores ofertas cercanas.
                        </p>
                    </div>
                    <Button onClick={getLocation} disabled={loading} className="w-full">
                        {loading ? "Localizando..." : "Activar Ubicación"}
                    </Button>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
            )}

            {/* Results */}
            {coordinates && (
                <div className="space-y-4">
                    {nearbyBusinesses.map((business, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={business.id}
                            onClick={() => navigate(`/business/${business.id}`)}
                            className="glass-card rounded-xl overflow-hidden cursor-pointer group active:scale-98 transition-transform"
                        >
                            <div className="relative h-32">
                                <img
                                    src={business.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                                    alt={business.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium text-white">
                                    <Navigation className="w-3 h-3" />
                                    {formatDistance(business.distance)}
                                </div>
                                {business.isPremium && (
                                    <div className="absolute bottom-2 left-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-bold">
                                        PROMO
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold">{business.name}</h3>
                                        <p className="text-xs text-muted-foreground">{business.category}</p>
                                    </div>
                                </div>

                                {/* Simulated Promo Text */}
                                {business.isPremium ? (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                                        <Tag className="w-3 h-3" />
                                        <span className="font-medium">2x1 en bebidas seleccionadas</span>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                                        {business.description || "Visítanos y conoce nuestros servicios."}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
