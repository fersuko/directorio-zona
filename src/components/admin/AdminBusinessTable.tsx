import { useState } from "react";
import { Search, Eye, EyeOff, User, Edit, Trash2 } from "lucide-react";

import type { Business } from "../../types";

interface AdminBusinessTableProps {
    businesses: Business[];
    onToggleVisibility: (id: string, currentStatus: boolean) => void;
    onAssignOwner: (id: string) => void;
    onEdit: (business: Business) => void;
    onDelete: (id: string, name: string) => void;
}

export function AdminBusinessTable({ businesses, onToggleVisibility, onAssignOwner, onEdit, onDelete }: AdminBusinessTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "premium" | "standard">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filteredBusinesses = businesses.filter((business) => {
        const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === "premium") return matchesSearch && business.isPremium;
        if (filter === "standard") return matchesSearch && !business.isPremium;
        return matchesSearch;
    });

    // Paginación
    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const paginatedBusinesses = filteredBusinesses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedBusinesses.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedBusinesses.map(b => b.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = () => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.size} negocios?`)) {
            // Pasamos un array de IDs al handler de borrado (asumiendo que onDelete se actualizará para manejarlo o llamamos uno por uno)
            selectedIds.forEach(id => {
                const business = businesses.find(b => b.id === id);
                if (business) onDelete(id, business.name);
            });
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar negocio..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar ({selectedIds.size})
                        </button>
                    )}
                    <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => { setFilter("all"); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-white/5"}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => { setFilter("premium"); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === "premium" ? "bg-brand-gold text-black shadow-sm" : "text-muted-foreground hover:bg-white/5"}`}
                        >
                            Premium
                        </button>
                    </div>
                </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-white/10">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={paginatedBusinesses.length > 0 && selectedIds.size === paginatedBusinesses.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 transition-colors"
                                    />
                                </th>
                                <th className="px-4 py-3">Negocio</th>
                                <th className="px-4 py-3">Categoría</th>
                                <th className="px-4 py-3 text-center">Plan Actual</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedBusinesses.map((business) => (
                                <tr key={business.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(business.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(business.id)}
                                            onChange={() => toggleSelect(business.id)}
                                            className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 transition-colors"
                                        />
                                    </td>
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
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${((business.planId as string) === 'premium') ? 'text-purple-400 bg-purple-500/10 border-purple-500/30' :
                                            ((business.planId as string) === 'exchange') ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
                                                ((business.planId as string) === 'launch') ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                                                    'text-gray-400 bg-gray-500/10 border-white/10'
                                            }`}>
                                            {business.planId === 'premium' ? 'Plan Premium' :
                                                business.planId === 'exchange' ? 'Plan Intercambio' :
                                                    business.planId === 'launch' ? 'Plan Lanzamiento' :
                                                        'Plan Gratuito'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBusinesses.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No se encontraron negocios.
                    </div>
                ) : (
                    <div className="px-4 py-3 border-t border-white/10 bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Mostrando {paginatedBusinesses.length} de {filteredBusinesses.length} negocios</span>
                            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                                <span>Mostrar:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-white/5 border border-white/10 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:bg-white/5 disabled:opacity-30 transition-colors"
                            >
                                Anterior
                            </button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${currentPage === i + 1 ? 'bg-primary text-white' : 'hover:bg-white/5 text-muted-foreground'}`}
                                    >
                                        {i + 1}
                                    </button>
                                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:bg-white/5 disabled:opacity-30 transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
