import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Level, Sport } from "@/types/database";

export interface Viewer {
  id: string;
  name: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  sports: Sport[];
  level: Level | null;
  hasActiveAlert: boolean;
}

/**
 * Utilisateur connecté + profil, mémoïsé pour la durée de la requête
 * (la page d'accueil rend plusieurs composants qui en ont besoin).
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: alert }] = await Promise.all([
    supabase
      .from("users")
      .select("name, city, latitude, longitude, sports, level")
      .eq("id", user.id)
      .single(),
    supabase.from("alert_configs").select("active").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    id: user.id,
    name: profile?.name ?? "",
    city: profile?.city ?? null,
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null,
    sports: profile?.sports ?? [],
    level: profile?.level ?? null,
    hasActiveAlert: alert?.active ?? false,
  };
});
