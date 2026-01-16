import { supabase } from "./supabase";
import { getGooglePhotoUrl } from "./geocoding";

/**
 * Downloads an image from a Google Photo Reference or URL 
 * and uploads it to Supabase Storage 'business-images' bucket.
 * 
 * @param source Photo reference string or complete URL
 * @param businessName Name of the business for the filename
 * @returns The public URL of the stored image or null if failed
 */
export async function uploadBusinessPhoto(source: string, businessName: string): Promise<string | null> {
    try {
        if (!source) return null;

        // 1. Determine the actual image URL
        const imageUrl = source.startsWith('http') ? source : getGooglePhotoUrl(source);

        // 2. Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();

        // 3. Generate a clean unique filename
        const timestamp = Date.now();
        const safeName = businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const extension = blob.type === 'image/png' ? 'png' : 'jpg';
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
            console.error("Supabase Storage Upload Error:", uploadError);
            return null;
        }

        // 5. Get and return the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error("Error in uploadBusinessPhoto:", error);
        return null;
    }
}
