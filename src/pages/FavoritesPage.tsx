import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { getBusinessImage } from "../lib/businessImages";
import type { Business } from "../types";

export default function FavoritesPage() {
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            // Fetch favorites with business data
            const { data, error } = await supabase
                .from("favorites")
                .select("business_id, businesses(*)")
                .eq("user_id", user.id);

            if (error) throw error;

            // Map data to Flat Business array
            const favs = data.map((item: any) => item.businesses).filter(Boolean);
            setBusinesses(favs);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold">Mis Favoritos</h1>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                            <Heart className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-lg font-semibold">Aún no tienes favoritos</h2>
                        <p className="text-muted-foreground text-sm max-w-[250px]">
                            Guarda los lugares que más te gusten para encontrarlos rápido aquí.
                        </p>
                        <Button
                            onClick={() => navigate("/search")}
                            className="mt-4"
                        >
                            Explorar Negocios
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {businesses.map((business, i) => (
                            <motion.div
                                key={business.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/business/${business.id}`)}
                                className="glass-card p-3 rounded-xl flex gap-4 items-center cursor-pointer active:scale-98 transition-transform"
                            >
                                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                                    <img
                                        src={getBusinessImage(business)}
                                        alt={business.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {business.isPremium && (
                                        <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md p-1 rounded-full">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold truncate">{business.name}</h3>
                                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{business.category}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{business.description}</p>
                                    <div className="flex items-center gap-1 text-xs text-primary pt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{business.address}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
