import { useState } from "react";
import { Search, Star, Eye, User } from "lucide-react";
import { Button } from "../ui/Button";
import type { Business } from "../../types";

interface AdminBusinessTableProps {
    businesses: Business[];
    onChangePlan: (id: number, newPlanId: string) => void;
    onToggleVisibility: (id: number, currentStatus: boolean) => void;
    onAssignOwner: (id: number) => void;
}

export function AdminBusinessTable({ businesses, onChangePlan, onToggleVisibility, onAssignOwner }: AdminBusinessTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "premium" | "standard">("all");

    const filteredBusinesses = businesses.filter((business) => {
        const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === "premium") return matchesSearch && business.isPremium;
        if (filter === "standard") return matchesSearch && !business.isPremium;
        return matchesSearch;
    });

    const getPlanColor = (planId?: string) => {
        switch (planId) {
            case 'featured': return 'bg-brand-gold/20 text-brand-gold border-brand-gold/30';
            case 'launch': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default: return 'bg-white/5 text-muted-foreground border-white/10';
        }
    };

    const getPlanLabel = (planId?: string) => {
        switch (planId) {
            case 'featured': return 'Destacado';
            case 'launch': return 'Lanzamiento';
            default: return 'Gratuito';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar negocio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter("premium")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "premium" ? "bg-brand-gold text-black" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                    >
                        Premium
                    </button>
                </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-4 py-3">Negocio</th>
                                <th className="px-4 py-3">Categoría</th>
                                <th className="px-4 py-3 text-center">Plan Actual</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredBusinesses.map((business) => (
                                <tr key={business.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-foreground">{business.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {business.address || "Sin dirección"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/5 text-xs">
                                            {business.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getPlanColor(business.planId)}`}>
                                            {business.isPremium && <Star className="w-3 h-3 fill-current" />}
                                            {getPlanLabel(business.planId)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={business.planId || 'free'}
                                                onChange={(e) => onChangePlan(business.id, e.target.value)}
                                                className="bg-muted/50 border border-white/10 rounded text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="free">Gratuito</option>
                                                <option value="launch">Lanzamiento</option>
                                                <option value="featured">Destacado</option>
                                            </select>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onAssignOwner(business.id)}
                                                title={business.ownerId ? "Cambiar Dueño" : "Asignar Dueño"}
                                                className={business.ownerId ? "text-blue-400" : "text-muted-foreground hover:text-blue-400"}
                                            >
                                                <User className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onToggleVisibility(business.id, true)}
                                                title="Ocultar"
                                                className="text-muted-foreground hover:text-red-500"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredBusinesses.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No se encontraron negocios.
                    </div>
                )}
            </div>
        </div>
    );
}
