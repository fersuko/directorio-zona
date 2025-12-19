// Geocoding utility using Nominatim (OpenStreetMap)
// Free, no API key required, respects 1 request/second rate limit

interface GeocodingResult {
    lat: number;
    lng: number;
    displayName: string;
    success: boolean;
    error?: string;
}

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
