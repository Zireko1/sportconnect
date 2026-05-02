"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Sport, AlertFrequency, Level } from "@/types/database";

export interface AlertConfigData {
  active: boolean;
  sports: Sport[];
  radius_km: number;
  days_of_week: number[];
  time_slots: string[];
  level: Level | "tous";
  frequency: AlertFrequency;
}

export async function getAlertConfig(): Promise<AlertConfigData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("alert_configs")
    .select("active, sports, radius_km, days_of_week, time_slots, level, frequency")
    .eq("user_id", user.id)
    .single();

  return data ?? null;
}

export async function saveAlertConfig(config: AlertConfigData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { error } = await supabase
    .from("alert_configs")
    .upsert({ user_id: user.id, ...config }, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}

export async function sendTestEmail(): Promise<{ email: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: alertConfig } = await supabase
    .from("alert_configs")
    .select("sports, radius_km, frequency")
    .eq("user_id", user.id)
    .single();

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { sendAlertEmail } = await import("@/lib/matching");
  const admin = createAdminClient();

  const { data: annonce } = await admin
    .from("annonces")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!annonce) throw new Error("Aucune annonce disponible pour le test");

  await sendAlertEmail({
    to: user.email!,
    userName: user.user_metadata?.name ?? "Sportif",
    annonce,
    matchedCriteria: { sport: true, distanceKm: 8, dayLabel: "Lundi", slotLabel: "Soirée (18h–22h)" },
    otherAnnonces: [],
    alertConfig: alertConfig ?? { sports: [], radius_km: 30, frequency: "daily" },
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  });

  return { email: user.email! };
}
