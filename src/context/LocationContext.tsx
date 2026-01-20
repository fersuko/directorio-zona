import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationContextType {
    coordinates: { lat: number; lng: number } | null;
    isManual: boolean;
    loading: boolean;
    error: string | null;
    refreshLocation: () => void;
    setManualLocation: (lat: number, lng: number) => void;
    clearManualLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const { coordinates: autoCoords, loading, error, getLocation } = useGeolocation();
    const [manualCoords, setManualCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Load manual location from storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('manual_location');
        if (saved) {
            try {
                setManualCoords(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing saved location", e);
            }
        } else {
            // If no manual, try auto
            getLocation();
        }
    }, []);

    const setManualLocation = (lat: number, lng: number) => {
        const coords = { lat, lng };
        setManualCoords(coords);
        localStorage.setItem('manual_location', JSON.stringify(coords));
    };

    const clearManualLocation = () => {
        setManualCoords(null);
        localStorage.removeItem('manual_location');
        getLocation();
    };

    return (
        <LocationContext.Provider value={{
            coordinates: manualCoords || autoCoords,
            isManual: !!manualCoords,
            loading,
            error,
            refreshLocation: getLocation,
            setManualLocation,
            clearManualLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
