import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useGeolocation } from "../hooks/useGeolocation";
import "leaflet/dist/leaflet.css";
import businessesData from "../data/businesses.json";
import type { Business } from "../types";
import { Icon } from "leaflet";

// Fix for default marker icon in React Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const businesses = businessesData as Business[];

// Monterrey Centro
const CENTER = [25.669, -100.313] as [number, number];

export default function MapPage() {
    const navigate = useNavigate();
    const { coordinates, loading, error, getLocation } = useGeolocation();
    const [map, setMap] = useState<any>(null);

    // Effect to fly to user location when coordinates update
    useEffect(() => {
        if (coordinates && map) {
            map.flyTo([coordinates.lat, coordinates.lng], 16, {
                duration: 1.5
            });
        }
    }, [coordinates, map]);

    return (
        <div className="h-[calc(100vh-4rem)] w-full relative z-0">
            <MapContainer
                center={CENTER}
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full"
                ref={setMap}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {coordinates && (
                    <Marker position={[coordinates.lat, coordinates.lng]} icon={defaultIcon}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm text-primary">¡Estás aquí!</h3>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {businesses.map((business) => (
                    <Marker
                        key={business.id}
                        position={[business.lat, business.lng]}
                        icon={defaultIcon}
                    >
                        <Popup>
                            <div className="p-1 min-w-[120px]">
                                <h3 className="font-bold text-sm">{business.name}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{business.category}</p>
                                {business.isPremium && (
                                    <span className="text-[10px] font-bold text-yellow-600 block mb-2">★ Premium</span>
                                )}
                                <button
                                    onClick={() => navigate(`/business/${business.id}`)}
                                    className="w-full bg-primary text-white text-xs py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    Ver Detalles
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Floating Overlay for Context */}
            <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none flex justify-between items-start">
                <div className="glass-card p-3 rounded-xl pointer-events-auto">
                    <h1 className="font-bold text-sm">Mapa de Zona</h1>
                    <p className="text-xs text-muted-foreground">Explorando {businesses.length} lugares</p>
                </div>

                <button
                    onClick={getLocation}
                    disabled={loading}
                    className="pointer-events-auto bg-white text-primary p-3 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MapPin className="w-5 h-5" />
                    )}
                </button>
            </div>

            {error && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg whitespace-nowrap">
                    {error}
                </div>
            )}
        </div>
    );
}
