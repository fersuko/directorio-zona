import { useState } from "react";
import { User, Shield, Calendar, Trash2, Store, Crown, Search, Key } from "lucide-react";
import { Button } from "../ui/Button";

interface Profile {
    id: string;
    email: string;
    role: string;
    created_at: string;
    full_name?: string;
    business_id?: number;
    business_name?: string;
}

interface UserTableProps {
    users: Profile[];
    onDelete: (id: string, email: string) => void;
    onResetPasswordAction: (user: Profile) => void;
}

export function UserTable({ users, onDelete, onResetPasswordAction }: UserTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        <Shield className="w-3 h-3" />
                        Super Admin
                    </span>
                );
            case 'business_owner':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        <Crown className="w-3 h-3" />
                        Dueño de Negocio
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Usuario
                    </span>
                );
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginación
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const isAllSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            const newSelected = new Set(selectedIds);
            paginatedUsers.forEach(u => newSelected.delete(u.id));
            setSelectedIds(newSelected);
        } else {
            const newSelected = new Set(selectedIds);
            paginatedUsers.forEach(u => newSelected.add(u.id));
            setSelectedIds(newSelected);
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
        if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.size} usuarios?`)) {
            selectedIds.forEach(id => {
                const user = users.find(u => u.id === id);
                if (user) onDelete(id, user.email || 'usuario');
            });
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                {selectedIds.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar ({selectedIds.size})
                    </button>
                )}
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-muted-foreground text-sm bg-muted/50 font-medium">
                                <th className="py-3 px-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 transition-colors"
                                    />
                                </th>
                                <th className="py-3 px-4">Usuario</th>
                                <th className="py-3 px-4">Rol</th>
                                <th className="py-3 px-4">Negocio</th>
                                <th className="py-3 px-4">Fecha Registro</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No hay usuarios registrados
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(user.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(user.id)}
                                                onChange={() => toggleSelect(user.id)}
                                                className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 transition-colors"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {user.full_name || "Sin nombre"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.business_name ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Store className="w-3 h-3 text-green-500" />
                                                    <span className="text-foreground">{user.business_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {user.created_at
                                                    ? new Date(user.created_at).toLocaleDateString("es-ES", {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : "-"}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Restablecer Contraseña"
                                                    onClick={() => onResetPasswordAction(user)}
                                                >
                                                    <Key className="w-4 h-4 text-muted-foreground hover:text-yellow-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Eliminar Usuario"
                                                    onClick={() => onDelete(user.id, user.email || 'usuario')}
                                                >
                                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length > 0 && (
                    <div className="px-4 py-3 border-t border-white/10 bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios</span>
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
