import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";

export function useBusinesses() {
    const [businesses, setBusinesses] = useState<Business[]>(businessesData as Business[]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverrides();
    }, []);

    const fetchOverrides = async () => {
        try {
            // 1. Fetch ALL businesses from Supabase (both overrides and new dynamic businesses)
            const { data: dbBusinesses, error } = await supabase
                .from("businesses")
                .select("*");

            if (error) {
                console.error("Error fetching businesses:", error);
                return;
            }

            // 2. Process static JSON data
            // 3. Merge Strategy
            // We always map static businesses to ensure defaults (isPremium=false) are applied
            // even if there are no DB overrides yet.

            const dbMap = new Map((dbBusinesses || []).map((b: any) => [b.id, b]));

            let allBusinesses = (businessesData as Business[]).map(staticBiz => {
                const dbBiz = dbMap.get(staticBiz.id);
                if (dbBiz) {
                    // Found in DB, apply overrides
                    const planId = dbBiz.plan_id || 'free';
                    const isPremiumPlan = planId === 'launch' || planId === 'featured';

                    // Remove from map so we know it's processed (for new businesses check later)
                    dbMap.delete(staticBiz.id);

                    return {
                        ...staticBiz,
                        ...dbBiz, // Apply all DB fields
                        isPremium: isPremiumPlan || dbBiz.is_premium || false,
                        planId: planId,
                        ownerId: dbBiz.owner_id,
                        lat: Number(dbBiz.lat) || staticBiz.lat,
                        lng: Number(dbBiz.lng) || staticBiz.lng,
                        image: dbBiz.image_url || staticBiz.image,
                        isHidden: dbBiz.is_hidden || false
                    };
                }
                // No DB override: Force defaults
                return {
                    ...staticBiz,
                    planId: 'free' as 'free' | 'launch' | 'featured',
                    isPremium: false
                };
            });

            // 4. Add remaining DB businesses (New ones that weren't in static JSON)
            const newBusinesses = Array.from(dbMap.values()).map((dbBiz: any) => {
                const planId = dbBiz.plan_id || 'free';
                const isPremiumPlan = planId === 'launch' || planId === 'featured';

                return {
                    id: dbBiz.id,
                    name: dbBiz.name,
                    category: dbBiz.category,
                    group: dbBiz.group_name || 'Otros',
                    lat: Number(dbBiz.lat),
                    lng: Number(dbBiz.lng),
                    address: dbBiz.address,
                    description: dbBiz.description,
                    isPremium: isPremiumPlan || dbBiz.is_premium || false,
                    planId: planId,
                    ownerId: dbBiz.owner_id,
                    image: dbBiz.image_url,
                    rating: Number(dbBiz.rating) || 0,
                    reviewCount: Number(dbBiz.review_count) || 0,
                    isHidden: dbBiz.is_hidden || false
                } as Business;
            });

            // Filter out hidden businesses for public view
            const visibleBusinesses = [...allBusinesses, ...newBusinesses].filter(b => !b.isHidden);

            setBusinesses(visibleBusinesses);
        } catch (err) {
            console.error("Error in useBusinesses:", err);
        } finally {
            setLoading(false);
        }
    };

    return { businesses, loading };
}
