import { useState, useMemo } from "react";
import { User, Search, X } from "lucide-react";
import { Button } from "../ui/Button";

interface TransferOwnershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (userId: string) => void;
    businessName: string;
    users: any[];
}

export function TransferOwnershipModal({ isOpen, onClose, onConfirm, businessName, users }: TransferOwnershipModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1b26] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Transferir Propiedad
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-sm text-yellow-500">
                        <span className="font-bold block mb-1">⚠️ Atención</span>
                        Estás a punto de transferir el negocio <strong>"{businessName}"</strong> a otro usuario.
                        El dueño actual perderá el acceso de edición.
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar usuario por nombre o email..."
                                className="w-full bg-background/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 border border-white/10 rounded-lg p-2 bg-background/20">
                            {filteredUsers.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-4">No se encontraron usuarios.</p>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                            {(user.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{user.full_name || "Sin nombre"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        {selectedUser?.id === user.id && (
                                            <div className="ml-auto bg-primary text-black text-[10px] font-bold px-2 py-1 rounded-full">
                                                SELECCIONADO
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                        <Button
                            variant="default"
                            disabled={!selectedUser}
                            onClick={() => selectedUser && onConfirm(selectedUser.id)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600"
                        >
                            Confirmar Transferencia
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
