import { useState, useEffect } from 'react';

export const useGoogleMaps = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            setLoadError(new Error("Google Maps API Key not configured"));
            return;
        }

        if ((window as any).google?.maps) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => setIsLoaded(true);
        script.onerror = () => setLoadError(new Error("Failed to load Google Maps script"));

        document.head.appendChild(script);

        return () => {
            // Cleanup logic if needed, usually we keep the script
        };
    }, []);

    return { isLoaded, loadError };
};
