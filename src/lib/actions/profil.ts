"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_SPORTS, PROFILE_LEVELS, normalizeSportCustom } from "@/lib/profile-options";
import type { Sport, Level } from "@/types/database";

const LEVELS: readonly Level[] = PROFILE_LEVELS.map((l) => l.value);

export interface ProfileUpdate {
  name: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  sports: Sport[];
  sport_custom: string | null;
  level: Level | null;
}

export async function updateProfile(input: ProfileUpdate): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const name = input.name.trim();
  if (!name) return { error: "Le nom est obligatoire." };
  if (name.length > 80) return { error: "Le nom est trop long (80 caractères max)." };

  const sports = Array.from(new Set(input.sports)).filter((s): s is Sport =>
    (PROFILE_SPORTS as readonly string[]).includes(s)
  );
  const level = input.level && LEVELS.includes(input.level) ? input.level : null;
  const city = input.city?.trim() || null;

  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email!,
      name,
      city,
      // Coordonnées utilisées par le matching des alertes (rayon en km)
      latitude: city ? input.latitude : null,
      longitude: city ? input.longitude : null,
      sports,
      sport_custom: normalizeSportCustom(input.sport_custom),
      level,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[updateProfile]", error.message);
    return { error: "Impossible d'enregistrer le profil. Réessaie." };
  }

  revalidatePath("/profil");
  revalidatePath("/", "layout"); // nom/initiales du header
  return {};
}
