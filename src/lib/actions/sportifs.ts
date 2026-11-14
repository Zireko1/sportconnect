"use server";

import { createClient } from "@/lib/supabase/server";
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
 * triés par distance. Le client ne reçoit ni coordonnées ni email,
 * seulement une distance approximative.
 */
export async function getNearbySportifs(lat: number, lon: number): Promise<NearbySportif[]> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return [];
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Filtre, distance et arrondi faits en base (fonction nearby_profiles) :
  // les coordonnées des autres utilisateurs ne quittent jamais Postgres.
  const { data, error } = await supabase.rpc("nearby_profiles", {
    p_lat: lat,
    p_lon: lon,
    p_radius_km: RADIUS_KM,
    p_limit: MAX_RESULTS,
  });

  if (error || !data) {
    if (error) console.error("[sportifs] nearby_profiles:", error.message);
    return [];
  }

  return data.map((u) => ({
    id: u.id,
    firstName: u.first_name || "Sportif",
    avatarUrl: u.avatar_url,
    sports: u.sports,
    level: u.level,
    city: u.city,
    approxKm: u.distance_km,
  }));
}
