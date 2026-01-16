import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Business } from "../types";

export function useBusinesses() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq('is_hidden', false); // Only show public businesses

            if (error) {
                console.error("Error fetching businesses:", error);
                return;
            }

            const mappedBusinesses = (data || []).map((dbBiz: any) => {
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

            setBusinesses(mappedBusinesses);
        } catch (err) {
            console.error("Error in useBusinesses:", err);
        } finally {
            setLoading(false);
        }
    };

    return { businesses, loading };
}
