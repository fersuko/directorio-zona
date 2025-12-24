import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, Users, Search, Store, Star, MousePointerClick } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AdminBusinessTable } from "../components/admin/AdminBusinessTable";
import { LeadsTable } from "../components/admin/LeadsTable";
import { AddBusinessForm } from "../components/admin/AddBusinessForm";
import { UserTable } from "../components/admin/UserTable";
import { StatsCard } from "../components/dashboard/StatsCard";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { TransferOwnershipModal } from "../components/admin/TransferOwnershipModal";
import { supabase } from "../lib/supabase";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    // Data State
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({
        scannedBusinesses: 0,
        totalLeads: 0,
        totalReviews: 0,
        totalUsers: 0
    });

    // UI State
    const [activeTab, setActiveTab] = useState<'businesses' | 'leads' | 'users' | 'add'>('businesses');
    const [leadToConvert, setLeadToConvert] = useState<any>(null);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [transferData, setTransferData] = useState<{ isOpen: boolean; businessId?: number; businessName?: string }>({ isOpen: false });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'business' | 'user' | 'lead'; id: any; name: string } | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'launch' | 'featured'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'hidden'>('all');

    useEffect(() => {
        checkAdminAndFetchData();
    }, []);

    const checkAdminAndFetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate("/admin/login");
                return;
            }

            // Check admin role using secure RPC to avoid RLS hangs
            const { data: role, error: roleError } = await supabase.rpc('get_my_role');

            if (roleError || role !== 'admin') {
                console.error("Access denied or API error:", roleError);
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            // Legacy profile check removed in favor of RPC

            setAccessDenied(true);
            setLoading(false);
            // If we reach here, the user is an admin.
            setAccessDenied(false); // Corrected: Should be false if admin.

            await Promise.all([
                fetchBusinesses(),
                fetchStats(),
                fetchUsers()
            ]);

            setLoading(false);
        } catch (err) {
            console.error("Unexpected error in AdminDashboard:", err);
            setAccessDenied(true);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Get counts
            const leadsCount = await supabase.from("leads").select('*', { count: 'exact', head: true });
            const reviewsCount = await supabase.from("reviews").select('*', { count: 'exact', head: true });
            const usersCount = await supabase.from("profiles").select('*', { count: 'exact', head: true });

            setStats(prev => ({
                ...prev,
                totalLeads: leadsCount.count || 0,
                totalReviews: reviewsCount.count || 0,
                totalUsers: usersCount.count || 0
            }));
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.rpc('admin_get_all_users');
            if (!error && data) {
                setUsers(data);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const fetchBusinesses = async () => {
        try {
            const { data: dbBusinesses, error } = await supabase.rpc('admin_get_all_businesses');

            if (error) {
                console.error("Error fetching businesses:", error);
                return;
            }

            // ONLY show database data. Do not merge with local JSON.
            // This prevents "ghost" data from appearing after a reset.
            setBusinesses(dbBusinesses || []);
            setStats(prev => ({ ...prev, scannedBusinesses: (dbBusinesses || []).length }));

        } catch (err) {
            console.error("Error in fetchBusinesses:", err);
        }
    };

    const handleChangePlan = async (id: number, newPlanId: string) => {
        try {
            const business = businesses.find(b => b.id === id);
            if (!business) return;

            // Prepare object for UPSERT
            // If it's a static business not in DB yet, we send all fields to create it.
            // If it's already in DB, upsert will update only provided fields (or all if we send all).
            const isPremiumPlan = newPlanId === 'launch' || newPlanId === 'featured';

            const { error } = await (supabase
                .from("businesses") as any)
                .upsert({
                    id: business.id,
                    name: business.name,
                    category: business.category,
                    address: business.address,
                    description: business.description,
                    lat: business.lat,
                    lng: business.lng,
                    plan_id: newPlanId,
                    is_premium: isPremiumPlan,
                    owner_id: business.ownerId || (await supabase.auth.getUser()).data.user?.id,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) throw error;

            setBusinesses(prev => prev.map(b => {
                if (b.id === id) {
                    return { ...b, planId: newPlanId as any, isPremium: isPremiumPlan };
                }
                return b;
            }));

        } catch (error: any) {
            console.error("Error changing plan:", error);
            alert(`Error al actualizar el plan: ${error.message || 'Error de base de datos'}`);
        }
    };

    const handleAssignOwner = (id: number) => {
        const business = businesses.find(b => b.id === id);
        if (business) {
            setTransferData({ isOpen: true, businessId: id, businessName: business.name });
        }
    };

    const confirmTransfer = async (newOwnerId: string) => {
        if (!transferData.businessId) return;

        try {
            const { error } = await supabase
                .from("businesses")
                .upsert({
                    id: transferData.businessId,
                    owner_id: newOwnerId,
                    updated_at: new Date().toISOString()
                } as any);

            if (error) throw error;

            setBusinesses(prev => prev.map(b => b.id === transferData.businessId ? { ...b, ownerId: newOwnerId } : b));
            setTransferData({ isOpen: false });
            alert("Transferencia exitosa.");
        } catch (error) {
            console.error("Error assigning owner:", error);
            alert("Error al asignar dueño.");
        }
    };

    const handleToggleVisibility = async (id: number, currentStatus: boolean) => {
        try {
            const business = businesses.find(b => b.id === id);
            if (!business) return;

            // Use full object for upsert to ensure it exists if it's static
            const { error } = await (supabase
                .from("businesses") as any)
                .upsert({
                    ...business,
                    id,
                    is_hidden: !currentStatus,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) throw error;

            setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isHidden: !currentStatus } : b));
        } catch (error: any) {
            console.error("Error toggling visibility:", error);
            alert(`Error al cambiar visibilidad: ${error.message || 'Error de base de datos'}`);
        }
    };

    const handleDelete = (id: number, name: string) => setDeleteConfirm({ type: 'business', id, name });
    const handleDeleteUser = (id: string, name: string) => setDeleteConfirm({ type: 'user', id, name });
    const handleDeleteLead = (id: string) => setDeleteConfirm({ type: 'lead', id, name: 'Solicitud' });

    const handleUpdateUserRole = async (id: string, newRole: 'admin' | 'user') => {
        if (!window.confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;

        try {
            const { error } = await (supabase
                .from("profiles") as any)
                .update({ role: newRole })
                .eq("id", id);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Error al actualizar rol");
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const { type, id } = deleteConfirm;

        try {
            let error;

            if (type === 'business') {
                const { error: err } = await supabase.from("businesses").delete().eq('id', id);
                error = err;
                if (!error) setBusinesses(prev => prev.filter(b => b.id !== id));
            } else if (type === 'user') {
                // Call the secure admin_delete_user RPC
                const { error: err } = await (supabase as any).rpc('admin_delete_user', { target_user_id: id });
                error = err;
                if (!error) setUsers(prev => prev.filter(u => u.id !== id));
            } else if (type === 'lead') {
                const { error: err } = await supabase.from("leads").delete().eq('id', id);
                error = err;
                if (!error) {
                    window.location.reload();
                }
            }

            if (error) throw error;
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error al eliminar");
        }
    };

    const handleEdit = (business: Business) => {
        setEditingBusiness(business);
        setActiveTab('add');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
    };

    const handleSyncData = async () => {
        if (!window.confirm("⚠️ ¿Estás seguro de sincronizar los datos del JSON? \n\nEsto subirá todos los negocios del archivo a la base de datos de producción. Solo hazlo una vez para migrar.")) return;

        setIsSyncing(true);
        setSyncProgress(0);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Prepare batches of 50 to avoid timeouts
            const batchSize = 50;
            const businessesToSync = businessesData as any[];

            for (let i = 0; i < businessesToSync.length; i += batchSize) {
                const chunk = businessesToSync.slice(i, i + batchSize);
                const progress = Math.min(i + batchSize, businessesToSync.length);
                setSyncProgress(progress);
                console.log(`Sincronizando lote ${i / batchSize + 1}... (${progress}/${businessesToSync.length})`);

                const batch = chunk.map(biz => ({
                    id: biz.id,
                    name: biz.name,
                    category: biz.category,
                    group_name: biz.group,
                    address: biz.address,
                    description: biz.description,
                    lat: biz.lat,
                    lng: biz.lng,
                    image_url: biz.image || null,
                    is_premium: biz.isPremium || false,
                    owner_id: user.id
                }));

                const { error } = await (supabase
                    .from("businesses") as any)
                    .upsert(batch, { onConflict: 'id' });

                if (error) {
                    console.error("Error en lote:", error);
                    throw error;
                }
            }

            alert(`🎉 ¡Éxito! Se han sincronizado ${businessesToSync.length} negocios correctamente de la base de datos estática.`);
            fetchBusinesses();
        } catch (error: any) {
            console.error("Error syncing data:", error);
            alert(`❌ Error durante la migración: ${error.message || 'Error desconocido'}\n\nRevisa la consola para más detalles.`);
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredBusinesses = useMemo(() => {
        return businesses.filter(b => {
            const matchesSearch = searchTerm === "" ||
                b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.ownerId?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPlan = filterPlan === 'all' || b.planId === filterPlan;

            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'hidden' && b.isHidden) ||
                (filterStatus === 'published' && !b.isHidden);

            return matchesSearch && matchesPlan && matchesStatus;
        });
    }, [businesses, searchTerm, filterPlan, filterStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Cargando panel...</p>
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
                <Button onClick={() => navigate("/")}>Volver al Inicio</Button>
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
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSyncData}
                        disabled={isSyncing}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                    >
                        {isSyncing ? `Sincronizando (${syncProgress}/${businessesData.length})...` : "Sincronizar JSON → DB"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Salir
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Negocios Totales"
                        value={stats.scannedBusinesses}
                        icon={Store}
                        planId="featured"
                    />
                    <StatsCard
                        title="Solicitudes (Leads)"
                        value={stats.totalLeads}
                        icon={MousePointerClick}
                        planId="featured"
                    />
                    <StatsCard
                        title="Reviews Activas"
                        value={stats.totalReviews}
                        icon={Star}
                        planId="featured"
                    />
                    <StatsCard
                        title="Usuarios Registrados"
                        value={stats.totalUsers}
                        icon={Users}
                        planId="featured"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-1 overflow-x-auto">
                    {[
                        { id: 'businesses', label: 'Negocios' },
                        { id: 'leads', label: 'Solicitudes' },
                        { id: 'users', label: 'Usuarios' },
                        { id: 'add', label: '+ Agregar Negocio' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setActiveTab(tab.id as any)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters Bar (Only for Businesses Tab) */}
                {activeTab === 'businesses' && (
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="relative w-full md:w-auto md:flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o dueño..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                            <select
                                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                            >
                                <option value="all">Todos los Estados</option>
                                <option value="published">Publicados</option>
                                <option value="hidden">Ocultos</option>
                            </select>

                            <select
                                className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                value={filterPlan}
                                onChange={(e) => setFilterPlan(e.target.value as any)}
                            >
                                <option value="all">Todos los Planes</option>
                                <option value="free">Free</option>
                                <option value="launch">Launch</option>
                                <option value="featured">Featured</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="glass-card p-6 rounded-xl min-h-[500px]">
                    {activeTab === 'businesses' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold">
                                    Gestión de Negocios
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        ({filteredBusinesses.length} resultados)
                                    </span>
                                </h2>
                            </div>
                            <AdminBusinessTable
                                businesses={filteredBusinesses}
                                onChangePlan={handleChangePlan}
                                onToggleVisibility={handleToggleVisibility}
                                onAssignOwner={handleAssignOwner}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </>
                    )}

                    {activeTab === 'leads' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Solicitudes de Ingreso</h2>
                            <LeadsTable
                                onConvert={(lead) => {
                                    setLeadToConvert(lead);
                                    setActiveTab('add');
                                }}
                                onDelete={handleDeleteLead}
                            />
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Usuarios Registrados</h2>
                            <UserTable
                                users={users}
                                onDelete={handleDeleteUser}
                                onUpdateRole={handleUpdateUserRole}
                            />
                        </>
                    )}

                    {activeTab === 'add' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">
                                {editingBusiness ? "Editar Negocio" : "Agregar Nuevo Negocio"}
                            </h2>
                            <AddBusinessForm
                                initialData={editingBusiness || (leadToConvert ? {
                                    name: leadToConvert.business_name,
                                    description: leadToConvert.notes,
                                    address: '',
                                    category: '',
                                    lat: 25.6866,
                                    lng: -100.3161
                                } : undefined)}
                                onSuccess={() => {
                                    setActiveTab('businesses');
                                    setLeadToConvert(null);
                                    setEditingBusiness(null);
                                    fetchBusinesses();
                                }}
                                onCancel={() => {
                                    setActiveTab('businesses');
                                    setLeadToConvert(null);
                                    setEditingBusiness(null);
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title={deleteConfirm?.type === 'user' ? "¿Eliminar Usuario?" : "Confirmar Acción"}
                message={`¿Estás seguro de que deseas eliminar "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />

            <TransferOwnershipModal
                isOpen={transferData.isOpen}
                onClose={() => setTransferData({ ...transferData, isOpen: false })}
                onConfirm={confirmTransfer}
                businessName={transferData.businessName || ""}
                users={users}
            />
        </div>
    );
}
