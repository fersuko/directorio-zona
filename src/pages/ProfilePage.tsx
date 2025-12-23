import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { User, LogOut, Settings, Heart, Shield, Store, Edit, Save, X, Phone } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js"; // Fix import

export default function ProfilePage() {
    const [session, setSession] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<any>(null); // Keep as any for flexibility or defined interface
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ full_name: "", phone: "" });

    const navigate = useNavigate();

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate("/login");
                return;
            }

            setSession(user);

            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) throw error;

            // Redirect Business Owners to Dashboard
            if ((data as any)?.role === 'business_owner') {
                navigate("/dashboard");
                return;
            }

            // Redirect Admins to Admin Panel
            if ((data as any)?.role === 'admin') {
                navigate("/admin");
                return;
            }

            if (data) {
                setProfile(data);
                setFormData({
                    full_name: data.full_name || "",
                    phone: data.phone || ""
                });
            }
        } catch (error: any) {
            console.error("Error loading profile:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!session?.id) return;

        try {
            const { error } = await (supabase as any)
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    updated_at: new Date().toISOString()
                })
                .eq("id", session.id);

            if (error) throw error;

            setProfile({ ...profile, ...formData });
            setIsEditing(false);
            alert("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al actualizar perfil");
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
                <div className="w-20 h-20 bg-gradient-to-br from-brand-blue/10 to-brand-red/10 rounded-full flex items-center justify-center mb-2 border border-brand-blue/10 shadow-inner">
                    <User className="w-10 h-10 text-brand-blue" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">No has iniciado sesión</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                    Ingresa para ver tu perfil, guardar favoritos y acceder a promociones exclusivas.
                </p>
                <Button
                    onClick={() => navigate("/login")}
                    className="w-full max-w-xs bg-gradient-to-r from-brand-blue to-brand-red text-white font-bold py-6 shadow-lg hover:shadow-brand-blue/20 transition-all border-none"
                >
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
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-brand-red/20 z-0" />

                {/* Edit Toggle Button */}
                <div className="absolute top-4 right-4 z-20">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (isEditing) handleSaveProfile();
                            else setIsEditing(true);
                        }}
                        className={`backdrop-blur-md transition-all ${isEditing ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        {isEditing ? (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Guardar
                            </>
                        ) : (
                            <>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </>
                        )}
                    </Button>
                    {isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            className="ml-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 backdrop-blur-md"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-red p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {(profile?.full_name?.[0] || session.email?.[0] || "U").toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <div className="space-y-2 pr-20">
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Nombre completo"
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <input
                                    type="tel"
                                    value={formData.phone || ""}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Teléfono (Opcional)"
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-xl font-bold truncate">
                                    {profile?.full_name || "Usuario"}
                                </h1>
                                <p className="text-sm text-muted-foreground truncate">
                                    {session.email}
                                </p>
                                {profile?.phone && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3" />
                                        {profile.phone}
                                    </p>
                                )}
                            </>
                        )}

                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/20">
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
                    onClick={() => navigate("/favorites")}
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
                    onClick={() => navigate("/settings")}
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

                {profile?.role === 'business_owner' ? (
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
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/unete")}
                        className="w-full glass p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors border-brand-red/20 bg-brand-red/5"
                    >
                        <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red">
                            <Store className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium text-brand-red/90">Registra tu Negocio</h3>
                            <p className="text-xs text-muted-foreground">¡Haz crecer tus ventas hoy!</p>
                        </div>
                    </motion.button>
                )}
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
