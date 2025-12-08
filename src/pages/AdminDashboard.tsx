import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { Button } from "../components/ui/Button";
import { AdminBusinessTable } from "../components/admin/AdminBusinessTable";
import { LeadsTable } from "../components/admin/LeadsTable";
import { AddBusinessForm } from "../components/admin/AddBusinessForm";
import { supabase } from "../lib/supabase";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [accessDenied, setAccessDenied] = useState(false);
    const [activeTab, setActiveTab] = useState<'businesses' | 'leads' | 'add'>('businesses');
    const [leadToConvert, setLeadToConvert] = useState<any>(null);

    useEffect(() => {
        checkAdminAndFetchData();
    }, []);

    const checkAdminAndFetchData = async () => {
        console.log("Checking admin access...");
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log("User:", user?.id);

            if (!user) {
                console.log("No user, redirecting to admin login");
                navigate("/admin/login");
                return;
            }

            // Check admin role
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            console.log("Profile:", profile, "Error:", profileError);

            if (profileError || (profile as any)?.role !== 'admin') {
                console.log("Not admin, access denied");
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            await fetchBusinesses();
            setLoading(false);
        } catch (err) {
            console.error("Unexpected error in AdminDashboard:", err);
            setAccessDenied(true);
            setLoading(false);
        }
    };

    const fetchBusinesses = async () => {
        // Fetch ALL businesses from Supabase
        const { data: dbBusinesses, error } = await supabase
            .from("businesses")
            .select("*");

        if (error) {
            console.error("Error fetching businesses:", error);
            return;
        }

        const dbMap = new Map((dbBusinesses || []).map((b: any) => [b.id, b]));

        // 1. Process static JSON data
        let allBusinesses = (businessesData as Business[]).map(staticBiz => {
            const dbBiz = dbMap.get(staticBiz.id);
            if (dbBiz) {
                // Found in DB, apply overrides
                const planId = dbBiz.plan_id || 'free';
                const isPremiumPlan = planId === 'launch' || planId === 'featured';

                // Remove from map so we know it's processed
                dbMap.delete(staticBiz.id);

                return {
                    ...staticBiz,
                    ...dbBiz, // Apply all DB fields (name, owner_id, etc)
                    isPremium: isPremiumPlan || dbBiz.is_premium || false,
                    planId: planId,
                    ownerId: dbBiz.owner_id,
                };
            }
            // No DB override
            return {
                ...staticBiz,
                planId: 'free' as 'free' | 'launch' | 'featured',
                isPremium: false
            };
        });

        // 2. Add remaining DB businesses (New ones)
        const newBusinesses = Array.from(dbMap.values()).map((dbBiz: any) => {
            const planId = dbBiz.plan_id || 'free';
            const isPremiumPlan = planId === 'launch' || planId === 'featured';

            return {
                id: dbBiz.id,
                name: dbBiz.name,
                category: dbBiz.category,
                address: dbBiz.address,
                description: dbBiz.description,
                lat: Number(dbBiz.lat),
                lng: Number(dbBiz.lng),
                isPremium: isPremiumPlan || dbBiz.is_premium || false,
                planId: planId,
                ownerId: dbBiz.owner_id,
                image: dbBiz.image_url, // Map DB field to frontend field
                rating: 0, // Default
                reviewCount: 0 // Default
            } as Business;
        });

        setBusinesses([...allBusinesses, ...newBusinesses]);
    };

    const handleChangePlan = async (id: number, newPlanId: string) => {
        try {
            // Upsert to Supabase to override
            const { error } = await supabase
                .from("businesses")
                .upsert({
                    id,
                    plan_id: newPlanId,
                    updated_at: new Date().toISOString()
                } as any);

            if (error) throw error;

            // Update local state
            setBusinesses(prev => prev.map(b => {
                if (b.id === id) {
                    const isPremiumPlan = newPlanId === 'launch' || newPlanId === 'featured';
                    return { ...b, planId: newPlanId as any, isPremium: isPremiumPlan };
                }
                return b;
            }));

        } catch (error) {
            console.error("Error changing plan:", error);
            alert("Error al actualizar el plan");
        }
    };

    const handleAssignOwner = async (id: number) => {
        const input = window.prompt("Ingrese el Email o UUID del usuario dueño:");
        if (!input) return;

        let ownerId = input;

        // If input looks like an email, try to find user in profiles
        if (input.includes('@')) {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', input)
                    .single();

                if (data) {
                    ownerId = (data as any).id;
                } else {
                    // Fallback: maybe they meant UUID but typed email? 
                    // Or maybe profile doesn't have email.
                    // We can't easily lookup auth.users from client.
                    alert("No se encontró usuario con ese email en perfiles. Intente con el UUID.");
                    return;
                }
            } catch (err) {
                console.error("Error looking up user by email:", err);
                // If column doesn't exist, this will fail.
                alert("Error buscando por email. Por favor use el UUID (Supabase Auth).");
                return;
            }
        }

        try {
            const { error } = await supabase
                .from("businesses")
                .upsert({
                    id,
                    owner_id: ownerId,
                    updated_at: new Date().toISOString()
                } as any);

            if (error) throw error;

            // Update local state
            setBusinesses(prev => prev.map(b =>
                b.id === id ? { ...b, ownerId } : b
            ));
            alert("Dueño asignado correctamente");
        } catch (error) {
            console.error("Error assigning owner:", error);
            alert("Error al asignar dueño. Verifique que el UUID sea válido.");
        }
    };

    const handleToggleVisibility = async (id: number, currentStatus: boolean) => {
        // Placeholder for visibility logic
        console.log("Toggle visibility", id, currentStatus);
        alert("Funcionalidad de ocultar próximamente");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Verificando acceso...</p>
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 p-4 text-center">
                <Shield className="w-12 h-12 text-red-500" />
                <h1 className="text-2xl font-bold">Acceso Restringido</h1>
                <p className="text-muted-foreground">No tienes permisos de administrador.</p>
                <div className="text-xs text-muted-foreground bg-muted p-4 rounded max-w-md text-left overflow-auto">
                    <p className="font-bold mb-2">Debug Info:</p>
                    <p>Asegúrate de que en la tabla 'profiles' de Supabase:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Tu usuario existe (ID coincide con Auth).</li>
                        <li>La columna 'role' tiene el valor 'admin'.</li>
                    </ul>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.reload()} variant="outline">Reintentar</Button>
                    <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">Panel de Super Admin</h1>
                        <p className="text-xs text-muted-foreground">Gestión total del directorio</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                </Button>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8 space-y-6">

                {/* Stats / Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Negocios</p>
                            <h3 className="text-2xl font-bold">{businesses.length}</h3>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Shield className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-1 overflow-x-auto">
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'businesses' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('businesses')}
                    >
                        Negocios
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'leads' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('leads')}
                    >
                        Solicitudes (Leads)
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'add' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('add')}
                    >
                        + Agregar Negocio
                    </button>
                </div>

                <div className="glass-card p-6 rounded-xl min-h-[500px]">
                    {activeTab === 'businesses' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Gestión de Negocios</h2>
                            <AdminBusinessTable
                                businesses={businesses}
                                onChangePlan={handleChangePlan}
                                onToggleVisibility={handleToggleVisibility}
                                onAssignOwner={handleAssignOwner}
                            />
                        </>
                    )}

                    {activeTab === 'leads' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Solicitudes de Ingreso</h2>
                            <LeadsTable onConvert={(lead) => {
                                setLeadToConvert(lead);
                                setActiveTab('add');
                            }} />
                        </>
                    )}

                    {activeTab === 'add' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Agregar Nuevo Negocio</h2>
                            <AddBusinessForm
                                initialData={leadToConvert ? {
                                    name: leadToConvert.business_name,
                                    description: leadToConvert.notes,
                                    address: '', // Lead doesn't have address usually, or put placeholder
                                    category: '',
                                    lat: 25.6866, // Default to MTY
                                    lng: -100.3161
                                } : undefined}
                                onSuccess={() => {
                                    setActiveTab('businesses');
                                    setLeadToConvert(null);
                                    fetchBusinesses(); // Refresh list
                                }}
                                onCancel={() => {
                                    setActiveTab('businesses');
                                    setLeadToConvert(null);
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
