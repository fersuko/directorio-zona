import { getMapTileUrl } from "./mapUtils";
import type { Business } from "../types";

/**
 * Get the appropriate image URL for a business
 * Priority: custom image > map tile screenshot > generic fallback
 */
export function getBusinessImage(business: Business): string {
    // 1. If business has custom image, use it
    if (business.image) {
        return business.image;
    }

    // 2. Use dynamic map tile "screenshot"
    // Zoom 15 gives a wider context (~400m radius) as requested
    if (business.lat && business.lng) {
        return getMapTileUrl(business.lat, business.lng, 15);
    }

    // 3. Fallback to generic placeholder if no coords (should rarely happen)
    return "/placeholders/generic.png";
}
