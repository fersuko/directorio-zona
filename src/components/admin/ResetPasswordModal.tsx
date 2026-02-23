import { useState } from "react";
import { Key, X, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResetEmail: (email: string) => Promise<void>;
    onResetManual: (userId: string, email: string, newPassword: string) => Promise<void>;
    user: { id: string; email: string; full_name?: string } | null;
}

export function ResetPasswordModal({ isOpen, onClose, onResetEmail, onResetManual, user }: ResetPasswordModalProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingManual, setLoadingManual] = useState(false);

    if (!isOpen || !user) return null;

    const handleEmailReset = async () => {
        setLoadingEmail(true);
        try {
            await onResetEmail(user.email);
            onClose();
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleManualReset = async () => {
        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        setLoadingManual(true);
        try {
            await onResetManual(user.id, user.email, password);
            setPassword("");
            onClose();
        } finally {
            setLoadingManual(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1b26] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="font-bold flex items-center gap-2">
                        <Key className="w-5 h-5 text-yellow-500" />
                        Restablecer Contraseña
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium">
                            {user.full_name || "Usuario"}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    {/* Option 1: Email Link */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Opción 1: Enlace por correo</h3>
                        <p className="text-xs text-muted-foreground">
                            Se enviará un correo oficial de Supabase para que el usuario elija su propia contraseña.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-white/10 hover:bg-white/5"
                            onClick={handleEmailReset}
                            disabled={loadingEmail || loadingManual}
                        >
                            {loadingEmail ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4" />
                            )}
                            Enviar Enlace de Recuperación
                        </Button>
                    </div>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1a1b26] px-2 text-muted-foreground/30 font-bold italic">O</span>
                        </div>
                    </div>

                    {/* Option 2: Manual Update */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Opción 2: Cambio Manual (Super Admin)</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground px-1">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-background/50 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500/50 focus:outline-none transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-none font-bold"
                            onClick={handleManualReset}
                            disabled={!password || password.length < 6 || loadingEmail || loadingManual}
                        >
                            {loadingManual ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Key className="w-4 h-4" />
                            )}
                            Cambiar Contraseña Ahora
                        </Button>
                    </div>

                    <div className="pt-2">
                        <Button variant="ghost" onClick={onClose} className="w-full text-xs text-muted-foreground">
                            Cancelar y cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
