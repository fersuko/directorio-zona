import { useState } from "react";

interface GeolocationState {
    coordinates: { lat: number; lng: number } | null;
    loading: boolean;
    error: string | null;
}

export function useGeolocation() {
    const [location, setLocation] = useState<GeolocationState>({
        coordinates: null,
        loading: false,
        error: null,
    });

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({
                ...prev,
                error: "Geolocalización no soportada por tu navegador",
                loading: false,
            }));
            return;
        }

        setLocation((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    coordinates: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                    loading: false,
                    error: null,
                });
            },
            (error) => {
                let errorMessage = "Error desconocido al obtener ubicación";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Permiso de ubicación denegado";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Ubicación no disponible";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Tiempo de espera agotado";
                        break;
                }
                setLocation({
                    coordinates: null,
                    loading: false,
                    error: errorMessage,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return { ...location, getLocation };
}
