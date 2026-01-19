import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiaualzhazhdwlojqyjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpYXVhbHpoYXpoZHdsb2pxeWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjkzNDUsImV4cCI6MjA3OTQwNTM0NX0.bDEjn09u5zNCVxJbDp4QCspss0FbNSkLipL1xGptTrU';
// Maps Key
const MAPS_KEY = 'AIzaSyC9M8OkTtRQrAL_Vy1ZHyVXHjvRhhgpt7Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBrokenImages() {
    console.log("🔍 Buscando negocios con imágenes temporales de Google...");

    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, image_url')
        .like('image_url', '%maps.googleapis.com%');

    if (error) {
        console.error("Error al buscar negocios:", error);
        return;
    }

    console.log(`📌 Encontrados ${businesses.length} negocios que requieren reparación.`);

    for (const business of businesses) {
        console.log(`🛠️ Reparando: ${business.name} (ID: ${business.id})`);

        try {
            const storedUrl = business.image_url;

            // Extract photo_reference
            const photoRef = storedUrl.match(/photoreference=([^&]+)/)?.[1] ||
                storedUrl.match(/1s([^&]+)/)?.[1];

            if (!photoRef) {
                console.warn(`  ⚠️ No se encontró photoRef en la URL: ${storedUrl}`);
                continue;
            }

            // Construct Google Photo URL
            const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoRef}&key=${MAPS_KEY}`;

            // Fetch with fallback (Multi-proxy strategy)
            let response = null;
            const fetchTargets = [
                googleUrl,
                `https://images.weserv.nl/?url=${encodeURIComponent(googleUrl)}`,
                `https://corsproxy.io/?${encodeURIComponent(googleUrl)}`,
                `https://api.allorigins.win/raw?url=${encodeURIComponent(googleUrl)}`
            ];

            for (const target of fetchTargets) {
                try {
                    console.log(`  🔗 Intentando descarga via: ${target.substring(0, 50)}...`);
                    const res = await fetch(target);
                    if (res.ok) {
                        const contentType = res.headers.get('content-type');
                        if (contentType && contentType.startsWith('image/')) {
                            response = res;
                            break;
                        }
                    }
                } catch (e) {
                    // Next proxy
                }
            }

            if (!response || !response.ok) {
                const errorText = response ? await response.text() : "No response";
                console.error(`  ❌ Fallo total al descargar imagen para ${business.name}. Status: ${response?.status}. Error: ${errorText.substring(0, 100)}`);
                continue;
            }

            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (buffer.length < 500) {
                console.warn(`  ⚠️ Imagen demasiado pequeña (${buffer.length} bytes), omitiendo.`);
                continue;
            }

            // 2. Generate filename
            const timestamp = Date.now();
            const safeName = business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const extension = blob.type.includes('png') ? 'png' : 'jpg';
            const fileName = `${timestamp}_${safeName}_fix.${extension}`;
            const filePath = `businesses/${fileName}`;

            // 3. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('business-images')
                .upload(filePath, buffer, {
                    contentType: blob.type,
                    upsert: true
                });

            if (uploadError) {
                console.error(`  ❌ Error al subir a Storage para ${business.name}:`, uploadError);
                continue;
            }

            // 4. Update Database
            const { data: { publicUrl } } = supabase.storage
                .from('business-images')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('businesses')
                .update({ image_url: publicUrl })
                .eq('id', business.id);

            if (updateError) {
                console.error(`  ❌ Error al actualizar URL en DB para ${business.name}:`, updateError);
            } else {
                console.log(`  ✅ Reparado con éxito: ${publicUrl}`);
            }
        } catch (err) {
            console.error(`  ❌ Error inesperado reparando ${business.name}:`, err);
        }
    }

    console.log("🏁 Proceso de reparación finalizado.");
}

fixBrokenImages();
