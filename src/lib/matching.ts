import { createAdminClient } from "@/lib/supabase/admin";
import { resend, resolveRecipient } from "@/lib/resend";
import { AlerteMatchEmail } from "@/emails/AlerteMatch";
import type { Database } from "@/types/database";

type ConfigRow = Database["public"]["Tables"]["alert_configs"]["Row"] & {
  users: { id: string; email: string; name: string; latitude: number | null; longitude: number | null } | null;
};

const SLOT_RANGES: { value: string; min: number; max: number }[] = [
  { value: "matin",      min: 7,  max: 12 },
  { value: "apres-midi", min: 12, max: 18 },
  { value: "soiree",     min: 18, max: 22 },
];

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const SLOT_LABELS: Record<string, string> = {
  matin: "Matin (7h–12h)", "apres-midi": "Après-midi (12h–18h)", soiree: "Soirée (18h–22h)", tous: "Toute la journée",
};

function getSlot(dateTime: string): string {
  const h = new Date(dateTime).getHours();
  return SLOT_RANGES.find(({ min, max }) => h >= min && h < max)?.value ?? "soiree";
}

function getDow(dateTime: string): number {
  return new Date(dateTime).getDay();
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNextFriday17h(): string {
  const d = new Date();
  const daysUntilFriday = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  d.setHours(17, 0, 0, 0);
  return d.toISOString();
}

export async function triggerMatchingForAnnonce(annonceId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: annonce } = await supabase
    .from("annonces")
    .select("*")
    .eq("id", annonceId)
    .single();
  if (!annonce) return;

  const slot = getSlot(annonce.date_time);
  const dow = getDow(annonce.date_time);
  const dayLabel = DAY_LABELS[dow];

  // Charger les configs actives dont le sport correspond
  const { data: rawConfigs } = await supabase
    .from("alert_configs")
    .select("*, users(id, email, name, latitude, longitude)")
    .eq("active", true)
    .contains("sports", [annonce.sport]);

  const configs = rawConfigs as ConfigRow[] | null;
  if (!configs?.length) return;

  // Charger 3 autres annonces dispo (pour la section "Autres annonces")
  const { data: others } = await supabase
    .from("annonces")
    .select("id, sport, title, date_time, city, filled_spots, total_spots")
    .eq("status", "open")
    .neq("id", annonceId)
    .order("created_at", { ascending: false })
    .limit(3);

  for (const config of configs) {
    const user = config.users;
    if (!user?.email) continue;
    if (user.id === annonce.organizer_id) continue;

    // Filtre jour
    if (!config.days_of_week.includes(dow)) continue;

    // Filtre créneau
    if (!config.time_slots.includes("tous") && !config.time_slots.includes(slot)) continue;

    // Filtre niveau
    if (config.level !== "tous" && annonce.level && config.level !== annonce.level) continue;

    // Filtre géo (si coordonnées dispo)
    let distanceKm: number | null = null;
    if (user.latitude && user.longitude && annonce.latitude && annonce.longitude) {
      distanceKm = Math.round(haversineKm(user.latitude, user.longitude, annonce.latitude, annonce.longitude));
      if (distanceKm > config.radius_km) continue;
    }

    if (config.frequency === "realtime") {
      // Anti-spam : max 3 alertes realtime par jour
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("alert_queue")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString())
        .not("sent_at", "is", null);

      if ((count ?? 0) >= 3) continue;

      // Envoi immédiat
      await sendAlertEmail({
        to: user.email,
        userName: user.name,
        annonce,
        matchedCriteria: { sport: true, distanceKm, dayLabel, slotLabel: SLOT_LABELS[slot] ?? slot },
        otherAnnonces: others ?? [],
        alertConfig: { sports: config.sports, radius_km: config.radius_km, frequency: config.frequency },
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      });

      // Marquer comme envoyé dans la queue
      await supabase.from("alert_queue").upsert(
        { user_id: user.id, annonce_id: annonceId, sent_at: new Date().toISOString(), scheduled_for: new Date().toISOString() },
        { onConflict: "user_id,annonce_id" }
      );
    } else {
      // Mettre en file pour digest daily/weekly
      const scheduledFor =
        config.frequency === "daily"
          ? (() => { const d = new Date(); d.setHours(18, 0, 0, 0); return d.toISOString(); })()
          : getNextFriday17h();

      await supabase.from("alert_queue").upsert(
        { user_id: user.id, annonce_id: annonceId, sent_at: null, scheduled_for: scheduledFor },
        { onConflict: "user_id,annonce_id", ignoreDuplicates: true }
      );
    }
  }
}

interface SendAlertEmailParams {
  to: string;
  userName: string;
  annonce: Parameters<typeof AlerteMatchEmail>[0]["annonce"];
  matchedCriteria: Parameters<typeof AlerteMatchEmail>[0]["matchedCriteria"];
  otherAnnonces: Parameters<typeof AlerteMatchEmail>[0]["otherAnnonces"];
  alertConfig: Parameters<typeof AlerteMatchEmail>[0]["alertConfig"];
  appUrl: string;
}

export async function sendAlertEmail(params: SendAlertEmailParams) {
  const sportLabel =
    { soccer_five: "Soccer Five", padel: "Padel", basket: "Basket", velo: "Vélo", trail: "Trail", randonnee: "Randonnée", volley: "Volley", futsal: "Futsal", badminton: "Badminton", autre: params.annonce.sport_custom ?? "Autre sport" }[params.annonce.sport]
    ?? params.annonce.sport;

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "alertes@sportvoisin.fr",
    to: resolveRecipient(params.to),
    subject: `🔔 ${sportLabel} disponible — ${params.annonce.city}`,
    react: AlerteMatchEmail({
      userName: params.userName,
      annonce: params.annonce,
      matchedCriteria: params.matchedCriteria,
      otherAnnonces: params.otherAnnonces,
      alertConfig: params.alertConfig,
      appUrl: params.appUrl,
    }),
  });
}
