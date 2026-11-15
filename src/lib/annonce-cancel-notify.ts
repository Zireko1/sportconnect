import { createAdminClient } from "@/lib/supabase/admin";
import { resend, resolveRecipient } from "@/lib/resend";
import { AnnonceAnnuleeEmail } from "@/emails/AnnonceAnnulee";
import { SPORT_LABEL } from "@/components/ui/Badge";

/** Ce qu'il faut garder de l'annonce AVANT sa suppression pour écrire l'email. */
export interface CancelledAnnonceSnapshot {
  title: string;
  sportLabel: string;
  dateTime: string;
  place: string;
  organizerName: string;
  recipients: { name: string; email: string }[];
}

/**
 * Collecte, avant suppression, les inscrits à prévenir (inscription non annulée,
 * hors organisateur) et les infos de l'annonce. Client admin : les emails des
 * autres utilisateurs ne sont pas lisibles avec la session de l'organisateur.
 * Renvoie null si personne n'est à prévenir ou si le match est déjà passé.
 */
export async function collectCancellationRecipients(annonceId: string): Promise<CancelledAnnonceSnapshot | null> {
  const supabase = createAdminClient();

  const [{ data: annonce }, { data: inscrits }] = await Promise.all([
    supabase
      .from("annonces")
      .select("title, sport, sport_custom, date_time, city, location_name, organizer_id")
      .eq("id", annonceId)
      .single(),
    supabase
      .from("inscriptions")
      .select("user_id, users(name, email)")
      .eq("annonce_id", annonceId)
      .neq("status", "cancelled"),
  ]);

  if (!annonce || !inscrits?.length) return null;
  if (new Date(annonce.date_time).getTime() < Date.now()) return null;

  const recipients = (inscrits as unknown as { user_id: string; users: { name: string; email: string } | null }[])
    .filter((i) => i.user_id !== annonce.organizer_id && i.users?.email)
    .map((i) => ({ name: i.users!.name.trim().split(" ")[0] || "sportif", email: i.users!.email }));
  if (!recipients.length) return null;

  const { data: organizer } = await supabase
    .from("users")
    .select("name")
    .eq("id", annonce.organizer_id)
    .single();

  const sportLabel =
    annonce.sport === "autre" ? annonce.sport_custom ?? "Autre sport" : SPORT_LABEL[annonce.sport] ?? annonce.sport;
  const place = [annonce.location_name, annonce.city].filter(Boolean).join(", ");

  return {
    title: annonce.title,
    sportLabel,
    dateTime: annonce.date_time,
    place,
    organizerName: organizer?.name.trim().split(" ")[0] || "L'organisateur",
    recipients,
  };
}

/** Envoie l'email d'annulation à chaque inscrit. Les échecs sont loggés, jamais levés. */
export async function sendCancellationEmails(
  snapshot: CancelledAnnonceSnapshot,
  organizerMessage: string | null
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const dateLabel = new Date(snapshot.dateTime).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  });

  const results = await Promise.allSettled(
    snapshot.recipients.map(async (r) => {
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM ?? "alertes@sportvoisin.fr",
        to: resolveRecipient(r.email),
        subject: `[SportVoisin] Match annulé : ${snapshot.title}`,
        react: AnnonceAnnuleeEmail({
          participantName: r.name,
          organizerName: snapshot.organizerName,
          annonceTitle: snapshot.title,
          sportLabel: snapshot.sportLabel,
          dateLabel,
          place: snapshot.place,
          organizerMessage,
          explorerUrl: `${appUrl}/explorer`,
        }),
      });
      if (error) throw new Error(error.message);
    })
  );

  const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
  if (failed.length) {
    console.error(
      `[annulation] ${failed.length}/${results.length} email(s) en échec:`,
      failed.map((f) => String(f.reason))
    );
  }
}
