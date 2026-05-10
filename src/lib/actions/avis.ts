"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitAvisAnnonce(annonceId: string, formData: FormData) {
  const note = parseInt(formData.get("note") as string);
  if (!note || note < 1 || note > 5) throw new Error("Note invalide");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  await supabase.from("avis_annonces").insert({
    reviewer_id: user.id,
    annonce_id: annonceId,
    note,
  });
}

export async function submitAvisJoueur(
  reviewedId: string,
  annonceId: string,
  formData: FormData
) {
  const note = parseInt(formData.get("note") as string);
  if (!note || note < 1 || note > 5) throw new Error("Note invalide");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  await supabase.from("avis_joueurs").insert({
    reviewer_id: user.id,
    reviewed_id: reviewedId,
    annonce_id: annonceId,
    note,
  });
}
