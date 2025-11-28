import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { User, LogOut, Settings, Heart, Shield } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

export default function ProfilePage() {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setLoading(false);
        });
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                    <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">No has iniciado sesión</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                    Ingresa para ver tu perfil, guardar favoritos y acceder a promociones exclusivas.
                </p>
                <Button onClick={() => navigate("/login")} variant="premium" className="w-full max-w-xs">
                    Iniciar Sesión
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 z-0" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {(profile?.full_name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold truncate">
                            {profile?.full_name || "Usuario"}
                        </h1>
                        <p className="text-sm text-muted-foreground truncate">
                            {session.user.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
                                {profile?.role === 'business_owner' ? 'Dueño de Negocio' : 'Miembro'}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Menu Options */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground px-1">Mi Cuenta</h2>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full glass p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                        <Heart className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-medium">Mis Favoritos</h3>
                        <p className="text-xs text-muted-foreground">Negocios guardados</p>
                    </div>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full glass p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-medium">Configuración</h3>
                        <p className="text-xs text-muted-foreground">Notificaciones y privacidad</p>
                    </div>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/dashboard")}
                    className="w-full glass p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors border border-primary/20"
                >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-medium">Panel de Negocio</h3>
                        <p className="text-xs text-muted-foreground">Gestionar mi negocio</p>
                    </div>
                </motion.button>
            </div>

            <Button
                variant="ghost"
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleLogout}
            >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
            </Button>
        </div>
    );
}
