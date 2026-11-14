// Utilitaires géographiques partagés (serveur + client).

/** Distance à vol d'oiseau en km entre deux points (formule de Haversine). */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Coordonnées valides (0 est une valeur légitime, null/undefined non). */
export function hasCoords<T extends { latitude: number | null; longitude: number | null }>(
  o: T
): o is T & { latitude: number; longitude: number } {
  return typeof o.latitude === "number" && typeof o.longitude === "number";
}

/**
 * Distance arrondie pour l'affichage. Volontairement approximative
 * (pas de précision au mètre près pour ne pas trahir une adresse).
 */
export function approxKm(km: number): number {
  if (km < 2) return 1;
  if (km < 10) return Math.round(km);
  return Math.round(km / 5) * 5;
}

/** "à ~8 km", "à moins de 2 km" */
export function formatDistance(km: number): string {
  if (km < 2) return "à moins de 2 km";
  return `à ~${approxKm(km)} km`;
}

/** Boîte englobante approximative autour d'un point (pour pré-filtrer en SQL). */
export function boundingBox(lat: number, lon: number, radiusKm: number) {
  const dLat = radiusKm / 111;
  const dLon = radiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLon: lon - dLon, maxLon: lon + dLon };
}
