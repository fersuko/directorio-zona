import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";
import { MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const businesses = businessesData as Business[];

export default function Home() {
    const navigate = useNavigate();
    const premiumBusinesses = businesses.filter(b => b.isPremium);
    const regularBusinesses = businesses.filter(b => !b.isPremium);

    return (
        <div className="p-4 space-y-8 pb-24 overflow-x-hidden">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 text-center space-y-4 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 z-0" />
                <div className="relative z-10 space-y-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent leading-tight">
                        Directorio Zona
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Tu directorio comercial del centro de Monterrey
                    </p>
                    <Button
                        variant="premium"
                        className="w-full shadow-lg shadow-yellow-500/20"
                        onClick={() => navigate("/promos")}
                    >
                        Explorar Ofertas
                    </Button>
                </div>
            </motion.div>

            {/* Categories */}
            <section>
                <h2 className="text-lg font-semibold mb-4 px-1">Categorías</h2>
                <div className="grid grid-cols-4 gap-3">
                    {["Comida", "Tiendas", "Salud", "Servicios"].map((cat, i) => (
                        <motion.div
                            key={cat}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(`/search?category=${cat}`)}
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
                                <span className="text-xl font-bold">{cat[0]}</span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">{cat}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Premium Businesses Carousel */}
            {premiumBusinesses.length > 0 && (
                <section className="w-full space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <h2 className="text-lg font-semibold">Destacados</h2>
                    </div>

                    {/* 
                        Touch-friendly carousel: 
                        - Native overflow-x-auto for perfect touch feel
                        - Snap-x for premium stopping power
                        - Hidden scrollbar for aesthetics
                    */}
                    <div
                        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {premiumBusinesses.map((business) => (
                            <div
                                key={business.id}
                                onClick={() => navigate(`/business/${business.id}`)}
                                className="min-w-[280px] snap-center glass-card rounded-xl overflow-hidden relative group transition-transform active:scale-95 duration-200 cursor-pointer"
                            >
                                <div className="h-32 bg-muted relative">
                                    <img
                                        src={business.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
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

            {/* All Businesses List */}
            <section>
                <h2 className="text-lg font-semibold mb-4 px-1">Todos los Negocios</h2>
                <div className="space-y-3">
                    {regularBusinesses.slice(0, 10).map((business, i) => (
                        <motion.div
                            key={business.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass p-3 rounded-xl flex gap-4 items-center hover:bg-white/5 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg shrink-0">
                                {business.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{business.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{business.category}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                <MapPin className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
