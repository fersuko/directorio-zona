import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import type { Business } from "../types";
import { MapPin, Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/ui/Logo";
import { getBusinessImage } from "../lib/businessImages";
import { useBusinesses } from "../hooks/useBusinesses";
import { useAnalytics } from "../hooks/useAnalytics";
import { useEffect } from "react";

export default function Home() {
    const navigate = useNavigate();
    const { businesses } = useBusinesses();
    const { logEvent } = useAnalytics();

    useEffect(() => {
        logEvent('page_view', { page: 'home' });
    }, [logEvent]);

    // Helper for category translations and icons
    const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
        'Restaurante': { label: 'Restaurantes', icon: '🍽️' },
        'Cafetería': { label: 'Cafeterías', icon: '☕' },
        'Gimnasio': { label: 'Gimnasio', icon: '💪' },
        'Tienda': { label: 'Tiendas', icon: '🛒' },
        'Bar': { label: 'Bares', icon: '🍹' },
        'Belleza': { label: 'Belleza', icon: '✂️' },
        'Salud': { label: 'Salud', icon: '🏥' },
        'Car repair': { label: 'Talleres', icon: '🚗' },
        'Laundry': { label: 'Lavandería y Tintorería', icon: '🧺' },
        'Point of interest': { label: 'Interés', icon: '📍' },
        'Lodging': { label: 'Hospedaje', icon: '🏨' },
        'Real estate agency': { label: 'Bienes Raíces', icon: '🏠' },
        'Veterinary care': { label: 'Veterinaria', icon: '🐾' },
        'Default': { label: 'Otros', icon: '🏪' }
    };

    const getCategoryInfo = (category: string) => {
        return CATEGORY_MAP[category] || { label: category, icon: CATEGORY_MAP['Default'].icon };
    };

    const premiumBusinesses = businesses.filter(b => b.isPremium);
    const regularBusinesses = businesses.filter(b => !b.isPremium);

    return (
        <div className="p-4 space-y-8 pb-24 overflow-x-hidden">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 text-center space-y-4 relative overflow-hidden min-h-[200px] flex flex-col justify-center items-center"
            >
                {/* Map Background Overlay */}
                {/* Map Background Overlay - Monterrey Center */}
                <div className="absolute inset-0 z-0 opacity-50 pointer-events-none grayscale-[0.2] contrast-110">
                    <MapContainer
                        center={[25.6667, -100.3167]}
                        zoom={14}
                        zoomControl={false}
                        scrollWheelZoom={false}
                        dragging={false}
                        doubleClickZoom={false}
                        attributionControl={false}
                        className="w-full h-full"
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                    </MapContainer>
                </div>

                <div className="relative z-10 space-y-4 flex flex-col items-center">
                    <Logo className="scale-125 mb-2" />
                    <p className="text-foreground font-semibold text-sm max-w-[250px] drop-shadow-sm brightness-110">
                        Tu guía comercial del centro de Monterrey
                    </p>
                    <Button
                        className="w-full shadow-xl shadow-brand-blue/20 bg-gradient-to-r from-brand-blue to-brand-red text-white border-none font-bold py-6 text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => navigate("/promos")}
                    >
                        Explorar Ofertas
                    </Button>
                </div>
            </motion.div>

            {/* Popular Categories (Dynamic) */}
            <section>
                <h2 className="text-lg font-semibold mb-4 px-1">Categorías Populares</h2>
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {Object.entries(
                        businesses.reduce((acc: Record<string, number>, b: Business) => {
                            acc[b.category] = (acc[b.category] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>)
                    )
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([category, count], i) => {
                            const { label, icon } = getCategoryInfo(category);
                            return (
                                <motion.div
                                    key={category}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => {
                                        logEvent('search', { category: category, source: 'home_chips' });
                                        navigate(`/search?category=${encodeURIComponent(category)}`);
                                    }}
                                    className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-xl group-hover:scale-105 transition-transform shadow-sm relative">
                                        <span className="text-2xl">{icon}</span>
                                        <div className="absolute -top-1 -right-1 bg-primary text-[10px] text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center font-bold border border-background">
                                            {count}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight max-w-[70px] truncate">
                                        {label}
                                    </span>
                                </motion.div>
                            );
                        })}
                </div>
            </section>

            {/* Premium Businesses Carousel */}
            {premiumBusinesses.length > 0 && (
                <section className="w-full space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <h2 className="text-lg font-semibold">Destacados</h2>
                    </div>

                    <div
                        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {premiumBusinesses.map((business: Business) => (
                            <div
                                key={business.id}
                                onClick={() => navigate(`/business/${business.id}`)}
                                className="min-w-[280px] snap-center glass-card rounded-xl overflow-hidden relative group transition-transform active:scale-95 duration-200 cursor-pointer"
                            >
                                <div className="h-32 bg-muted relative">
                                    <img
                                        src={getBusinessImage(business)}
                                        alt={business.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs text-yellow-400 font-medium border border-yellow-500/30 flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-yellow-400" /> Premium
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <h3 className="font-bold truncate">{business.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{business.description}</p>
                                    <div className="flex items-center gap-1 text-xs text-primary">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{business.address}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Best Rated Businesses */}
            <section>
                <div className="flex items-center gap-2 px-1 mb-4">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <h2 className="text-lg font-semibold">Mejor Calificados</h2>
                </div>
                <div className="space-y-3">
                    {regularBusinesses
                        .map((b: Business) => ({ ...b, rating: b.rating || (4 + Math.random()) }))
                        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 5)
                        .map((business: any, i: number) => (
                            <motion.div
                                key={business.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/business/${business.id}`)}
                                className="glass p-3 rounded-xl flex gap-4 items-center hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                    <img
                                        src={getBusinessImage(business)}
                                        alt={business.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium truncate">{business.name}</h3>
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] text-yellow-500 font-bold">
                                            <Star className="w-3 h-3 fill-yellow-500" />
                                            {business.rating ? (Number(business.rating)).toFixed(1) : "N/A"}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{business.category}</p>
                                </div>
                            </motion.div>
                        ))}
                </div>
            </section>

            {/* Join CTA */}
            <section className="pt-4">
                <div className="glass-card p-6 rounded-2xl text-center space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-brand-red/20 pointer-events-none" />
                    <h2 className="text-xl font-bold relative z-10">¿Tienes un negocio?</h2>
                    <p className="text-sm text-muted-foreground relative z-10">
                        Únete al directorio digital más exclusivo de Monterrey y llega a más clientes.
                    </p>
                    <Button
                        onClick={() => navigate("/unete")}
                        className="w-full bg-gradient-to-r from-brand-blue to-brand-red text-white shadow-lg relative z-10 font-bold"
                    >
                        Registrar mi Negocio
                    </Button>
                </div>
            </section>
        </div>
    );
}
