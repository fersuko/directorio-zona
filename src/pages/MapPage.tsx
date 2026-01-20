import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useBusinesses } from "../hooks/useBusinesses";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { MONTERREY_CENTRO } from "../constants/geo";
// Fix for default marker icon in React Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useLocation } from "../context/LocationContext";
import { useMapEvents } from "react-leaflet";

const defaultIcon = new Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Monterrey Centro
const CENTER = [MONTERREY_CENTRO.lat, MONTERREY_CENTRO.lng] as [number, number];

export default function MapPage() {
    const navigate = useNavigate();
    const {
        coordinates,
        isManual,
        loading: geoLoading,
        error,
        refreshLocation,
        setManualLocation,
        clearManualLocation
    } = useLocation();

    const { businesses, loading: businessesLoading } = useBusinesses();
    const [map, setMap] = useState<any>(null);
    const [isSettingLocation, setIsSettingLocation] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Dynamic Categories
    const categories = useMemo(() => {
        const cats = new Set(businesses.map(b => b.category));
        return ["Todos", ...Array.from(cats).sort()];
    }, [businesses]);

    // Filtered Businesses
    const filteredBusinesses = useMemo(() => {
        if (selectedCategory === "Todos") return businesses;
        return businesses.filter(b => b.category === selectedCategory);
    }, [businesses, selectedCategory]);

    // Fly to user location
    // Note: Removed automatic flyTo on mount to avoid annoying jumps if exploring
    const handleLocate = () => {
        refreshLocation();
        if (coordinates && map) {
            map.flyTo([coordinates.lat, coordinates.lng], 16, { duration: 1.5 });
        }
    };

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                if (isSettingLocation) {
                    setManualLocation(e.latlng.lat, e.latlng.lng);
                    setIsSettingLocation(false);
                }
            },
        });
        return null;
    };

    if (businessesLoading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] w-full relative z-0 flex flex-col">

            {/* Category Filter Bar */}
            <div className="bg-background/95 backdrop-blur z-[400] px-4 py-3 border-b border-white/5 shadow-sm">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                                whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                ${selectedCategory === cat
                                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-white/5"}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 relative">
                <MapContainer
                    center={CENTER}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    ref={setMap}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    <MapClickHandler />

                    {/* User Location */}
                    {coordinates && (
                        <Marker position={[coordinates.lat, coordinates.lng]} icon={defaultIcon}>
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm text-primary">
                                        {isManual ? "Ubicación fijada" : "Tu ubicación estimada"}
                                    </h3>
                                    {isManual && (
                                        <button
                                            onClick={clearManualLocation}
                                            className="text-[10px] text-red-500 hover:underline mt-1"
                                        >
                                            Restablecer GPS
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Businesses */}
                    {filteredBusinesses.map((business) => (
                        <Marker
                            key={business.id}
                            position={[business.lat, business.lng]}
                            icon={defaultIcon}
                        >
                            <Popup>
                                <div className="p-1 min-w-[140px]">
                                    <h3 className="font-bold text-sm">{business.name}</h3>
                                    <div className="flex items-center gap-1 mb-2">
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                            {business.category}
                                        </span>
                                        {business.isPremium && (
                                            <span className="text-[10px] text-yellow-500 font-bold">★ top</span>
                                        )}
                                    </div>
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

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 pointer-events-none">
                    <div className="pointer-events-auto bg-background/90 backdrop-blur p-2 rounded-xl shadow-xl border border-white/10 text-right">
                        <p className="text-xs font-bold">{filteredBusinesses.length} lugares</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{selectedCategory}</p>
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3 items-end">
                    {/* Manual Location Mode Toggle */}
                    <button
                        onClick={() => setIsSettingLocation(!isSettingLocation)}
                        className={`
                            px-4 py-2 rounded-full shadow-xl font-medium text-xs transition-all flex items-center gap-2
                            ${isSettingLocation
                                ? "bg-brand-red text-white animate-pulse"
                                : isManual
                                    ? "bg-green-500 text-white"
                                    : "bg-white text-slate-900 border border-white/10"}
                        `}
                    >
                        <MapPin className="w-4 h-4" />
                        {isSettingLocation ? "Toca el mapa..." : isManual ? "Ubicación fijada" : "Fijar mi ubicación"}
                    </button>

                    <button
                        onClick={handleLocate}
                        disabled={geoLoading}
                        className="bg-white text-primary p-3 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {geoLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <MapPin className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {error && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg whitespace-nowrap">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
