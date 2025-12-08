import type { LucideIcon } from "lucide-react";

import { Lock } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    planId?: 'free' | 'launch' | 'featured';
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, planId = 'free' }: StatsCardProps) {
    const isLocked = planId === 'free';

    return (
        <div className="glass-card p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            </div>

            <div className={`space-y-1 ${isLocked ? 'blur-sm select-none' : ''}`}>
                <h3 className="text-2xl font-bold">{value}</h3>
                {trend && (
                    <p className={`text-xs font-medium ${trendUp ? "text-green-500" : "text-red-500"}`}>
                        {trendUp ? "↑" : "↓"} {trend} <span className="text-muted-foreground">vs mes anterior</span>
                    </p>
                )}
            </div>

            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                    <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded-full border border-white/10 shadow-sm">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">Premium</span>
                    </div>
                </div>
            )}
        </div>
    );
}
