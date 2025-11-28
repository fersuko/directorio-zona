import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Monterrey Centro Coordinates (Approximate for CP 64000)
const LAT = 25.669;
const LON = -100.313;
const RADIUS = 1000; // 1km radius

// Overpass API Query
const query = `
  [out:json];
  (
    node["amenity"](around:${RADIUS},${LAT},${LON});
    node["shop"](around:${RADIUS},${LAT},${LON});
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

                const category = el.tags.amenity || el.tags.shop || "";
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
                const category = el.tags.amenity || el.tags.shop || "other";

                // Category Translation Map
                const categoryMap: Record<string, string> = {
                    "restaurant": "Restaurante",
                    "cafe": "Cafetería",
                    "fast_food": "Comida Rápida",
                    "bar": "Bar",
                    "pub": "Pub",
                    "ice_cream": "Heladería",
                    "convenience": "Tienda de Conveniencia",
                    "supermarket": "Supermercado",
                    "clothes": "Ropa",
                    "shoes": "Zapatería",
                    "electronics": "Electrónica",
                    "pharmacy": "Farmacia",
                    "bank": "Banco",
                    "hairdresser": "Peluquería",
                    "bakery": "Panadería",
                    "butcher": "Carnicería",
                    "hotel": "Hotel",
                    "hospital": "Hospital",
                    "clinic": "Clínica",
                    "dentist": "Dentista",
                    "doctors": "Consultorio",
                    "books": "Librería",
                    "gift": "Regalos",
                    "jewelry": "Joyería",
                    "mobile_phone": "Celulares",
                    "optician": "Óptica",
                    "beauty": "Estética",
                    "mall": "Centro Comercial",
                    "department_store": "Tienda Departamental"
                };

                const displayCategory = categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);

                const isPremium = Math.random() > 0.85; // 15% chance of being premium
                return {
                    id: el.id,
                    name: el.tags.name || el.tags["name:es"],
                    category: displayCategory,
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
            .slice(0, 60); // Limit to 60

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
