import { getMapTileUrl } from "./mapUtils";

/**
 * Get the appropriate image URL for a business
 * Priority: custom image/url > map tile fallback > category-based placeholder
 */
export function getBusinessImage(business: any): string {
    if (!business) return `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80`;

    // 1. Try common image fields (DB image_url or Frontend model image)
    const imgValue = business.image_url || business.image;
    if (imgValue && imgValue.trim() !== "" && !imgValue.includes('default-business')) {
        return imgValue;
    }

    // 2. Map Tile Fallback (User preference)
    if (business.lat && business.lng) {
        try {
            return getMapTileUrl(Number(business.lat), Number(business.lng), 17);
        } catch (e) {
            console.error("Error generating map tile:", e);
        }
    }

    // 3. High-quality category-based placeholder from Unsplash (Last resort)
    const category = (business.category || '').toLowerCase();

    const fallbackMap: Record<string, string> = {
        'restaurante': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        'cafetería': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
        'bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
        'tienda': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
        'salud': 'https://images.unsplash.com/photo-1505751172107-573957a2c3b5?w=800&q=80',
        'belleza': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
        'educación': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
        'entretenimiento': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'
    };

    // Find best match in map
    for (const key in fallbackMap) {
        if (category.includes(key)) {
            return fallbackMap[key];
        }
    }

    // General professional business fallback
    return `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80`;
}
