export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

// Afstand in meter tussen twee punten (haversine-formule).
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Richting van a naar b in graden: 0 = noorden, 90 = oosten.
export function bearingDegrees(a: LatLng, b: LatLng): number {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const DIRECTIONS = ['noorden', 'noordoosten', 'oosten', 'zuidoosten', 'zuiden', 'zuidwesten', 'westen', 'noordwesten'];

export function compassWord(bearing: number): string {
  return DIRECTIONS[Math.round(bearing / 45) % 8];
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 5) * 5 || 1} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

// Offset in meter (oost, noord) van b ten opzichte van a, voor de radarweergave.
export function offsetMeters(a: LatLng, b: LatLng): { east: number; north: number } {
  const north = toRad(b.lat - a.lat) * EARTH_RADIUS_M;
  const east = toRad(b.lng - a.lng) * EARTH_RADIUS_M * Math.cos(toRad(a.lat));
  return { east, north };
}

export function nearest<T extends LatLng>(point: LatLng, items: T[]): { item: T; meters: number } | null {
  let best: { item: T; meters: number } | null = null;
  for (const item of items) {
    const meters = distanceMeters(point, item);
    if (best === null || meters < best.meters) best = { item, meters };
  }
  return best;
}

export function timeAgo(iso: string, now: number = Date.now()): string {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'nu';
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} u geleden`;
  return 'meer dan een dag geleden';
}

export function isStale(iso: string, now: number = Date.now()): boolean {
  return now - new Date(iso).getTime() > 10 * 60_000;
}
