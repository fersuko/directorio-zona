import { useState } from "react";
import { Search, Eye, EyeOff, User, Edit, Trash2 } from "lucide-react";

import type { Business } from "../../types";

interface AdminBusinessTableProps {
    businesses: Business[];
    onChangePlan: (id: number, newPlanId: string) => void;
    onToggleVisibility: (id: number, currentStatus: boolean) => void;
    onAssignOwner: (id: number) => void;
    onEdit: (business: Business) => void;
    onDelete: (id: number, name: string) => void;
}

export function AdminBusinessTable({ businesses, onChangePlan, onToggleVisibility, onAssignOwner, onEdit, onDelete }: AdminBusinessTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "premium" | "standard">("all");

    const filteredBusinesses = businesses.filter((business) => {
        const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === "premium") return matchesSearch && business.isPremium;
        if (filter === "standard") return matchesSearch && !business.isPremium;
        return matchesSearch;
    });

    const handlePlanChange = (businessId: number, oldPlan: string, newPlan: string) => {
        if (oldPlan === newPlan) return;

        const confirmMessage = `⚠️ ¿Estás seguro de cambiar el plan de "${oldPlan}" a "${newPlan}"?\n\nEsto afectará las funciones disponibles para el usuario inmediatamente.`;

        if (window.confirm(confirmMessage)) {
            onChangePlan(businessId, newPlan);
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
                                    <td className="p-4">
                                        <select
                                            value={business.planId || 'free'}
                                            onChange={(e) => handlePlanChange(business.id, business.planId || 'free', e.target.value)}
                                            className={`appearance-none bg-transparent font-medium border-0 cursor-pointer focus:ring-0 text-center w-full px-2 py-1 rounded-full text-xs transition-colors ${((business.planId as string) === 'premium' || (business.planId as string) === 'featured') ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' :
                                                ((business.planId as string) === 'basic' || (business.planId as string) === 'launch') ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                                                    'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                                }`}
                                        >
                                            <option value="free" className="bg-slate-900 text-gray-400">Plan Gratuito</option>
                                            <option value="exchange" className="bg-slate-900 text-yellow-400">Plan Intercambio ($799 en Producto)</option>
                                            <option value="premium" className="bg-slate-900 text-purple-400">Plan Premium ($399/mes)</option>
                                            <option value="launch" className="bg-slate-900 text-blue-400">Plan Lanzamiento</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* The original select for plan change is removed as it's replaced by the new styled select */}

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => onEdit(business)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-blue-400 transition-colors"
                                                    title="Editar Negocio"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => onAssignOwner(business.id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-orange-400 transition-colors"
                                                    title="Transferir Propiedad"
                                                >
                                                    <User className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => onToggleVisibility(business.id, business.isHidden || false)}
                                                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${business.isHidden ? 'text-muted-foreground' : 'text-green-400'}`}
                                                    title={business.isHidden ? "Mostrar Negocio" : "Ocultar Negocio"}
                                                >
                                                    {business.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>

                                                <button
                                                    onClick={() => onDelete(business.id, business.name)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors"
                                                    title="Eliminar Negocio"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
