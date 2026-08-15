const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export interface GeoPoint {
  lat: number;
  lng: number;
}

// Toulouse city-centre fallback, used only if geocoding fails so the
// route optimizer always has a usable depot point.
export const MARIN_FROID_DEPOT_FALLBACK: GeoPoint = { lat: 43.6112, lng: 1.4632 };
export const MARIN_FROID_DEPOT_ADDRESS = "Chemin du Chapitre, 31100 Toulouse, France";

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "MarinFroid-B2B-Portal/1.0 (contact: commandes@marinfroid.fr)",
        "Accept-Language": "fr",
      },
    });
    if (!res.ok) return null;
    const results = (await res.json()) as { lat: string; lon: string }[];
    if (!results.length) return null;
    return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
  } catch {
    return null;
  }
}

export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestNeighborOrder<T extends { point: GeoPoint }>(depot: GeoPoint, stops: T[]): T[] {
  const remaining = [...stops];
  const ordered: T[] = [];
  let current = depot;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineDistanceKm(current, remaining[i].point);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const [next] = remaining.splice(bestIdx, 1);
    ordered.push(next);
    current = next.point;
  }
  return ordered;
}
