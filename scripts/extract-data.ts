import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Monterrey Centro Coordinates (Approximate for CP 64000)
const LAT = 25.669;
const LON = -100.313;
const RADIUS = 2500; // 2.5km radius to cover CP 64000

// Overpass API Query - Targeting specific local businesses
const query = `
  [out:json][timeout:25];
  (
    // Food & Drink
    node["amenity"~"restaurant|cafe|fast_food|bar|pub|ice_cream"](around:${RADIUS},${LAT},${LON});
    
    // Trades & Services
    node["shop"~"hardware|locksmith|hairdresser|beauty|laundry|dry_cleaning|tailor|copyshop|photo|florist|tattoo"](around:${RADIUS},${LAT},${LON});
    node["craft"~"carpenter|electrician|plumber|shoemaker|key_cutter"](around:${RADIUS},${LAT},${LON});
    
    // Health & Wellness (NEW)
    node["leisure"~"fitness_centre|sports_centre|yoga"](around:${RADIUS},${LAT},${LON});
    node["amenity"~"veterinary|dentist|pharmacy"](around:${RADIUS},${LAT},${LON});
    node["shop"~"nutrition_supplements|optician"](around:${RADIUS},${LAT},${LON});

    // Automotive (NEW)
    node["shop"~"car_repair|car_parts|motorcycle_repair|tyres"](around:${RADIUS},${LAT},${LON});
    node["amenity"~"car_wash"](around:${RADIUS},${LAT},${LON});

    // General Stores
    node["shop"~"convenience|variety_store|general|bakery|butcher|greengrocer|supermarket"](around:${RADIUS},${LAT},${LON});
    
    // Other useful local shops
    node["shop"~"clothes|shoes|electronics|mobile_phone|gift|stationery|books|pet|jewelry|music"](around:${RADIUS},${LAT},${LON});
  );
  out body;
  >;
  out skel qt;
`;

async function fetchBusinesses() {
    console.log("Fetching data from OpenStreetMap...");
    try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Found ${data.elements.length} raw elements.`);

        const businesses = data.elements
            .filter((el: any) => {
                // Must have a name
                if (!el.tags || (!el.tags.name && !el.tags["name:es"])) return false;

                const category = el.tags.amenity || el.tags.shop || el.tags.craft || el.tags.leisure || "";

                // FRANCHISE FILTER: Exclude big chains
                const name = (el.tags.name || "").toLowerCase();
                const excludedNames = [
                    "oxxo", "7-eleven", "seven eleven", "farmacias guadalajara",
                    "farmacias del ahorro", "farmacias benavides", "subway",
                    "starbucks", "mcdonald's", "burger king", "kfc", "domino's",
                    "little caesars", "pizza hut", "soriana", "walmart", "heb",
                    "coppel", "elektra", "banamex", "bbva", "santander", "hsbc",
                    "autozone", "steren"
                ];

                if (excludedNames.some(excluded => name.includes(excluded))) {
                    return false;
                }

                const unwanted = [
                    "place_of_worship", "police", "fire_station", "townhall",
                    "courthouse", "school", "university", "prison", "grave_yard",
                    "parking", "parking_entrance", "atm", "bench", "waste_basket",
                    "post_box", "recycling", "shelter", "telephone", "toilets",
                    "vending_machine", "water_point"
                ];

                return !unwanted.includes(category);
            })
            .map((el: any) => {
                const category = el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.craft || "other";

                // Category Translation Map
                const categoryMap: Record<string, string> = {
                    "restaurant": "Restaurante",
                    "cafe": "Cafetería",
                    "fast_food": "Comida Rápida",
                    "bar": "Bar",
                    "pub": "Pub",
                    "ice_cream": "Heladería",
                    "hardware": "Ferretería",
                    "locksmith": "Cerrajería",
                    "hairdresser": "Estética/Barbería",
                    "beauty": "Salón de Belleza",
                    "tattoo": "Tatuajes",
                    "laundry": "Lavandería",
                    "dry_cleaning": "Tintorería",
                    "tailor": "Sastrería",
                    "copyshop": "Copias e Impresiones",
                    "photo": "Fotografía",
                    "florist": "Florería",
                    "carpenter": "Carpintería",
                    "electrician": "Electricista",
                    "plumber": "Plomero",
                    "shoemaker": "Zapatero",
                    "key_cutter": "Cerrajería",
                    "fitness_centre": "Gimnasio",
                    "sports_centre": "Centro Deportivo",
                    "yoga": "Yoga",
                    "veterinary": "Veterinaria",
                    "dentist": "Dentista",
                    "pharmacy": "Farmacia",
                    "nutrition_supplements": "Suplementos",
                    "optician": "Óptica",
                    "car_repair": "Taller Mecánico",
                    "car_parts": "Refacciones",
                    "motorcycle_repair": "Taller de Motos",
                    "tyres": "Llantera",
                    "car_wash": "Autolavado",
                    "convenience": "Tienda de Abarrotes",
                    "variety_store": "Tienda de Variedades",
                    "general": "Tienda General",
                    "supermarket": "Supermercado",
                    "bakery": "Panadería",
                    "butcher": "Carnicería",
                    "greengrocer": "Frutería",
                    "clothes": "Ropa",
                    "shoes": "Zapatería",
                    "electronics": "Electrónica",
                    "mobile_phone": "Celulares",
                    "gift": "Regalos",
                    "stationery": "Papelería",
                    "books": "Librería",
                    "pet": "Mascotas",
                    "jewelry": "Joyería",
                    "music": "Música"
                };

                const displayCategory = categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);

                // NO MORE STATIC GROUPS - Category is the group now

                const isPremium = Math.random() > 0.85; // 15% chance of being premium
                return {
                    id: el.id,
                    name: el.tags.name || el.tags["name:es"],
                    category: displayCategory,
                    group: displayCategory, // Using category as group for compatibility
                    lat: el.lat,
                    lng: el.lon,
                    address: el.tags["addr:street"] ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ''}` : "Centro, Monterrey",
                    description: el.tags.cuisine ? `Cocina: ${el.tags.cuisine}` : "Negocio local en el centro.",
                    isPremium: isPremium,
                    image: isPremium
                        ? `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`
                        : undefined
                };
            })
            .slice(0, 300); // Increased limit further

        const outputPath = path.join(__dirname, '../src/data/businesses.json');

        // Ensure dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(businesses, null, 2));
        console.log(`Successfully saved ${businesses.length} businesses to ${outputPath}`);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetchBusinesses();
