import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, MapPin, Phone, Share2, Heart, Navigation, Star, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { UnlockPromoModal } from "../components/ui/UnlockPromoModal";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";

const businesses = businessesData as Business[];

export default function BusinessDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showPromoModal, setShowPromoModal] = useState(false);
    const business = businesses.find((b) => b.id.toString() === id);

    if (!business) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-xl font-bold">Negocio no encontrado</h2>
                <Button onClick={() => navigate(-1)} variant="secondary">
                    Regresar
                </Button>
            </div>
        );
    }

    return (
        <div className="pb-24 bg-background min-h-screen relative">
            {/* Hero Image */}
            <div className="h-64 w-full relative">
                <img
                    src={business.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                    alt={business.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                    <Heart className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 -mt-8 relative z-10 space-y-6">
                {/* Header Info */}
                <div className="glass-card p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold leading-tight">{business.name}</h1>
                            <p className="text-muted-foreground text-sm mt-1">{business.category}</p>
                        </div>
                        {business.isPremium && (
                            <div className="bg-yellow-500/20 border border-yellow-500/30 p-1.5 rounded-lg">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="truncate">{business.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Abierto ahora</span>
                        <span className="text-muted-foreground">• Cierra a las 10:00 PM</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    <Button variant="secondary" className="flex flex-col h-auto py-3 gap-1 text-xs">
                        <Phone className="w-5 h-5" />
                        Llamar
                    </Button>
                    <Button variant="premium" className="flex flex-col h-auto py-3 gap-1 text-xs">
                        <Navigation className="w-5 h-5" />
                        Cómo llegar
                    </Button>
                    <Button variant="secondary" className="flex flex-col h-auto py-3 gap-1 text-xs">
                        <Share2 className="w-5 h-5" />
                        Compartir
                    </Button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <h2 className="font-semibold text-lg">Sobre el lugar</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {business.description || "Un excelente lugar para disfrutar en el centro de Monterrey. Ofrecemos productos y servicios de alta calidad con la mejor atención."}
                    </p>
                </div>

                {/* Promo Action */}
                {business.isPremium && (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-yellow-600">¡Oferta Disponible!</h3>
                            <p className="text-xs text-muted-foreground">Desbloquea tu descuento exclusivo</p>
                        </div>
                        <Button onClick={() => setShowPromoModal(true)} size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                            Ver Promo
                        </Button>
                    </div>
                )}

                {/* Map Preview (Placeholder for now, could be a mini Leaflet map) */}
                <div className="space-y-2">
                    <h2 className="font-semibold text-lg">Ubicación</h2>
                    <div className="h-40 w-full rounded-xl bg-muted overflow-hidden relative">
                        <img
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                            alt="Map Preview"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button variant="secondary" size="sm" className="gap-2">
                                <MapPin className="w-4 h-4" />
                                Ver en Mapa
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <UnlockPromoModal
                isOpen={showPromoModal}
                onClose={() => setShowPromoModal(false)}
                businessName={business.name}
            />
        </div>
    );
}
