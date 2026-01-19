import { supabase } from "./supabase";

/**
 * Downloads an image from a Google Photo Reference or URL 
 * and uploads it to Supabase Storage 'business-images' bucket.
 * 
 * @param source Photo reference string or complete URL
 * @returns The public URL of the stored image or null if failed
 */
export async function uploadBusinessPhoto(source: string, businessName: string): Promise<string | null> {
    try {
        if (!source) return null;

        // 1. Determine the actual image URL
        // If it's a photo_reference, construct the Google Photo URL
        const imageUrl = source.startsWith('http')
            ? source
            : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${source}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

        console.log(`📸 Proceso de imagen para "${businessName}"...`);

        // 2. Fetch the image with multiple fallbacks
        let response: Response | null = null;
        const fetchTargets = [];

        // Target 1: Local Vite Proxy for Google Maps API (Development only)
        if (import.meta.env.DEV && imageUrl.includes('maps.googleapis.com')) {
            fetchTargets.push(imageUrl.replace('https://maps.googleapis.com', '/google-photos'));
        }

        // Target 1b: Local Vite Proxy for Google User Content (where photos are hosted)
        if (import.meta.env.DEV && imageUrl.includes('lh3.googleusercontent.com')) {
            fetchTargets.push(imageUrl.replace('https://lh3.googleusercontent.com', '/google-images'));
        }

        // Target 2: Standard URL (Direct fetch - might fail CORS)
        fetchTargets.push(imageUrl);

        // Target 3: Weserv.nl Proxy (Very reliable for images)
        fetchTargets.push(`https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`);

        // Target 4: CorsProxy.io (Permissive)
        fetchTargets.push(`https://corsproxy.io/?${encodeURIComponent(imageUrl)}`);

        // Target 5: AllOrigins Proxy (Last resort for raw data)
        fetchTargets.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`);

        for (const targetUrl of fetchTargets) {
            try {
                // Determine if we should use local proxy or direct
                let finalFetchUrl = targetUrl;

                console.log(`  🔗 Intentando descarga via: ${finalFetchUrl.substring(0, 60)}...`);
                const res = await fetch(finalFetchUrl, {
                    headers: {
                        'Accept': 'image/*'
                    }
                });

                if (res.ok) {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.startsWith('image/')) {
                        response = res;
                        console.log(`  ✅ Descarga exitosa de: ${targetUrl.substring(0, 30)}...`);
                        break;
                    }
                } else {
                    console.warn(`  ⚠️ Falló target ${targetUrl.substring(0, 30)}: ${res.status}`);
                }
            } catch (e) {
                console.warn(`  ⚠️ Error en fetch para ${targetUrl.substring(0, 30)}: ${e}`);
            }
        }

        if (!response) {
            console.error(`❌ No se pudo obtener una imagen válida para "${businessName}" tras agotar todos los métodos.`);
            return null;
        }

        const blob = await response.blob();
        if (blob.size < 500) { // Small images are usually 403 pages or placeholders
            console.warn(`⚠️ Imagen descargada sospechosamente pequeña (${blob.size} bytes) para "${businessName}"`);
            return null;
        }

        // 3. Generate a clean unique filename
        const timestamp = Date.now();
        const safeName = businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        // Determine extension from MIME type
        let extension = 'jpg';
        if (blob.type === 'image/png') extension = 'png';
        if (blob.type === 'image/webp') extension = 'webp';

        const fileName = `${timestamp}_${safeName}.${extension}`;
        const filePath = `businesses/${fileName}`;

        // 4. Upload to Supabase
        const { error: uploadError } = await supabase.storage
            .from('business-images')
            .upload(filePath, blob, {
                contentType: blob.type,
                upsert: true
            });

        if (uploadError) {
            console.error(`❌ Error de subida a Storage para "${businessName}":`, uploadError);
            return null;
        }

        // 5. Get and return the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(filePath);

        console.log(`✅ Imagen guardada permanentemente: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error(`❌ Error crítico en uploadBusinessPhoto para "${businessName}":`, error);
        return null;
    }
}
