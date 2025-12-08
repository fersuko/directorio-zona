import { useState } from "react";
import { X, ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
    businessId: number;
    currentImageUrl?: string;
    onUploadSuccess: (url: string) => void;
}

export function ImageUpload({ businessId, currentImageUrl, onUploadSuccess }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona una imagen válida");
            return;
        }

        setUploading(true);

        try {
            // Compress and optimize image
            const options = {
                maxSizeMB: 0.15, // Max 150KB
                maxWidthOrHeight: 800, // Max 800px
                useWebWorker: true,
                fileType: "image/webp" // Convert to WebP
            };

            const compressedFile = await imageCompression(file, options);
            console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB → Compressed: ${(compressedFile.size / 1024).toFixed(2)}KB`);

            // Generate unique filename
            const fileName = `${businessId}_${Date.now()}.webp`;
            const filePath = `businesses/${fileName}`;

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from("business-images")
                .upload(filePath, compressedFile, {
                    contentType: "image/webp"
                });

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("business-images")
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUploadSuccess(publicUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error al subir la imagen. Por favor intenta de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUploadSuccess("");
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium">Imagen del Negocio</label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                <p className="text-sm">Subiendo...</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-10 h-10" />
                                <p className="text-sm font-medium">Haz clic para subir una imagen</p>
                                <p className="text-xs">PNG, JPG hasta 2MB</p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
            )}

            <p className="text-xs text-muted-foreground">
                Sube una foto de tu negocio para atraer más clientes
            </p>
        </div>
    );
}
