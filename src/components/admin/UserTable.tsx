// import { format } from "date-fns"; // Removed to avoid dependency
import { User, Shield, Calendar, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface Profile {
    id: string;
    email: string;
    role: string;
    created_at: string;
    full_name?: string;
}

interface UserTableProps {
    users: Profile[];
    onDelete: (id: string, email: string) => void;
    onUpdateRole: (id: string, newRole: 'admin' | 'user') => void;
}

export function UserTable({ users, onDelete, onUpdateRole }: UserTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-muted-foreground text-sm">
                        <th className="py-3 px-4 font-medium">Usuario</th>
                        <th className="py-3 px-4 font-medium">Rol</th>
                        <th className="py-3 px-4 font-medium">Fecha Registro</th>
                        <th className="py-3 px-4 font-medium">ID Ref</th>
                        <th className="py-3 px-4 font-medium text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                No hay usuarios registrados
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
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
                                    {user.role === "admin" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                            <Shield className="w-3 h-3" />
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                            Usuario
                                        </span>
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
                                <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                                    {user.id.slice(0, 8)}...
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.role === 'admin' ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Degradar a Usuario"
                                                onClick={() => onUpdateRole(user.id, 'user')}
                                            >
                                                <ArrowDownCircle className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Promover a Admin"
                                                onClick={() => onUpdateRole(user.id, 'admin')}
                                            >
                                                <ArrowUpCircle className="w-4 h-4 text-muted-foreground hover:text-green-400" />
                                            </Button>
                                        )}

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
    );
}
