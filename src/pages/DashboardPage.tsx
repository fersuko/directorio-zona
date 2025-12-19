import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Store, Tag, Settings, LogOut } from "lucide-react";
import { Button } from "../components/ui/Button";
import { PromoManager } from "../components/dashboard/PromoManager";
import { BusinessImageManager } from "../components/dashboard/BusinessImageManager";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { BusinessInfoEditor } from "../components/dashboard/BusinessInfoEditor";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    navigate("/login");
                    return;
                }

                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (profileError) throw profileError;

                if ((profileData as any)?.role !== 'business_owner') {
                    navigate("/profile");
                    return;
                }

                setProfile(profileData);
                setProfileForm({
                    full_name: profileData.full_name || "",
                    phone: profileData.phone || ""
                });

                const { data: businessData, error: businessError } = await supabase
                    .from("businesses")
                    .select("*")
                    .eq("owner_id", user.id)
                    .maybeSingle();

                if (businessError) throw businessError;

                if (businessData) {
                    setBusiness(businessData);
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                <h1 className="font-bold text-lg">Panel de Negocio</h1>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>

            {/* Tabs */}
            <div className="px-4 py-4 overflow-x-auto">
                <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-max">
                    {[
                        { id: "overview", label: "Resumen", icon: BarChart3 },
                        { id: "business", label: "Mi Negocio", icon: Store },
                        { id: "promos", label: "Promociones", icon: Tag },
                        { id: "settings", label: "Ajustes", icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 space-y-6">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <DashboardStats
                            businessId={business?.id}
                            planId={business?.plan_id || 'free'}
                        />

                        <div className="glass-card p-4 rounded-xl">
                            <h3 className="font-bold mb-4">Actividad Reciente</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm border-b border-white/5 pb-3 last:border-0">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Promo canjeada</p>
                                            <p className="text-xs text-muted-foreground">Hace {i * 15} minutos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "business" && (
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-2">Perfil de Negocio</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Personaliza la imagen de tu negocio para atraer más clientes
                            </p>

                            <BusinessImageManager />
                        </div>

                        <div className="glass-card p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-4">Información del Negocio</h3>
                            <BusinessInfoEditor
                                businessId={business?.id}
                                initialData={business}
                                onUpdate={() => window.location.reload()} // Simple reload to refresh data for now
                            />
                        </div>
                    </div>
                )}

                {activeTab === "promos" && (
                    <PromoManager
                        planId={business?.plan_id || 'free'}
                        businessName={business?.name}
                        businessId={business?.id}
                    />
                )}

                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-lg">Perfil Personal</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Tus datos como dueño del negocio.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                        if (isEditingProfile) {
                                            try {
                                                const { error } = await supabase
                                                    .from("profiles")
                                                    .update({
                                                        full_name: profileForm.full_name,
                                                        phone: profileForm.phone,
                                                        updated_at: new Date().toISOString()
                                                    } as any)
                                                    .eq("id", profile.id);

                                                if (error) throw error;
                                                setProfile({ ...profile, ...profileForm });
                                                setIsEditingProfile(false);
                                                alert("Perfil actualizado");
                                            } catch (e) {
                                                console.error(e);
                                                alert("Error al guardar");
                                            }
                                        } else {
                                            setIsEditingProfile(true);
                                        }
                                    }}
                                    className={isEditingProfile ? "text-green-400 bg-green-500/10" : ""}
                                >
                                    {isEditingProfile ? "Guardar Cambios" : "Editar Perfil"}
                                </Button>
                            </div>

                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                                    <div className="p-2 rounded bg-white/5 border border-white/10 text-sm opacity-60">
                                        {profile?.email || "No disponible"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Nombre Completo</label>
                                        {isEditingProfile ? (
                                            <input
                                                type="text"
                                                value={profileForm.full_name}
                                                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Tu nombre"
                                            />
                                        ) : (
                                            <div className="p-2 rounded bg-white/5 border border-white/10 text-sm font-medium">
                                                {profile?.full_name || "Sin nombre"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">Teléfono Personal</label>
                                        {isEditingProfile ? (
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Tu teléfono"
                                            />
                                        ) : (
                                            <div className="p-2 rounded bg-white/5 border border-white/10 text-sm font-medium">
                                                {profile?.phone || "Sin teléfono"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-red-500/20">
                            <h3 className="font-bold text-lg text-red-400 mb-2">Zona de Peligro</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Acciones irreversibles para tu cuenta.
                            </p>
                            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                Eliminar Cuenta
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
