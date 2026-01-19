// Geocoding utility using Nominatim (OpenStreetMap)
// Free, no API key required, respects 1 request/second rate limit

interface GeocodingResult {
    lat: number;
    lng: number;
    displayName: string;
    success: boolean;
    error?: string;
    photoReference?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Rate limiting - only allow 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

/**
 * Geocodes an address to coordinates using Nominatim (OpenStreetMap)
 * @param address Full address or partial address to geocode
 * @param city Optional city to help narrow results (e.g., "Monterrey")
 * @returns Coordinates and display name
 */
export async function geocodeAddress(
    address: string,
    city?: string
): Promise<GeocodingResult> {
    try {
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            await new Promise(resolve =>
                setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
            );
        }
        lastRequestTime = Date.now();

        // Build search query
        const searchQuery = city ? `${address}, ${city}` : address;
        const url = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(searchQuery)}` +
            `&format=json` +
            `&limit=1` +
            `&addressdetails=1`;

        console.log('Geocoding request:', searchQuery);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'DirectorioZona/1.0' // Required by Nominatim
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim returned ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            return {
                lat: 0,
                lng: 0,
                displayName: '',
                success: false,
                error: 'No se encontraron resultados para esta dirección'
            };
        }

        const result = data[0];

        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
            success: true
        };
    } catch (error: any) {
        console.error('Geocoding error:', error);
        return {
            lat: 0,
            lng: 0,
            displayName: '',
            success: false,
            error: error.message || 'Error al buscar la dirección'
        };
    }
}

/**
 * Reverse geocoding: converts coordinates to an address
 * @param lat Latitude
 * @param lng Longitude
 * @returns Address string
 */
export async function reverseGeocode(
    lat: number,
    lng: number
): Promise<{ address: string; success: boolean; error?: string }> {
    try {
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            await new Promise(resolve =>
                setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
            );
        }
        lastRequestTime = Date.now();

        const url = `https://nominatim.openstreetmap.org/reverse?` +
            `lat=${lat}&lon=${lng}` +
            `&format=json`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'DirectorioZona/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim returned ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.display_name) {
            return {
                address: '',
                success: false,
                error: 'No se encontró dirección para estas coordenadas'
            };
        }

        return {
            address: data.display_name,
            success: true
        };
    } catch (error: any) {
        console.error('Reverse geocoding error:', error);
        return {
            address: '',
            success: false,
            error: error.message || 'Error al buscar la dirección'
        };
    }
}

/**
 * Searches for a business using Google Places Text Search API
 * @param query Business name or search term
 * @param location Optional "lat,lng" to bias results
 * @returns Array of matching results with photo references
 */
export async function searchGooglePlaces(
    query: string,
    location?: { lat: number, lng: number }
): Promise<any[]> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("Missing Google Maps API Key");
        return [];
    }

    try {
        const baseUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";
        const params = new URLSearchParams({
            query: query,
            key: GOOGLE_MAPS_API_KEY,
            language: 'es',
            region: 'mx'
        });

        if (location) {
            params.append('location', `${location.lat},${location.lng}`);
            params.append('radius', '2000'); // 2km search radius
        }

        const response = await fetch(`${baseUrl}?${params.toString()}`);
        const data = await response.json();

        if (data.status !== "OK") {
            console.warn("Google Places API error:", data.status, data.error_message);
            return [];
        }

        return data.results.map((place: any) => ({
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            photoReference: place.photos?.[0]?.photo_reference,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            placeId: place.place_id
        }));
    } catch (error) {
        console.error("Error calling Google Places API:", error);
        return [];
    }
}

/**
 * Gets a direct Photo URL from a Google photo reference
 */
export function getGooglePhotoUrl(photoReference: string, maxWidth: number = 800): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}
