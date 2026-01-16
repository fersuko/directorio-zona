import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { Shield, Lock, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log("[AdminLogin] Authenticating...");

            // Just authenticate - role check will happen in AdminDashboard
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            console.log("[AdminLogin] Login successful, navigating to dashboard...");

            // Small delay to let AuthContext process the SIGNED_IN event
            await new Promise(resolve => setTimeout(resolve, 100));

            // Navigate to dashboard (it will verify admin role)
            navigate("/admin");

        } catch (err: any) {
            console.error("Admin login error:", err);
            setError(err.message || "Error al iniciar sesión");
            setLoading(false);
        }
        // Don't set loading=false on success because we're navigating away
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl relative overflow-hidden"
            >
                {/* Decorative header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />

                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Acceso Administrativo</h1>
                        <p className="text-zinc-400 text-sm mt-1">Directorio Zona - Super Admin</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                            Credenciales
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <input
                                type="email"
                                placeholder="admin@directoriozona.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-zinc-600"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-zinc-600"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 flex items-start gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-400 text-xs">{error}</p>
                        </motion.div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-6"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Ingresar al Panel"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[10px] text-zinc-600">
                        Acceso restringido únicamente a personal autorizado.
                        <br />
                        Cualquier intento de acceso no autorizado será registrado.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
