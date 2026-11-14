import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { AnnonceMap, type MapAnnonce } from "./AnnonceMap";
import type { Sport } from "@/types/database";

interface Props {
  sport?: string;
  ville?: string;
  q?: string;
  className?: string;
}

/** Nombre max d'annonces affichées sur la carte */
const MAP_LIMIT = 300;

/**
 * Charge les annonces à venir qui ont des coordonnées (mêmes filtres que la
 * liste) et les passe à la carte, rendue uniquement côté client.
 */
export async function AnnonceMapSection({ sport, ville, q, className }: Props) {
  const supabase = await createClient();

  let query = supabase
    .from("annonces")
    .select("id, sport, sport_custom, date_time, city, latitude, longitude, users:public_profiles(name:first_name)")
    .in("status", ["open", "full"])
    .gte("date_time", new Date().toISOString())
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("date_time", { ascending: true })
    .limit(MAP_LIMIT);

  if (sport) query = query.eq("sport", sport as Sport);
  if (ville) query = query.eq("city", ville);
  if (q) query = query.ilike("title", `%${q}%`);

  const [{ data }, viewer] = await Promise.all([query, getViewer()]);

  const annonces: MapAnnonce[] = (data ?? [])
    .filter((a): a is typeof a & { latitude: number; longitude: number } =>
      typeof a.latitude === "number" && typeof a.longitude === "number")
    .map((a) => {
      const organizer = Array.isArray(a.users) ? a.users[0] : a.users;
      return {
        id: a.id,
        sport: a.sport,
        sportCustom: a.sport_custom,
        dateTime: a.date_time,
        city: a.city,
        lat: a.latitude,
        lon: a.longitude,
        organizer: (organizer as { name?: string } | null)?.name ?? null,
      };
    });

  const profile = viewer
    ? { city: viewer.city, latitude: viewer.latitude, longitude: viewer.longitude }
    : null;

  return <AnnonceMap annonces={annonces} profile={profile} className={className} />;
}
