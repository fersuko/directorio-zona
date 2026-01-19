const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';
const MAPS_KEY = 'AIzaSyC9M8OkTtRQrAL_Vy1ZHyVXHjvRhhgpt7Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function repairImages() {
    console.log("🚀 Iniciando REPARACIÓN MAESTRA v2.2 (Coordinate-First)...");

    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, address, lat, lng')
        .is('image_url', null);

    if (error) {
        console.error("❌ Error al buscar negocios:", error);
        return;
    }

    console.log(`📌 Encontrados ${businesses.length} negocios sin imagen.`);

    for (const business of businesses) {
        console.log(`\n🛠️  Procesando: ${business.name}...`);

        try {
            let photoRef = null;

            // 1. ESTRATEGIA: Nearby Search por Coordenadas (Más precisa)
            if (business.lat && business.lng) {
                console.log(`  📍 Intentando via coordenadas: ${business.lat}, ${business.lng}`);
                const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${business.lat},${business.lng}&radius=50&key=${MAPS_KEY}`;
                const nearbyRes = await fetch(nearbyUrl);
                const nearbyData = await nearbyRes.json();

                if (nearbyData.results && nearbyData.results.length > 0) {
                    const match = nearbyData.results.find(r =>
                        r.name.toLowerCase().includes(business.name.split(' ')[0].toLowerCase())
                    ) || nearbyData.results[0];

                    if (match && match.photos) {
                        photoRef = match.photos[0].photo_reference;
                        console.log(`  ✨ Encontrado vía Nearby Search: ${match.name}`);
                    }
                }
            }

            // 2. ESTRATEGIA: Text Search (Fallback)
            if (!photoRef) {
                const searches = [
                    business.name + ' ' + (business.address || 'Monterrey'),
                    business.name.replace(/\b(SA de CV|S\.A\. de C\.V\.|S\.A\.|INC|LTD)\b/gi, '').trim() + ' Monterrey',
                    "Artículos Deportivos Madero Monterrey"
                ];

                for (const query of searches) {
                    console.log(`  🔎 Probando búsqueda textual: ${query}`);
                    const searchRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${MAPS_KEY}`);
                    const searchData = await searchRes.json();

                    if (searchData.results && searchData.results.length > 0 && searchData.results[0].photos) {
                        photoRef = searchData.results[0].photos[0].photo_reference;
                        console.log(`  ✨ Encontrado vía Text Search!`);
                        break;
                    }
                }
            }

            if (!photoRef) {
                console.warn(`  ❌ No se pudo encontrar referencia de imagen.`);
                continue;
            }

            // Descarga y Subida
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoRef}&key=${MAPS_KEY}`;
            const photoRes = await fetch(photoUrl);

            if (!photoRes.ok) {
                console.error(`  ❌ Error al descargar de Google: ${photoRes.status}`);
                continue;
            }

            const buffer = await photoRes.arrayBuffer();
            const contentType = photoRes.headers.get('content-type') || 'image/jpeg';

            const timestamp = Date.now();
            const safeName = business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const extension = contentType.includes('png') ? 'png' : 'jpg';
            const fileName = `${timestamp}_${safeName}_final.${extension}`;
            const filePath = `businesses/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('business-images')
                .upload(filePath, Buffer.from(buffer), {
                    contentType,
                    upsert: true
                });

            if (uploadError) {
                console.error(`  ❌ Error de subida a Storage:`, uploadError);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('business-images')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('businesses')
                .update({ image_url: publicUrl })
                .eq('id', business.id);

            if (updateError) {
                console.error(`  ❌ Error al actualizar DB:`, updateError);
            } else {
                console.log(`  ✅ ¡EXITO! Imagen persistida: ${publicUrl}`);
            }

        } catch (err) {
            console.error(`  ❌ Error inesperado:`, err);
        }
    }

    console.log("\n🏁 Reparación maestra finalizada.");
}

repairImages();
