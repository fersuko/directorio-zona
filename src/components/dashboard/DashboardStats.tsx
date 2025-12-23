import { useEffect, useState } from "react";
import { Store, Users, Star } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { supabase } from "../../lib/supabase";

interface DashboardStatsProps {
    businessId: number | string;
    planId: string;
}

export function DashboardStats({ businessId, planId }: DashboardStatsProps) {
    const [stats, setStats] = useState({
        activePromos: 0,
        totalLeads: 0,
        averageRating: 0.0,
        ratingCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (businessId) {
            fetchStats();
        }
    }, [businessId]);

    const fetchStats = async () => {
        if (!businessId) return;
        try {
            // 1. Count Active Promos
            const { count: promoCount } = await supabase
                .from("promotions")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId)
                .gte("valid_until", new Date().toISOString());

            // 2. Count Leads
            const { count: leadsCount } = await supabase
                .from("leads")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId);

            // 3. Calculate Average Rating
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
                totalLeads: leadsCount || 0,
                averageRating: parseFloat(avgRating.toFixed(1)),
                ratingCount: reviews?.length || 0
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
            <div className="h-24 bg-muted/20 rounded-xl col-span-2"></div>
        </div>;
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <StatsCard
                title="Promos Activas"
                value={stats.activePromos}
                icon={Store}
                planId={planId as any}
            />
            <StatsCard
                title="Interesados"
                value={stats.totalLeads}
                icon={Users}
                planId={planId as any}
            />
            <div className="col-span-2">
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
