import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) {
    return (
        <div className="glass-card p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-2xl font-bold">{value}</h3>
                {trend && (
                    <p className={`text-xs font-medium ${trendUp ? "text-green-500" : "text-red-500"}`}>
                        {trendUp ? "↑" : "↓"} {trend} <span className="text-muted-foreground">vs mes anterior</span>
                    </p>
                )}
            </div>
        </div>
    );
}
