import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Store, Tag, Settings, LogOut, MessageSquare, Eye, Phone, MapPin, Share2, Star, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { PromoManager } from "../components/dashboard/PromoManager";
import { BusinessImageManager } from "../components/dashboard/BusinessImageManager";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { BusinessInfoEditor } from "../components/dashboard/BusinessInfoEditor";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState<string>("Cargando tu negocio...");
    const [business, setBusiness] = useState<any>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    // Simplified auth check using AuthContext
    useEffect(() => {
        // If no user, redirect to login
        if (!user) {
            navigate("/login");
            return;
        }

        // Wait for profile to load before checking role
        if (profile === null) {
            console.log("[DashboardPage] Waiting for profile to load...");
            return;
        }

        // Check role - must be business_owner or admin
        if (profile.role !== 'business_owner' && profile.role !== 'admin') {
            console.log("[DashboardPage] Redirecting to profile. Role:", profile.role);
            navigate("/profile");
            return;
        }

        // Load business data
        const loadBusinessData = async () => {
            try {
                setLoadingStep("Cargando información del negocio...");

                // Fetch business for this owner
                const { data: businessData, error } = await supabase
                    .from("businesses")
                    .select("*")
                    .eq("owner_id", user.id)
                    .maybeSingle();

                if (error) throw error;

                if (businessData) {
                    console.log("[DashboardPage] Business found:", (businessData as any).id);
                    setBusiness(businessData);
                    await loadAdditionalData((businessData as any).id);
                }

                // Set profile form with existing data
                setProfileForm({
                    full_name: profile.full_name || "",
                    phone: profile.phone || ""
                });

                console.log("[DashboardPage] Loaded successfully");
            } catch (error) {
                console.error("[DashboardPage] Error loading data:", error);
                setLoadingStep("Error al cargar datos.");
            } finally {
                setLoading(false);
            }
        };

        const loadAdditionalData = async (bId: number) => {
            try {
                // 1. Fetch Reviews
                const { data: reviewsData } = await supabase
                    .from("reviews")
                    .select("*, profiles(full_name, avatar_url)")
                    .eq("business_id", bId)
                    .order("created_at", { ascending: false });

                setReviews(reviewsData || []);

                // 2. Fetch Analytics Events for Activity Feed
                const { data: events } = await supabase
                    .from("analytics_events")
                    .select("*")
                    .filter("metadata->>business_id", "eq", bId.toString())
                    .order("created_at", { ascending: false })
                    .limit(20);

                // Combine and format for activity feed
                const activities = [
                    ...(reviewsData || []).map((r: any) => ({
                        id: `rev-${r.id}`,
                        type: 'review',
                        title: 'Nueva reseña',
                        subtitle: `${(r as any).profiles?.full_name || 'Alguien'} calificó con ${(r as any).rating} ⭐`,
                        timestamp: r.created_at,
                        icon: Star
                    })),
                    ...(events || []).map((e: any) => ({
                        id: `ev-${e.id}`,
                        type: e.event_type,
                        title: e.event_type === 'business_view' ? 'Nueva visita' :
                            e.event_type === 'click_call' ? 'Clic en llamar' :
                                e.event_type === 'click_gps' ? 'Clic en el mapa' : 'Clic en compartir',
                        subtitle: e.event_type === 'business_view' ? 'Alguien vio tu negocio' :
                            'Un cliente potencial se interesó',
                        timestamp: e.created_at,
                        icon: e.event_type === 'business_view' ? Eye :
                            e.event_type === 'click_call' ? Phone :
                                e.event_type === 'click_gps' ? MapPin : Share2
                    }))
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10);

                setRecentActivity(activities);
            } catch (err) {
                console.error("[DashboardPage] Error loading additional data:", err);
            }
        };

        loadBusinessData();
    }, [user, profile, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-medium animate-pulse">{loadingStep}</p>
                        <p className="text-xs text-muted-foreground">Preparando tu panel de negocio</p>
                    </div>
                </div>
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
                        { id: "reviews", label: "Reseñas", icon: MessageSquare },
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

            {/* Content Area */}
            <div className="px-4 space-y-6 pb-10">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <DashboardStats
                            businessId={business?.id}
                            planId={business?.plan_id || 'free'}
                        />

                        <div className="glass-card p-4 rounded-xl">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Actividad Reciente
                            </h3>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((act) => (
                                        <div key={act.id} className="flex items-start gap-3 text-sm border-b border-white/5 pb-3 last:border-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.type === 'review' ? 'bg-yellow-500/10 text-yellow-500' :
                                                act.type === 'business_view' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-green-500/10 text-green-500'
                                                }`}>
                                                <act.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{act.title}</p>
                                                <p className="text-xs text-muted-foreground">{act.subtitle}</p>
                                                <p className="text-[10px] opacity-40 mt-1">
                                                    {new Date(act.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="space-y-6">
                        <div className="glass-card p-4 rounded-xl">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                Reseñas de Clientes
                            </h3>
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((rev) => (
                                        <div key={rev.id} className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                                        {(rev as any).profiles?.avatar_url ? (
                                                            <img src={(rev as any).profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-4 h-4 text-primary" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{(rev as any).profiles?.full_name || 'Anónimo'}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {new Date(rev.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < (rev as any).rating ? 'fill-yellow-500 text-yellow-500' : 'text-white/20'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground italic">"{(rev as any).comment}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 opacity-50 space-y-2">
                                        <MessageSquare className="w-12 h-12 mx-auto" />
                                        <p className="text-sm font-medium">Aún no tienes reseñas.</p>
                                    </div>
                                )}
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
                            {business ? (
                                <BusinessInfoEditor
                                    businessId={business.id}
                                    initialData={business}
                                    onUpdate={() => window.location.reload()}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No hay información de negocio disponible.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "promos" && (
                    business ? (
                        <PromoManager
                            planId={business?.plan_id || 'free'}
                            businessName={business?.name}
                            businessId={business?.id}
                        />
                    ) : (
                        <div className="glass-card p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-center">
                            <p className="text-sm text-muted-foreground">
                                Debes tener un negocio vinculado para gestionar promociones.
                            </p>
                        </div>
                    )
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
                                                const { error } = await (supabase as any)
                                                    .from("profiles")
                                                    .update({
                                                        full_name: profileForm.full_name,
                                                        phone: profileForm.phone,
                                                        updated_at: new Date().toISOString()
                                                    })
                                                    .eq("id", user?.id);

                                                if (error) throw error;
                                                setIsEditingProfile(false);
                                                alert("Perfil actualizado. Recarga la página para ver los cambios.");
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
