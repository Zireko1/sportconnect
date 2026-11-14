"use server";

import { createClient } from "@/lib/supabase/server";
import { approxKm, boundingBox, haversineKm, hasCoords } from "@/lib/geo";
import type { Level, Sport } from "@/types/database";

export interface NearbySportif {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  sports: Sport[];
  level: Level | null;
  city: string | null;
  /** Distance arrondie (jamais les coordonnées exactes) */
  approxKm: number;
}

const RADIUS_KM = 50;
const MAX_RESULTS = 20;

/**
 * Sportifs au profil complet (ville + sports) dans un rayon de 50 km,
 * triés par distance. Calcul côté serveur : le client ne reçoit ni
 * coordonnées ni email, seulement une distance approximative.
 */
export async function getNearbySportifs(lat: number, lon: number): Promise<NearbySportif[]> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return [];
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const box = boundingBox(lat, lon, RADIUS_KM);
  const { data, error } = await supabase
    .from("users")
    .select("id, name, avatar_url, sports, level, city, latitude, longitude")
    .neq("id", user.id)
    .not("city", "is", null)
    .gte("latitude", box.minLat)
    .lte("latitude", box.maxLat)
    .gte("longitude", box.minLon)
    .lte("longitude", box.maxLon)
    .limit(500);

  if (error || !data) return [];

  return data
    .filter(hasCoords)
    .filter((u) => u.sports.length > 0)
    .map((u) => ({ u, km: haversineKm(lat, lon, u.latitude, u.longitude) }))
    .filter(({ km }) => km <= RADIUS_KM)
    .sort((a, b) => a.km - b.km)
    .slice(0, MAX_RESULTS)
    .map(({ u, km }) => ({
      id: u.id,
      firstName: u.name.trim().split(/\s+/)[0] || "Sportif",
      avatarUrl: u.avatar_url,
      sports: u.sports,
      level: u.level,
      city: u.city,
      approxKm: approxKm(km),
    }));
}
