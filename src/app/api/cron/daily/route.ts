import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertEmail } from "@/lib/matching";
import type { Database } from "@/types/database";

type QueueRow = Database["public"]["Tables"]["alert_queue"]["Row"] & {
  users: { id: string; email: string; name: string } | null;
  annonces: Database["public"]["Tables"]["annonces"]["Row"] | null;
  alert_configs: { sports: string[]; radius_km: number; frequency: string; active: boolean } | null;
};

function authorizeCron(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data } = await supabase
    .from("alert_queue")
    .select("*, users(id, email, name), annonces(*), alert_configs!inner(sports, radius_km, frequency, active)")
    .is("sent_at", null)
    .lte("scheduled_for", new Date().toISOString())
    .eq("alert_configs.frequency", "daily")
    .eq("alert_configs.active", true);

  const queue = data as QueueRow[] | null;
  if (!queue?.length) return NextResponse.json({ ok: true, sent: 0 });

  const byUser: Record<string, QueueRow[]> = {};
  queue.forEach((entry) => {
    const uid = entry.user_id;
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push(entry);
  });

  let sent = 0;
  const groups = Object.values(byUser);
  for (let i = 0; i < groups.length; i++) {
    const entries = groups[i];
    const first = entries[0];
    const user = first.users;
    const config = first.alert_configs;
    if (!user || !config) continue;

    const mainEntry = entries[0];
    const rest = entries.slice(1);
    const annonce = mainEntry.annonces as Parameters<typeof sendAlertEmail>[0]["annonce"] | null;
    if (!annonce) continue;

    await sendAlertEmail({
      to: user.email,
      userName: user.name,
      annonce,
      matchedCriteria: { sport: true, distanceKm: null, dayLabel: "Aujourd'hui", slotLabel: "Récap quotidien" },
      otherAnnonces: rest.map((e) => e.annonces).filter(Boolean) as Parameters<typeof sendAlertEmail>[0]["otherAnnonces"],
      alertConfig: config,
      appUrl,
    });

    const ids = entries.map((e) => e.id);
    await supabase.from("alert_queue").update({ sent_at: new Date().toISOString() }).in("id", ids);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
