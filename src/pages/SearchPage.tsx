import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";

const businesses = businessesData as Business[];

const CATEGORIES = [
    "Todos",
    "Restaurante",
    "Cafetería",
    "Bar",
    "Tienda de Conveniencia",
    "Banco",
    "Farmacia",
    "Ropa",
    "Comida Rápida"
];

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    const filteredBusinesses = useMemo(() => {
        return businesses.filter((business) => {
            const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                business.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "Todos" || business.category === selectedCategory;

            return matchesSearch && matchesCategory;
        }).sort((a, b) => (b.isPremium === a.isPremium ? 0 : b.isPremium ? 1 : -1));
    }, [searchTerm, selectedCategory]);

    return (
        <div className="p-4 pb-24 min-h-screen bg-background space-y-4">
            {/* Header & Search Input */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md z-20 -mx-4 px-4 py-2 space-y-3">
                <h1 className="text-2xl font-bold">Explorar</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar lugares, comida, servicios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-muted/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{filteredBusinesses.length} resultados</span>
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredBusinesses.map((business) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={business.id}
                            onClick={() => navigate(`/business/${business.id}`)}
                            className={`glass-card rounded-xl p-3 flex gap-3 cursor-pointer group hover:bg-white/5 transition-colors ${business.isPremium ? "border-yellow-500/30 bg-yellow-500/5" : ""
                                }`}
                        >
                            {/* Thumbnail */}
                            <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                                <img
                                    src={business.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                                    alt={business.name}
                                    className="w-full h-full object-cover"
                                />
                                {business.isPremium && (
                                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm p-1 rounded-full">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold truncate ${business.isPremium ? "text-yellow-500" : ""}`}>
                                        {business.name}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{business.category}</p>
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{business.address}</span>
                                </div>
                                {business.description && (
                                    <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-1">
                                        {business.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredBusinesses.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No se encontraron resultados para "{searchTerm}"</p>
                        <button
                            onClick={() => { setSearchTerm(""); setSelectedCategory("Todos"); }}
                            className="text-primary text-sm mt-2 hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
