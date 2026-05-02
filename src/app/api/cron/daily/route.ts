import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertEmail } from "@/lib/matching";

function authorizeCron(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Récupérer toutes les entrées non envoyées dont scheduled_for <= maintenant
  const { data: queue } = await supabase
    .from("alert_queue")
    .select("*, users(id, email, name), annonces(*), alert_configs!inner(sports, radius_km, frequency, active)")
    .is("sent_at", null)
    .lte("scheduled_for", new Date().toISOString())
    .eq("alert_configs.frequency", "daily")
    .eq("alert_configs.active", true);

  if (!queue?.length) return NextResponse.json({ ok: true, sent: 0 });

  // Grouper par user pour envoyer un seul email résumé par utilisateur
  const byUser = new Map<string, typeof queue>();
  for (const entry of queue) {
    const uid = entry.user_id;
    if (!byUser.has(uid)) byUser.set(uid, []);
    byUser.get(uid)!.push(entry);
  }

  let sent = 0;
  for (const [, entries] of byUser) {
    const first = entries[0];
    const user = first.users as { id: string; email: string; name: string } | null;
    const config = first.alert_configs as { sports: string[]; radius_km: number; frequency: string } | null;
    if (!user || !config) continue;

    const [mainEntry, ...rest] = entries;
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

    // Marquer comme envoyés
    const ids = entries.map((e) => e.id);
    await supabase.from("alert_queue").update({ sent_at: new Date().toISOString() }).in("id", ids);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
