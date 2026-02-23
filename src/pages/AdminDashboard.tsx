import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, Users, Search, Store, Star, MousePointerClick } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AdminBusinessTable } from "../components/admin/AdminBusinessTable";
import { LeadsTable } from "../components/admin/LeadsTable";
import { AddBusinessForm } from "../components/admin/AddBusinessForm";
import { UserTable } from "../components/admin/UserTable";
import { SmartIngestion } from "../components/admin/SmartIngestion";
import { ReviewModeration } from "../components/admin/ReviewModeration";
import { StatsCard } from "../components/dashboard/StatsCard";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { TransferOwnershipModal } from "../components/admin/TransferOwnershipModal";
import { ResetPasswordModal } from "../components/admin/ResetPasswordModal";
import { AnalyticsDashboard } from "../components/admin/AnalyticsDashboard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Business } from "../types";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState<string>("Verificando permisos...");
    const [accessDenied, setAccessDenied] = useState(false);

    // Data State
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [stats, setStats] = useState({
        scannedBusinesses: 0,
        totalLeads: 0,
        totalReviews: 0,
        totalUsers: 0
    });

    // UI State
    const [activeTab, setActiveTab] = useState<'analytics' | 'businesses' | 'leads' | 'users' | 'reviews' | 'add' | 'ingesta'>('businesses');
    const [leadToConvert, setLeadToConvert] = useState<any>(null);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [transferData, setTransferData] = useState<{ isOpen: boolean; businessId?: string; businessName?: string }>({ isOpen: false });
    const [resetPasswordData, setResetPasswordData] = useState<{ isOpen: boolean; user?: any }>({ isOpen: false });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'business' | 'user' | 'lead'; id: any; name: string; count?: number } | null>(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'exchange' | 'premium' | 'launch' | 'featured'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'hidden'>('all');

    // Simplified auth check using AuthContext
    useEffect(() => {
        // If no user, redirect to login
        if (!user) {
            navigate("/admin/login");
            return;
        }

        // Wait for profile to load before checking role
        if (profile === null) {
            console.log("[AdminDashboard] Waiting for profile to load...");
            return;
        }

        // Check role from profile (already loaded by AuthContext)
        if (profile.role !== 'admin') {
            console.log("[AdminDashboard] Access denied. Role:", profile.role);
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        // User is admin, load dashboard data
        const loadDashboardData = async () => {
            try {
                setCurrentUser(user);
                setLoadingStep("Cargando datos del sistema...");

                await Promise.all([
                    fetchBusinesses(),
                    fetchStats(),
                    fetchUsers()
                ]);

                console.log("[AdminDashboard] Data loaded successfully");
            } catch (error) {
                console.error("[AdminDashboard] Error loading data:", error);
                setLoadingStep("Error al cargar datos.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user, profile, navigate]);

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

            // Map DB data (snake_case) to Frontend model (camelCase)
            // We keep the original object (...b) so hidden fields like group_name or plan_id
            // are available for the editing form.
            const mapped = (dbBusinesses as any[] || []).map(b => ({
                ...b,
                ownerId: b.owner_id,
                planId: b.plan_id,
                isPremium: b.is_premium,
                isHidden: b.is_hidden,
                group: b.group_name,
                image: b.image_url,
                phone: b.phone,
                website: b.website
            })) as Business[];

            setBusinesses(mapped);
            setStats(prev => ({ ...prev, scannedBusinesses: mapped.length }));

        } catch (err) {
            console.error("Error in fetchBusinesses:", err);
        }
    };

    const handleAssignOwner = (id: string) => {
        const business = businesses.find(b => b.id === id);
        if (business) {
            setTransferData({ isOpen: true, businessId: id, businessName: business.name });
        }
    };

    const confirmTransfer = async (newOwnerId: string) => {
        if (!transferData.businessId) return;

        try {
            const { error } = await (supabase
                .from("businesses") as any)
                .update({
                    owner_id: newOwnerId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', transferData.businessId);

            if (error) throw error;

            await fetchBusinesses();
            setTransferData({ isOpen: false });
            alert("Transferencia exitosa.");
        } catch (error) {
            console.error("Error assigning owner:", error);
            alert("Error al asignar dueño.");
        }
    };

    const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await (supabase
                .from("businesses") as any)
                .update({
                    is_hidden: !currentStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            // Refetch to ensure consistency
            await fetchBusinesses();
            console.log(`[Admin] Visibility toggled for business ${id}`);
        } catch (error: any) {
            console.error("Error toggling visibility:", error);
            alert(`Error al cambiar visibilidad: ${error.message || 'Error de base de datos'}`);
        }
    };

    const handleDelete = (id: string, name: string) => setDeleteConfirm({ type: 'business', id, name });
    const handleBulkDelete = (ids: string[]) => setDeleteConfirm({ type: 'business', id: ids, name: `${ids.length} negocios`, count: ids.length });
    const handleDeleteUser = (id: string, name: string) => setDeleteConfirm({ type: 'user', id, name });
    const handleDeleteLead = (id: string) => setDeleteConfirm({ type: 'lead', id, name: 'Solicitud' });

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const { type, id } = deleteConfirm;

        try {
            let error;

            if (type === 'business') {
                const query = supabase.from("businesses").delete();
                const { error: err } = Array.isArray(id) ? await query.in('id', id) : await query.eq('id', id);
                error = err;
                if (!error) {
                    const idsToRemove = Array.isArray(id) ? id : [id];
                    setBusinesses(prev => prev.filter(b => !idsToRemove.includes(b.id)));
                }
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

    const handleResetPasswordClick = (userProfile: any) => {
        setResetPasswordData({ isOpen: true, user: userProfile });
    };

    const handleResetEmail = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`
            });
            if (error) throw error;
            alert(`Éxito: Se ha enviado un enlace de recuperación a ${email}.`);
        } catch (error: any) {
            console.error("Error resetting password via email:", error);
            alert(`Error: ${error.message || 'No se pudo enviar el correo.'}`);
            throw error;
        }
    };

    const handleResetManual = async (targetUserId: string, email: string, newPass: string) => {
        try {
            const { error } = await (supabase as any).rpc('admin_set_user_password', {
                target_user_id: targetUserId,
                new_password: newPass
            });
            if (error) throw error;
            alert(`Éxito: Contraseña de ${email} actualizada manualmente.`);
        } catch (error: any) {
            console.error("Error resetting password manually:", error);
            alert(`Error: ${error.message || 'No se pudo actualizar la contraseña.'}`);
            throw error;
        }
    };

    const handleEdit = (business: Business) => {
        // Find owner email for the form if possible
        const businessOwner = users.find(u => u.id === business.ownerId);

        setEditingBusiness({
            ...business,
            // Ensure fields are mapped for AddBusinessForm (snake_case)
            group_name: (business as any).group_name || business.group,
            image_url: (business as any).image_url || business.image,
            plan_id: (business as any).plan_id || business.planId,
            owner_email: (business as any).owner_email || businessOwner?.email
        } as any);
        setActiveTab('add');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
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
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <Shield className="absolute inset-0 m-auto w-5 h-5 text-primary opacity-50" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-medium animate-pulse">{loadingStep}</p>
                        <p className="text-xs text-muted-foreground italic">Esto puede tomar unos segundos la primera vez</p>
                    </div>
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
                        { id: 'analytics', label: '📊 Analíticas' },
                        { id: 'businesses', label: 'Negocios' },
                        { id: 'leads', label: 'Solicitudes' },
                        { id: 'reviews', label: 'Moderación Reseñas' },
                        { id: 'users', label: 'Usuarios' },
                        { id: 'ingesta', label: 'Ingesta Inteligente' },
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
                                <option value="free">🆓 Gratuito</option>
                                <option value="exchange">🔄 Intercambio</option>
                                <option value="premium">💎 Premium</option>
                                <option value="launch">🚀 Lanzamiento</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="glass-card p-6 rounded-xl min-h-[500px]">
                    {activeTab === 'analytics' && <AnalyticsDashboard />}

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
                                onToggleVisibility={handleToggleVisibility}
                                onAssignOwner={handleAssignOwner}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onBulkDelete={handleBulkDelete}
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

                    {activeTab === 'reviews' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Moderación de Reseñas</h2>
                            <ReviewModeration />
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Usuarios Registrados</h2>
                            <UserTable
                                users={users}
                                onDelete={handleDeleteUser}
                                onResetPasswordAction={handleResetPasswordClick}
                            />
                        </>
                    )}

                    {activeTab === 'add' && (
                        <>
                            <h2 className="text-lg font-semibold mb-6">
                                {editingBusiness ? "Editar Negocio" : "Agregar Nuevo Negocio"}
                            </h2>
                            <AddBusinessForm
                                key={editingBusiness?.id || leadToConvert?.id || 'new'}
                                initialData={editingBusiness || (leadToConvert ? {
                                    name: leadToConvert.business_name,
                                    description: leadToConvert.notes,
                                    address: '',
                                    category: '',
                                    lat: 25.6866,
                                    lng: -100.3161,
                                    owner_email: leadToConvert.email
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

                    {activeTab === 'ingesta' && <SmartIngestion currentUserId={currentUser?.id} />}
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

            <ResetPasswordModal
                isOpen={resetPasswordData.isOpen}
                onClose={() => setResetPasswordData({ ...resetPasswordData, isOpen: false })}
                onResetEmail={handleResetEmail}
                onResetManual={handleResetManual}
                user={resetPasswordData.user}
            />
        </div>
    );
}
