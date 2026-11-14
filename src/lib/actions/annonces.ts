"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { waitUntil } from "@vercel/functions";
import { triggerMatchingForAnnonce } from "@/lib/matching";
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
  /** Sportif invité depuis /sportifs : reçoit un message avec l'annonce */
  invite_user_id?: string;
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

  // Déclencher le matching après la réponse, sans être coupé par la fin de
  // la fonction serverless (équivalent de after() de Next 15 pour Next 14).
  waitUntil(
    triggerMatchingForAnnonce(data.id).catch((err) =>
      console.error("[matching] erreur:", err)
    )
  );

  if (input.invite_user_id && input.invite_user_id !== user.id) {
    await sendInvitation(supabase, {
      annonceId: data.id,
      senderId: user.id,
      receiverId: input.invite_user_id,
      title: input.title.trim(),
      dateTime: input.date_time,
      city: input.city,
    });
  }

  redirect(`/annonce/${data.id}`);
}

/** Message d'invitation dans la messagerie + notification email (best effort). */
async function sendInvitation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  p: { annonceId: string; senderId: string; receiverId: string; title: string; dateTime: string; city: string }
) {
  const date = new Date(p.dateTime).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  });
  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      annonce_id: p.annonceId,
      sender_id: p.senderId,
      receiver_id: p.receiverId,
      content: `👋 Je te propose un match : « ${p.title} », ${date} à ${p.city}. Ça te dit ? Rejoins l'annonce si tu es partant !`,
    })
    .select("id")
    .single();

  if (error || !msg) {
    console.error("[invitation] échec envoi message:", error?.message);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  waitUntil(
    fetch(`${appUrl}/api/messages/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: msg.id, annonceId: p.annonceId, senderId: p.senderId, receiverId: p.receiverId }),
    }).catch((err) => console.error("[invitation] notif email:", err))
  );
}
