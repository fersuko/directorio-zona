import { useEffect, useState } from "react";
import { Store, Users, Star, Eye, TrendingUp } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { TrendChart } from "./TrendChart";
import { supabase } from "../../lib/supabase";

interface DashboardStatsProps {
    businessId: number | string;
    planId: string;
}

export function DashboardStats({ businessId, planId }: DashboardStatsProps) {
    const [stats, setStats] = useState({
        activePromos: 0,
        totalInteractions: 0,
        averageRating: 0.0,
        ratingCount: 0,
        pageViews: 0
    });
    const [chartData, setChartData] = useState<{ label: string, value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (businessId) {
            fetchStats();
        }
    }, [businessId]);

    const fetchStats = async () => {
        if (!businessId) return;
        try {
            // 1. Get dates for the last 7 days
            const days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });

            // 2. Count Active Promos
            const { count: promoCount } = await supabase
                .from("promotions")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId)
                .gte("valid_until", new Date().toISOString());

            // 3. Fetch Analytics Events
            const { data: events, error: eventsError } = await supabase
                .from("analytics_events")
                .select("event_type, created_at")
                .filter("metadata->>business_id", "eq", businessId.toString())
                .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

            if (eventsError) throw eventsError;

            const typedEvents = (events || []) as { event_type: string, created_at: string }[];
            const views = typedEvents.filter(e => e.event_type === 'business_view');
            const interactions = typedEvents.filter(e => ['click_call', 'click_gps', 'click_share'].includes(e.event_type));

            // Process chart data (Views per day)
            const viewsByDay = days.map(day => ({
                label: day.split('-').slice(1).reverse().join('/'), // DD/MM
                value: typedEvents.filter(v => v.event_type === 'business_view' && v.created_at.startsWith(day)).length
            }));

            setChartData(viewsByDay);

            // 4. Calculate Average Rating
            const { data: reviews } = await supabase
                .from("reviews")
                .select("rating")
                .eq("business_id", businessId);

            let avgRating = 0;
            if (reviews && reviews.length > 0) {
                const sum = (reviews as any[]).reduce((acc, r) => acc + r.rating, 0);
                avgRating = sum / reviews.length;
            }

            setStats({
                activePromos: promoCount || 0,
                totalInteractions: interactions.length || 0,
                averageRating: parseFloat(avgRating.toFixed(1)),
                ratingCount: reviews?.length || 0,
                pageViews: views.length || 0
            });

        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="grid grid-cols-2 gap-4 animate-pulse">
            <div className="h-24 bg-muted/20 rounded-xl"></div>
            <div className="h-24 bg-muted/20 rounded-xl"></div>
            <div className="h-40 bg-muted/20 rounded-xl col-span-2"></div>
        </div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <StatsCard
                    title="Vistas (7d)"
                    value={stats.pageViews}
                    icon={Eye}
                    planId={planId as any}
                />
                <StatsCard
                    title="Interacciones"
                    value={stats.totalInteractions}
                    icon={Users}
                    trend="Llamadas/GPS"
                    trendUp={true}
                    planId={planId as any}
                />
            </div>

            {/* Trends Visualization */}
            <div className="glass-card p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Tendencia de Visitas
                        </h3>
                        <p className="text-xs text-muted-foreground">Últimos 7 días de actividad</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                            + {Math.round((stats.pageViews / (stats.pageViews || 1)) * 100)}%
                        </span>
                    </div>
                </div>

                <TrendChart data={chartData} color="#ef4444" height={100} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <StatsCard
                    title="Promos Activas"
                    value={stats.activePromos}
                    icon={Store}
                    planId={planId as any}
                />
                <StatsCard
                    title="Calificación"
                    value={stats.averageRating}
                    icon={Star}
                    trend={`${stats.ratingCount} reseñas`}
                    trendUp={true}
                    planId={planId as any}
                />
            </div>
        </div>
    );
}
