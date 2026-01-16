import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, ChevronRight, LogOut, Save, Loader2, ChevronDown, Lock, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

type SettingItem =
    | { id?: string; type: 'link'; icon: React.ReactNode; label: string; onClick: () => void }
    | { id?: string; type: 'button'; icon: React.ReactNode; label: string; onClick: () => void; danger: boolean }
    | { id?: string; type: 'expandable'; icon: React.ReactNode; label: string; onClick: () => void; isOpen: boolean };

interface SettingSection {
    title: string;
    items: SettingItem[];
}

export default function SettingsPage() {
    const navigate = useNavigate();

    // Profile Data
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ full_name: "", phone: "" });
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    // Dialogs
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await (supabase as any)
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                // Merge auth email if missing in profile
                const completeProfile = { ...data, email: data.email || user.email };
                setProfile(completeProfile);
                setFormData({
                    full_name: data.full_name || "",
                    phone: data.phone || ""
                });
            } else if (user) {
                // Fallback if no profile row exists yet
                setProfile({ id: user.id, email: user.email });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!profile?.id) return;
        setSaving(true);
        try {
            const { error } = await (supabase as any)
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    updated_at: new Date().toISOString()
                })
                .eq("id", profile.id);

            if (error) throw error;
            setProfile({ ...profile, ...formData });
            setExpandedItem(null); // Close after save
            alert("Perfil actualizado correctamente.");
        } catch (error) {
            console.error(error);
            alert("Error al actualizar perfil.");
        } finally {
            setSaving(false);
        }
    };

    const confirmPasswordReset = async () => {
        setResetLoading(true);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user || !user.email) {
                alert("Error: No se pudo identificar al usuario. Intenta cerrar e iniciar sesión.");
                setResetLoading(false);
                setResetConfirmOpen(false);
                return;
            }

            const email = user.email;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setResetConfirmOpen(false);
            alert(`✅ Correo enviado a ${email}.\nRevisa tu bandeja de entrada.`);
        } catch (error: any) {
            console.error("Error sending reset email:", error);
            alert("Error al enviar correo: " + error.message);
        } finally {
            setResetLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const { error } = await supabase.rpc('delete_own_account');
            if (error) throw error;
            await supabase.auth.signOut();
            alert("Tu cuenta ha sido eliminada.");
            navigate("/");
        } catch (error: any) {
            console.error("Error deleting account:", error);
            alert("Error al eliminar cuenta: " + error.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const toggleExpand = (id: string) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    const sections: SettingSection[] = [
        {
            title: "Cuenta y Seguridad",
            items: [
                {
                    id: "edit_profile",
                    type: "expandable",
                    icon: <User className="w-5 h-5 text-green-400" />,
                    label: "Editar Perfil",
                    isOpen: expandedItem === "edit_profile",
                    onClick: () => toggleExpand("edit_profile")
                },
                {
                    type: "link",
                    icon: <Lock className="w-5 h-5 text-orange-400" />,
                    label: "Cambiar Contraseña",
                    onClick: () => setResetConfirmOpen(true)
                }
            ]
        },
        {
            title: "Zona de Peligro",
            items: [
                {
                    type: "button",
                    icon: <LogOut className="w-5 h-5 text-red-400" />,
                    label: "Cerrar Sesión",
                    onClick: handleLogout,
                    danger: true
                },
                {
                    type: "button",
                    icon: <Trash2 className="w-5 h-5 text-red-600" />,
                    label: "Eliminar mi Cuenta",
                    onClick: () => setDeleteConfirmOpen(true),
                    danger: true
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold">Configuración</h1>
            </div>

            <div className="p-4 space-y-6">
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-3"
                    >
                        <h2 className="text-sm font-medium text-muted-foreground px-1">
                            {section.title}
                        </h2>
                        <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/5">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx}>
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={item.onClick}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-white/5 ${(item as any).danger ? 'bg-red-500/10' : ''}`}>
                                                {item.icon}
                                            </div>
                                            <span className={`font-medium ${(item as any).danger ? 'text-red-400' : ''}`}>
                                                {item.label}
                                            </span>
                                        </div>

                                        {(item.type === 'link' || item.type === 'button') && (
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}

                                        {item.type === 'expandable' && (
                                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${item.isOpen ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>

                                    {/* Expandable Content for Profile Edit */}
                                    {item.type === 'expandable' && item.isOpen && item.id === 'edit_profile' && (
                                        <div className="px-4 pb-4 bg-white/5 space-y-4 pt-2 animate-in slide-in-from-top-2">
                                            {loadingProfile ? (
                                                <div className="flex justify-center py-4">
                                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-muted-foreground">Nombre Completo</label>
                                                        <input
                                                            type="text"
                                                            value={formData.full_name}
                                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                                            placeholder="Tu nombre"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-muted-foreground">Teléfono</label>
                                                        <input
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                                            placeholder="Tu teléfono"
                                                        />
                                                    </div>
                                                    <Button
                                                        className="w-full"
                                                        disabled={saving}
                                                        onClick={handleSaveProfile}
                                                    >
                                                        {saving ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Guardando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="w-4 h-4 mr-2" />
                                                                Guardar Cambios
                                                            </>
                                                        )}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                <div className="text-center pt-8 pb-12">
                    <p className="text-xs text-muted-foreground font-semibold">
                        Directorio Zona <span className="text-primary/50">v1.0.0</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-tighter">
                        Hecho con ❤️ en Monterrey
                    </p>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteAccount}
                title="¿Eliminar Cuenta Permanentemente?"
                message="Esta acción borrará todos tus datos, favoritos y configuraciones. No se puede deshacer."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />

            <ConfirmDialog
                isOpen={resetConfirmOpen}
                onClose={() => setResetConfirmOpen(false)}
                onConfirm={confirmPasswordReset}
                title="¿Restablecer Contraseña?"
                message={`Se enviará un correo electrónico a tu dirección registrada para cambiar la contraseña.`}
                confirmText={resetLoading ? "Enviando..." : "Sí, Enviar Correo"}
                cancelText="Cancelar"
            />
        </div>
    );
}
