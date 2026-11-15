import { haversineKm } from "./geo";

// Logique pure de matching alerte ↔ annonce (sans I/O, testable isolément).

export const SLOT_RANGES: { value: string; min: number; max: number }[] = [
  { value: "matin",      min: 7,  max: 12 },
  { value: "apres-midi", min: 12, max: 18 },
  { value: "soiree",     min: 18, max: 22 },
];

/** Créneau d'une heure (0-23, heure de Paris). Hors plages (nuit) → soirée. */
export function slotForHour(hour: number): string {
  return SLOT_RANGES.find(({ min, max }) => hour >= min && hour < max)?.value ?? "soiree";
}

export interface MatchConfig {
  sports: string[];
  radius_km: number;
  days_of_week: number[];
  time_slots: string[];
  level: string;
}

export interface MatchUser {
  id: string;
  city?: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MatchAnnonce {
  organizer_id: string;
  sport: string;
  level: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export type MatchResult =
  | { ok: true; distanceKm: number | null }
  | { ok: false; reason: "organizer" | "sport" | "day" | "slot" | "level" | "distance" | "city" | "no_location" };

function sameCity(a: string, b: string) {
  const n = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[-'’\s]+/g, " ").trim();
  return n(a) === n(b);
}

/**
 * Une annonce correspond-elle à la config d'alerte d'un utilisateur ?
 * @param dow jour de la semaine de l'annonce (0 = dimanche, heure de Paris)
 * @param slot créneau de l'annonce (cf. slotForHour)
 */
export function matchAlert(
  config: MatchConfig,
  user: MatchUser,
  annonce: MatchAnnonce,
  dow: number,
  slot: string
): MatchResult {
  if (user.id === annonce.organizer_id) return { ok: false, reason: "organizer" };
  if (!config.sports.includes(annonce.sport)) return { ok: false, reason: "sport" };
  if (!config.days_of_week.includes(dow)) return { ok: false, reason: "day" };
  if (!config.time_slots.includes("tous") && !config.time_slots.includes(slot)) return { ok: false, reason: "slot" };
  if (config.level !== "tous" && annonce.level && config.level !== annonce.level) return { ok: false, reason: "level" };

  const userHasCoords = typeof user.latitude === "number" && typeof user.longitude === "number";
  const annonceHasCoords = typeof annonce.latitude === "number" && typeof annonce.longitude === "number";

  if (userHasCoords && annonceHasCoords) {
    const distanceKm = Math.round(haversineKm(user.latitude!, user.longitude!, annonce.latitude!, annonce.longitude!));
    return distanceKm <= config.radius_km ? { ok: true, distanceKm } : { ok: false, reason: "distance" };
  }

  // Coordonnées manquantes d'un côté : on se rabat sur le nom de la ville
  // plutôt que d'alerter tout le monde, quelle que soit la distance.
  if (user.city) {
    return sameCity(user.city, annonce.city) ? { ok: true, distanceKm: null } : { ok: false, reason: "city" };
  }

  // Utilisateur sans localisation : impossible de respecter le rayon choisi.
  // Plutôt que d'alerter pour toutes les annonces de France, on n'envoie rien
  // (la page /mes-alertes invite à renseigner sa ville).
  return { ok: false, reason: "no_location" };
}
