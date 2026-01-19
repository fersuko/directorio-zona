import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Business } from "../types";
import { calculateDistance } from "../utils/distance";
import { MONTERREY_CENTRO, MAX_RADIUS_KM } from "../constants/geo";

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


            const mappedBusinesses = (data || [])
                .map((dbBiz: any) => {
                    const planId = dbBiz.plan_id || 'free';
                    const isPremiumPlan = planId === 'launch' || planId === 'featured';
                    const bizLat = Number(dbBiz.lat);
                    const bizLng = Number(dbBiz.lng);

                    // Skip if invalid coordinates
                    if (!bizLat || !bizLng || isNaN(bizLat) || isNaN(bizLng)) {
                        console.log(`⚠️ Negocio sin coordenadas válidas filtrado: ${dbBiz.name}`);
                        return null;
                    }

                    const dist = calculateDistance(MONTERREY_CENTRO.lat, MONTERREY_CENTRO.lng, bizLat, bizLng);

                    if (isNaN(dist) || dist > MAX_RADIUS_KM) {
                        console.log(`🚫 Filtrado por distancia (> ${MAX_RADIUS_KM}km): ${dbBiz.name} a ${dist.toFixed(2)}km | Coordenadas: (${bizLat}, ${bizLng})`);
                        return null;
                    }

                    console.log(`✅ Incluido: ${dbBiz.name} a ${dist.toFixed(2)}km`);

                    return {
                        id: dbBiz.id,
                        name: dbBiz.name,
                        category: dbBiz.category,
                        group: dbBiz.group_name || 'Otros',
                        lat: bizLat,
                        lng: bizLng,
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
                })
                .filter((b): b is Business => b !== null);

            setBusinesses(mappedBusinesses);
        } catch (err) {
            console.error("Error in useBusinesses:", err);
        } finally {
            setLoading(false);
        }
    };

    return { businesses, loading };
}
