"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function joinAnnonce(annonceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { error } = await supabase
    .from("inscriptions")
    .insert({ annonce_id: annonceId, user_id: user.id, status: "confirmed" });

  if (error && error.code !== "23505") throw new Error(error.message);

  revalidatePath(`/annonce/${annonceId}`);
}

export async function leaveAnnonce(annonceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { error } = await supabase
    .from("inscriptions")
    .delete()
    .eq("annonce_id", annonceId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/annonce/${annonceId}`);
}
