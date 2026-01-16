import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Share2, Heart, Navigation, Star, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "../components/ui/Button";
import { UnlockPromoModal } from "../components/ui/UnlockPromoModal";
import { ReviewModal } from "../components/ui/ReviewModal";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useGeolocation } from "../hooks/useGeolocation";
import { supabase } from "../lib/supabase";
import L from "leaflet";
import { useAnalytics } from "../hooks/useAnalytics";
import { checkContent } from "../utils/moderation";

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



export default function BusinessDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // State for real data
    const [business, setBusiness] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Favorites State
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState(false);

    // Fetch Business Data
    useEffect(() => {
        const fetchBusiness = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('businesses')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setBusiness(data);
            } catch (error) {
                console.error("Error fetching business:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusiness();
    }, [id]);

    // Analytics
    const { logEvent } = useAnalytics();
    useEffect(() => {
        if (business) {
            logEvent('business_view', {
                business_id: business.id,
                business_name: business.name,
                category: business.category
            });
        }
    }, [business, logEvent]);

    // Fetch reviews
    useEffect(() => {
        if (id) {
            const fetchReviews = async () => {
                const { data } = await supabase
                    .from('reviews')
                    .select('*, profiles(full_name)')
                    .eq('business_id', id)
                    .order('created_at', { ascending: false });

                if (data) {
                    setReviews(data);
                }
                setLoadingReviews(false);
            };
            fetchReviews();
        }
    }, [id]);

    // Check Favorite Status
    useEffect(() => {
        if (!id) return;
        const checkFavorite = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq("business_id", id)
                .maybeSingle();

            setIsFavorite(!!data);
        };
        checkFavorite();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!id) return;
        setTogglingFavorite(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            if (isFavorite) {
                // Remove
                const { error } = await (supabase as any)
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("business_id", id);
                if (error) throw error;
                setIsFavorite(false);
            } else {
                // Add
                const { error } = await (supabase as any)
                    .from("favorites")
                    .insert({ user_id: user.id, business_id: id });
                if (error) throw error;
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setTogglingFavorite(false);
        }
    };

    const handleSubmitReview = async (rating: number, comment: string, metrics?: { quality_price: number, service: number, product_quality: number }) => {
        if (!id) return;
        setSubmittingReview(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Debes iniciar sesión para dejar una reseña");
                navigate("/login");
                setSubmittingReview(false);
                return;
            }

            // check moderation settings
            const { data: settings } = await supabase.from('settings').select('value').eq('key', 'moderation').single();
            const moderationEnabled = (settings as any)?.value?.enabled ?? true;

            const { safe, reason } = checkContent(comment);

            let status = 'approved';
            if (moderationEnabled || !safe) {
                status = 'pending';
            }

            const { error } = await supabase
                .from('reviews')
                .insert({
                    business_id: id,
                    user_id: user.id,
                    rating,
                    comment,
                    status,
                    rating_quality: metrics?.product_quality,
                    rating_price: metrics?.quality_price,
                    rating_service: metrics?.service
                } as any);

            if (error) throw error;

            if (status === 'pending') {
                alert(safe ? "Gracias. Tu reseña ha sido enviada y está en espera de moderación." : `Contenido marcado: ${reason}. Tu reseña será revisada por un administrador.`);
            }

            // Refresh reviews (only approved ones for public view)
            if (id) {
                const { data } = await supabase
                    .from('reviews')
                    .select('*, profiles(full_name)')
                    .eq('business_id', id)
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });

                if (data) setReviews(data);
            }
            setShowReviewModal(false);

        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Error al enviar la reseña");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Helper to check if open
    const isOpenNow = (hours: any) => {
        if (!hours) return false;
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[now.getDay()];
        const daySchedule = hours[dayName];

        if (!daySchedule || !daySchedule.isOpen) return false;

        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        return currentTime >= openTime && currentTime <= closeTime;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-background">
                <h2 className="text-xl font-bold">Negocio no encontrado</h2>
                <Button onClick={() => navigate(-1)} variant="secondary">
                    Regresar
                </Button>
            </div>
        );
    }

    const openStatus = isOpenNow(business.opening_hours);

    // JSON-LD for SEO
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": business.name,
        "image": business.image_url,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": business.address,
            "addressLocality": business.group_name || business.group,
            "addressRegion": "NL",
            "addressCountry": "MX"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": business.lat,
            "longitude": business.lng
        },
        "url": window.location.href,
        "telephone": business.phone,
        "description": business.description,
        "aggregateRating": reviews.length > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
            "reviewCount": reviews.length
        } : undefined
    };

    return (
        <div className="pb-24 bg-background min-h-screen relative">
            <Helmet>
                <title>{`${business.name} | Directorio Zona`}</title>
                <meta name="description" content={business.description || `Encuentra ${business.name} en Directorio Zona. Ubicación, promociones y reseñas de clientes.`} />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Helmet>

            {/* Hero Section */}
            <div className="h-52 w-full relative overflow-hidden">
                <img
                    src={business.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
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
                <button
                    onClick={handleToggleFavorite}
                    disabled={togglingFavorite}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20 disabled:opacity-50"
                >
                    <Heart className={`w-6 h-6 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 -mt-8 relative z-10 space-y-4">
                {/* Header Info */}
                <div className="glass-card p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold leading-tight">{business.name}</h1>
                            <p className="text-muted-foreground text-sm mt-1">{business.category}</p>
                        </div>
                        {business.is_premium && (
                            <div className="bg-yellow-500/20 border border-yellow-500/30 p-1.5 rounded-lg">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </div>
                        )}
                    </div>

                    {/* Rating Row (Added) */}
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-2xl font-bold text-white">
                                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "N/A"}
                                </span>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${reviews.length > 0 && i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <button onClick={() => {
                                const el = document.getElementById('reviews-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }} className="text-sm text-primary hover:underline">
                                {reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'}
                            </button>
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-primary/50 text-primary hover:bg-primary/10"
                            onClick={() => setShowReviewModal(true)}
                        >
                            Calificar
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-white/5 pt-3">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{business.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <Clock className={`w-4 h-4 ${openStatus ? "text-green-400" : "text-red-400"}`} />
                        <span className={`font-medium ${openStatus ? "text-green-400" : "text-red-400"}`}>
                            {openStatus ? "Abierto ahora" : "Cerrado ahora"}
                        </span>
                    </div>
                </div>



                {/* Action Buttons */}
                <div className="px-4 py-2 grid grid-cols-3 gap-3 relative z-10">
                    <a
                        href={`tel:${business.phone}`}
                        onClick={() => logEvent('click_call', { business_id: business.id, phone: business.phone })}
                        className="flex flex-col items-center justify-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors active:scale-95 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-medium">Llamar</span>
                    </a>

                    <button
                        onClick={() => {
                            logEvent('click_gps', { business_id: business.id });
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + " " + business.address)}`, '_blank');
                        }}
                        className="flex flex-col items-center justify-center gap-1 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 rounded-xl p-3 hover:bg-yellow-500/20 transition-colors active:scale-95 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Navigation className="w-5 h-5 text-yellow-500" />
                        </div>
                        <span className="text-xs font-medium text-yellow-500">Cómo llegar</span>
                    </button>

                    <button
                        onClick={() => {
                            logEvent('click_share', { business_id: business.id });
                            if (navigator.share) {
                                navigator.share({
                                    title: business.name,
                                    text: `Mira este lugar en Directorio Zona: ${business.name}`,
                                    url: window.location.href,
                                }).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Enlace copiado al portapapeles");
                            }
                        }}
                        className="flex flex-col items-center justify-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors active:scale-95 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Share2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-xs font-medium">Compartir</span>
                    </button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <h2 className="font-semibold text-lg">Sobre el lugar</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {business.description || "Un excelente lugar para disfrutar en el centro de Monterrey. Ofrecemos productos y servicios de alta calidad con la mejor atención."}
                    </p>
                </div>

                {/* Promo Action */}
                {business.is_premium && (
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
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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

                {/* Reviews Section (Relocated Below Map) */}
                <div id="reviews-section" className="space-y-6 scroll-mt-24">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Reseñas y Opiniones</h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowReviewModal(true)} className="text-primary hover:bg-primary/10">
                                Escribir reseña
                            </Button>
                        </div>

                        {/* Rating Summary */}
                        {!loadingReviews && reviews.length > 0 && (
                            <div className="glass-card p-5 rounded-xl flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-bold flex items-center gap-2">
                                        {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                    </span>
                                    <span className="text-sm text-muted-foreground mt-1">
                                        {reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'} de usuarios
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {/* Simple distribution or just stars visual */}
                                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <span>5</span> <Star className="w-3 h-3 text-yellow-500" />
                                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-500"
                                                    style={{ width: `${(reviews.filter(r => r.rating === 5).length / reviews.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>4</span> <Star className="w-3 h-3 text-yellow-500" />
                                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-500"
                                                    style={{ width: `${(reviews.filter(r => r.rating === 4).length / reviews.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>3</span> <Star className="w-3 h-3 text-yellow-500" />
                                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-500"
                                                    style={{ width: `${(reviews.filter(r => r.rating === 3).length / reviews.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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

                                    {/* Metrics Display */}
                                    {(review.rating_quality || review.rating_price || review.rating_service) && (
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                                            {[
                                                { label: "Calidad", val: review.rating_quality },
                                                { label: "Precio", val: review.rating_price },
                                                { label: "Servicio", val: review.rating_service }
                                            ].map((m, i) => m.val ? (
                                                <div key={i} className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, si) => (
                                                            <div key={si} className={`h-1 flex-1 rounded-full ${si < m.val ? 'bg-primary/60' : 'bg-white/5'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null)}
                                        </div>
                                    )}
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
                onClose={() => !submittingReview && setShowReviewModal(false)}
                businessName={business.name}
                onSubmit={handleSubmitReview}
                isSubmitting={submittingReview}
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
