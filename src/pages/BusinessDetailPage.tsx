import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Share2, Heart, Navigation, Star, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { UnlockPromoModal } from "../components/ui/UnlockPromoModal";
import { ReviewModal } from "../components/ui/ReviewModal";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";
import { getBusinessImage } from "../lib/businessImages";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useGeolocation } from "../hooks/useGeolocation";
import { supabase } from "../lib/supabase";
import L from "leaflet";

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const businesses = businessesData as Business[];

export default function BusinessDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const business = businesses.find((b) => b.id.toString() === id);

    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Fetch reviews
    useEffect(() => {
        if (business?.id) {
            const fetchReviews = async () => {
                if (!business?.id) return;
                const { data } = await supabase
                    .from('reviews')
                    .select('*, profiles(full_name)')
                    .eq('business_id', business.id)
                    .order('created_at', { ascending: false });

                if (data) {
                    setReviews(data);
                }
                setLoadingReviews(false);
            };
            fetchReviews();
        }
    }, [business?.id]);

    const handleSubmitReview = async (rating: number, comment: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Debes iniciar sesión para dejar una reseña");
                navigate("/login");
                return;
            }

            const { error } = await supabase
                .from('reviews')
                .insert({
                    business_id: business?.id,
                    user_id: user.id,
                    rating,
                    comment
                } as any);

            if (error) throw error;

            // Refresh reviews
            if (business?.id) {
                const { data } = await supabase
                    .from('reviews')
                    .select('*, profiles(full_name)')
                    .eq('business_id', business.id)
                    .order('created_at', { ascending: false });

                if (data) setReviews(data);
            }

        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Error al enviar la reseña");
        }
    };

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
            {/* Hero Section */}
            <div className="h-64 w-full relative overflow-hidden">
                <img
                    src={getBusinessImage(business)}
                    alt={business.name}
                    className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20">
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

                {/* Map Section */}
                <div className="space-y-2">
                    <h2 className="font-semibold text-lg">Ubicación</h2>
                    <div className="h-48 w-full rounded-xl overflow-hidden relative z-0 border border-white/10">
                        {business.lat && business.lng ? (
                            <MapContainer
                                center={[business.lat, business.lng]}
                                zoom={15}
                                className="w-full h-full"
                                zoomControl={false}
                                dragging={false} // Keep it static-ish to avoid scrolling issues
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                />
                                <Marker position={[business.lat, business.lng]} />

                                {/* Show route line if user location is available */}
                                <UserRoute businessLat={business.lat} businessLng={business.lng} />
                            </MapContainer>
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                Mapa no disponible
                            </div>
                        )}

                        <div className="absolute bottom-2 right-2 z-[400]">
                            <Button
                                size="sm"
                                className="gap-2 shadow-lg"
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`, '_blank')}
                            >
                                <Navigation className="w-3 h-3" />
                                Abrir GPS
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Reviews Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg">Reseñas y Opiniones</h2>
                        <Button variant="ghost" size="sm" onClick={() => setShowReviewModal(true)} className="text-primary">
                            Escribir reseña
                        </Button>
                    </div>

                    {/* Real Reviews List */}
                    <div className="space-y-4">
                        {loadingReviews ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Cargando reseñas...</p>
                        ) : reviews.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Sé el primero en opinar sobre este lugar.</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="glass-card p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                {(review.profiles?.full_name || "Usuario")[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{review.profiles?.full_name || "Usuario"}</p>
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <UnlockPromoModal
                isOpen={showPromoModal}
                onClose={() => setShowPromoModal(false)}
                businessName={business.name}
            />

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                businessName={business.name}
                onSubmit={handleSubmitReview}
            />
        </div>
    );
}

// Helper component to render the route line
function UserRoute({ businessLat, businessLng }: { businessLat: number, businessLng: number }) {
    const { coordinates } = useGeolocation();

    if (!coordinates) return null;

    return (
        <>
            <Marker position={[coordinates.lat, coordinates.lng]} icon={DefaultIcon} opacity={0.7} />
            <Polyline
                positions={[
                    [coordinates.lat, coordinates.lng],
                    [businessLat, businessLng]
                ]}
                pathOptions={{ color: 'blue', dashArray: '5, 10', weight: 4, opacity: 0.6 }}
            />
        </>
    );
}
