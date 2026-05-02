"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Sport, SportType, Level } from "@/types/database";

export interface CreateAnnonceInput {
  sport: Sport;
  sport_type: SportType;
  title: string;
  description?: string;
  date_time: string;
  location_name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  sport_custom?: string;
  total_spots: number;
  level?: Level;
  price_per_player?: number;
  // Outdoor uniquement
  distance_km?: number;
  elevation_m?: number;
  pace?: string;
}

export async function createAnnonce(input: CreateAnnonceInput) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data, error } = await supabase
    .from("annonces")
    .insert({
      organizer_id: user.id,
      sport: input.sport,
      sport_type: input.sport_type,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      date_time: input.date_time,
      location_name: input.location_name.trim(),
      city: input.city,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      sport_custom: input.sport_custom?.trim() || null,
      total_spots: input.total_spots,
      filled_spots: 1, // l'organisateur compte comme participant
      level: input.level || null,
      price_per_player: input.price_per_player ?? 0,
      distance_km: input.distance_km || null,
      elevation_m: input.elevation_m || null,
      pace: input.pace?.trim() || null,
      status: "open",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Déclencher le matching en arrière-plan (non-bloquant)
  const annonceId = data.id;
  import("@/lib/matching")
    .then(({ triggerMatchingForAnnonce }) => triggerMatchingForAnnonce(annonceId))
    .catch((err) => console.error("[matching] erreur:", err));

  redirect(`/annonce/${data.id}`);
}
