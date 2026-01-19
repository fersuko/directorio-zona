import { useState } from "react";
import { Eye, EyeOff, User, Edit, Trash2 } from "lucide-react";

import type { Business } from "../../types";

interface AdminBusinessTableProps {
    businesses: Business[];
    onToggleVisibility: (id: string, currentStatus: boolean) => void;
    onAssignOwner: (id: string) => void;
    onEdit: (business: Business) => void;
    onDelete: (id: string, name: string) => void;
    onBulkDelete: (ids: string[]) => void;
}

export function AdminBusinessTable({ businesses, onToggleVisibility, onAssignOwner, onEdit, onDelete, onBulkDelete }: AdminBusinessTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Paginación
    const totalPages = Math.ceil(businesses.length / itemsPerPage);
    const paginatedBusinesses = businesses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSelectAll = () => {
        if (selectedIds.size === businesses.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(businesses.map(b => b.id)));
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
        if (selectedIds.size === 0) return;
        onBulkDelete(Array.from(selectedIds));
        // Note: we don't clear selection here, the parent will update the businesses list
        // and our Set will point to missing businesses, but it's cleaner to let the parent handle success flow.
        // Actually, clearing it is safer for the next operation.
        setSelectedIds(new Set());
    };

    return (
        <div className="space-y-4">
            {/* Header: Bulk Actions Only */}
            <div className="flex justify-between items-center h-10">
                <div className="flex gap-2 items-center">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors shadow-sm"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar Seleccionados ({selectedIds.size})
                        </button>
                    )}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                    {selectedIds.size > 0 && <span>{selectedIds.size} seleccionados</span>}
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
                                        checked={businesses.length > 0 && selectedIds.size === businesses.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 transition-colors pointer-events-auto"
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

                {businesses.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No se encontraron negocios con estos filtros.
                    </div>
                ) : (
                    <div className="px-4 py-3 border-t border-white/10 bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Mostrando {paginatedBusinesses.length} de {businesses.length} negocios</span>
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
