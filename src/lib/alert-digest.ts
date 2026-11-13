import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertEmail } from "@/lib/matching";
import type { Database } from "@/types/database";

type QueueRow = Database["public"]["Tables"]["alert_queue"]["Row"] & {
  users: { id: string; email: string; name: string } | null;
  annonces: Database["public"]["Tables"]["annonces"]["Row"] | null;
};

type DigestConfig = { user_id: string; sports: string[]; radius_km: number; frequency: string };

/**
 * Envoie les récaps daily/weekly en attente.
 * alert_queue n'a pas de FK vers alert_configs : on charge d'abord la file,
 * puis les configs correspondantes par user_id dans une seconde requête.
 */
export async function sendDigest(frequency: "daily" | "weekly") {
  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // 1. Lignes de la file non envoyées et arrivées à échéance
  const { data: queueData, error: queueError } = await supabase
    .from("alert_queue")
    .select("*, users(id, email, name), annonces(*)")
    .is("sent_at", null)
    .lte("scheduled_for", new Date().toISOString());

  if (queueError) throw new Error(`alert_queue: ${queueError.message}`);
  const queue = (queueData ?? []) as QueueRow[];
  if (!queue.length) return { sent: 0, failed: 0 };

  // 2. Configs actives de la bonne fréquence pour ces utilisateurs
  const userIds = Array.from(new Set(queue.map((e) => e.user_id)));
  const { data: configData, error: configError } = await supabase
    .from("alert_configs")
    .select("user_id, sports, radius_km, frequency")
    .in("user_id", userIds)
    .eq("frequency", frequency)
    .eq("active", true);

  if (configError) throw new Error(`alert_configs: ${configError.message}`);
  const configByUser = new Map<string, DigestConfig>();
  ((configData ?? []) as DigestConfig[]).forEach((c) => configByUser.set(c.user_id, c));

  // 3. Regroupement par utilisateur (uniquement ceux ayant une config correspondante)
  const byUser = new Map<string, QueueRow[]>();
  for (const entry of queue) {
    if (!configByUser.has(entry.user_id)) continue;
    const list = byUser.get(entry.user_id) ?? [];
    list.push(entry);
    byUser.set(entry.user_id, list);
  }

  const dayLabel = frequency === "daily" ? "Aujourd'hui" : "Cette semaine";
  const slotLabel = frequency === "daily" ? "Récap quotidien" : "Récap hebdo";

  let sent = 0;
  let failed = 0;
  for (const [userId, entries] of Array.from(byUser.entries())) {
    const user = entries[0].users;
    const config = configByUser.get(userId)!;
    const withAnnonce = entries.filter((e) => e.annonces);
    if (!user?.email || !withAnnonce.length) continue;

    const [main, ...rest] = withAnnonce;
    try {
      await sendAlertEmail({
        to: user.email,
        userName: user.name,
        annonce: main.annonces!,
        matchedCriteria: { sport: true, distanceKm: null, dayLabel, slotLabel },
        otherAnnonces: rest.map((e) => e.annonces!),
        alertConfig: { sports: config.sports, radius_km: config.radius_km, frequency: config.frequency },
        appUrl,
      });
    } catch (err) {
      console.error(`[cron ${frequency}] échec envoi à ${userId}:`, err);
      failed++;
      continue;
    }

    const ids = entries.map((e) => e.id);
    const { error: updateError } = await supabase
      .from("alert_queue")
      .update({ sent_at: new Date().toISOString() })
      .in("id", ids);
    if (updateError) console.error(`[cron ${frequency}] maj sent_at:`, updateError.message);
    sent++;
  }

  return { sent, failed };
}
