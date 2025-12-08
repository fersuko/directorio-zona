/**
 * Converts latitude, longitude, and zoom level to an OpenStreetMap tile URL.
 * This provides a lightweight "static map" image without using heavy map components.
 */
export function getMapTileUrl(lat: number, lon: number, zoom: number): string {
    const n = Math.pow(2, zoom);
    const x = Math.floor(n * ((lon + 180) / 360));
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(
        (n * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2
    );

    // Using OpenStreetMap standard tile server
    return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}
