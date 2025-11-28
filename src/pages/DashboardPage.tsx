import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Store, Tag, Settings, LogOut } from "lucide-react";
import { Button } from "../components/ui/Button";
import { StatsCard } from "../components/dashboard/StatsCard";
import { PromoManager } from "../components/dashboard/PromoManager";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

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
                        <div className="grid grid-cols-2 gap-4">
                            <StatsCard
                                title="Visitas Totales"
                                value="1,234"
                                icon={Store}
                                trend="12%"
                                trendUp={true}
                            />
                            <StatsCard
                                title="Promos Canjeadas"
                                value="56"
                                icon={Tag}
                                trend="5%"
                                trendUp={true}
                            />
                            <StatsCard
                                title="Clics en Mapa"
                                value="89"
                                icon={BarChart3}
                                trend="2%"
                                trendUp={false}
                            />
                        </div>

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
                    <div className="glass-card p-6 rounded-xl text-center py-12">
                        <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-bold text-lg">Editar Perfil</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            Aquí podrás editar la información de tu negocio, horarios y fotos.
                        </p>
                        <Button variant="secondary">Próximamente</Button>
                    </div>
                )}

                {activeTab === "promos" && (
                    <PromoManager />
                )}

                {activeTab === "settings" && (
                    <div className="glass-card p-6 rounded-xl text-center py-12">
                        <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-bold text-lg">Ajustes de Cuenta</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            Gestiona tu suscripción y preferencias.
                        </p>
                        <Button variant="secondary">Próximamente</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
