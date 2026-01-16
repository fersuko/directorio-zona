import { getMapTileUrl } from "./mapUtils";
import type { Business } from "../types";

/**
 * Get the appropriate image URL for a business
 * Priority: custom image > map tile screenshot > generic fallback
 */
/**
 * Get the appropriate image URL for a business
 * Priority: custom image > map tile screenshot > category-based placeholder
 */
export function getBusinessImage(business: Business): string {
    // 1. If business has custom image, use it
    if (business.image && business.image.trim() !== "") {
        return business.image;
    }

    // 2. Use dynamic map tile "screenshot" if coordinates are available
    if (business.lat && business.lng) {
        return getMapTileUrl(business.lat, business.lng, 15);
    }

    // 3. Fallback to category-based placeholder from Unsplash
    const category = business.category?.toLowerCase() || 'business';
    const fallbackMap: Record<string, string> = {
        'restaurante': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
        'cafetería': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80',
        'bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80',
        'tienda': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80',
        'salud': 'https://images.unsplash.com/photo-1505751172107-573957a2c3b5?w=500&q=80'
    };

    return fallbackMap[category] || `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80`;
}
