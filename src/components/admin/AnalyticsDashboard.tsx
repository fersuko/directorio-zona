import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Eye, Star, CheckCircle, XCircle, MessageSquare, Tag, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export function AnalyticsDashboard() {
    const [activeUsers, setActiveUsers] = useState(0);
    const [stats, setStats] = useState<any>(null);
    const [timeRange, setTimeRange] = useState('24h');

    // 1. Real-time Active Users (Presence)
    useEffect(() => {
        const channel = supabase.channel('online_users');
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                // Count unique session_ids
                const uniqueSessions = new Set();
                Object.values(state).forEach((presences: any) => {
                    presences.forEach((p: any) => uniqueSessions.add(p.session_id));
                });
                setActiveUsers(uniqueSessions.size);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const [pendingReviews, setPendingReviews] = useState<any[]>([]);
    const [moderationSettings, setModerationSettings] = useState({ enabled: true });

    // 2. Historical Data (RPC)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data, error } = await (supabase.rpc as any)('get_analytics_summary', { time_range: timeRange });
                if (error) {
                    console.error("Error fetching analytics:", error);
                    setStats({});
                } else {
                    setStats(data || {});
                }

                // Fetch pending reviews
                const { data: reviews } = await supabase
                    .from('reviews')
                    .select('*, profiles(full_name), businesses(name)')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });
                setPendingReviews(reviews || []);

                // Fetch moderation settings
                const { data: settings } = await supabase.from('settings').select('value').eq('key', 'moderation').single();
                if (settings) setModerationSettings((settings as any).value);

            } catch (err) {
                console.error("Critical error in analytics fetch:", err);
                setStats({});
            }
        };

        fetchStats();

        // Refresh every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [timeRange]);

    const handleModerate = async (id: string, approve: boolean) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ status: approve ? 'approved' : 'rejected' } as any)
                .eq('id', id);

            if (error) throw error;
            setPendingReviews(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error("Error moderating review:", err);
        }
    };

    const toggleModeration = async () => {
        const newValue = { ...moderationSettings, enabled: !moderationSettings.enabled };
        try {
            const { error } = await (supabase.from('settings') as any).upsert({
                key: 'moderation',
                value: newValue,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
            if (error) throw error;
            setModerationSettings(newValue);
        } catch (err) {
            console.error("Error toggling moderation:", err);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
                <Icon className="w-24 h-24" />
            </div>
            <div className="relative z-10">
                <div className={`p-3 rounded-lg w-fit mb-4 ${color.replace('text-', 'bg-').replace('500', '500/20')}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
                <p className="text-3xl font-bold mt-1">{value}</p>
                {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
            </div>
        </motion.div>
    );

    // Safe access helpers
    const getVal = (key: string) => stats ? (stats[key] || 0) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold">Analíticas en Tiempo Real</h2>
                    <p className="text-muted-foreground">Monitoreo de actividad y rendimiento</p>
                </div>

                <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
                    {['24h', '7d', '30d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timeRange === range
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                        >
                            {range === '24h' ? '24 Horas' : range === '7d' ? '7 Días' : '30 Días'}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIVE Counter */}
            <div className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75" />
                    </div>
                    <div>
                        <p className="text-green-400 font-bold text-lg">Usuarios Activos Ahora</p>
                        <p className="text-green-500/80 text-sm">Navegando el directorio en este momento</p>
                    </div>
                </div>
                <div className="text-5xl font-bold text-green-400 font-mono tracking-tighter">
                    {activeUsers}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Promociones Activas"
                    value={getVal('total_promos_active')}
                    icon={Tag}
                    color="text-red-500"
                    subtitle="Ofertas circulando en el sitio"
                />
                <StatCard
                    title="Reseñas Pendientes"
                    value={getVal('pending_reviews')}
                    icon={ShieldAlert}
                    color="text-yellow-500"
                    subtitle="Esperando aprobación manual"
                />
                <StatCard
                    title="Vistas de Página"
                    value={getVal('total_views')}
                    icon={Eye}
                    color="text-blue-500"
                    subtitle="Tráfico general del sitio"
                />
                <StatCard
                    title="Búsquedas"
                    value={getVal('total_searches')}
                    icon={Search}
                    color="text-purple-500"
                    subtitle="Intención de compra activa"
                />
            </div>

            {/* Moderation & Top Businesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Moderation Queue */}
                <div className="glass-card p-6 rounded-xl border border-white/10 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Cola de Moderación
                        </h3>
                        <Button
                            variant={moderationSettings.enabled ? "premium" : "secondary"}
                            size="sm"
                            onClick={toggleModeration}
                            className="text-[10px] h-7"
                        >
                            {moderationSettings.enabled ? "Moderación: ON" : "Moderación: OFF"}
                        </Button>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin">
                        {pendingReviews.length > 0 ? (
                            pendingReviews.map((r: any) => (
                                <div key={r.id} className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-primary">{r.businesses?.name}</p>
                                            <p className="text-sm font-medium">{r.profiles?.full_name}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-white/20'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">"{r.comment}"</p>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => handleModerate(r.id, false)}
                                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                            title="Rechazar"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleModerate(r.id, true)}
                                            className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                            title="Aprobar"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 opacity-50 space-y-2">
                                <CheckCircle className="w-12 h-12 mx-auto" />
                                <p className="text-sm font-medium">¡Todo limpio! Sin reseñas pendientes.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Negocios Más Vistos
                    </h3>
                    <div className="space-y-4">
                        {stats && Array.isArray(stats.top_businesses) && stats.top_businesses.length > 0 ? (
                            stats.top_businesses.map((b: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <span className="font-medium">{b.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Eye className="w-4 h-4" />
                                        {b.views}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">Sin datos suficientes en este periodo</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
