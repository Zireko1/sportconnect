import { createAdminClient } from "@/lib/supabase/admin";
import { resend, resolveRecipient } from "@/lib/resend";
import { InscriptionNotifEmail } from "@/emails/InscriptionNotif";
import { SPORT_LABEL } from "@/components/ui/Badge";

/**
 * Email à l'organisateur : « X rejoint ton match ».
 * Client admin : l'email de l'organisateur n'est pas lisible avec la session
 * de l'inscrit. Les prénoms viennent de public_profiles.
 */
export async function notifyOrganizerOfInscription(annonceId: string, participantId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: annonce } = await supabase
    .from("annonces")
    .select("id, title, sport, sport_custom, date_time, location_name, city, total_spots, filled_spots, organizer_id")
    .eq("id", annonceId)
    .single();
  if (!annonce || annonce.organizer_id === participantId) return;

  // service_role n'a pas accès à la vue public_profiles : on lit users et on
  // applique la même règle que la vue (premier mot du nom = prénom).
  const { data: people } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", [annonce.organizer_id, participantId]);
  const organizer = people?.find((p) => p.id === annonce.organizer_id);
  if (!organizer?.email) return;

  const firstName = (id: string, fallback: string) =>
    people?.find((p) => p.id === id)?.name?.trim().split(" ")[0] || fallback;
  const organizerName = firstName(annonce.organizer_id, "");
  const participantName = firstName(participantId, "Un sportif");

  const sportLabel =
    annonce.sport === "autre" ? annonce.sport_custom ?? "Autre sport" : SPORT_LABEL[annonce.sport] ?? annonce.sport;
  const dateLabel = new Date(annonce.date_time).toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sportvoisin.fr";

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? "alertes@sportvoisin.fr",
    to: resolveRecipient(organizer.email),
    subject: `${participantName} rejoint ton match — ${annonce.title}`,
    react: InscriptionNotifEmail({
      organizerName: organizerName || "organisateur",
      participantName,
      annonceTitle: annonce.title,
      sportLabel,
      dateLabel,
      place: [annonce.location_name, annonce.city].filter(Boolean).join(", "),
      // filled_spots est mis à jour par le trigger update_filled_spots à l'insertion
      spotsLeft: Math.max(annonce.total_spots - annonce.filled_spots, 0),
      totalSpots: annonce.total_spots,
      contactUrl: `${appUrl}/annonce/${annonce.id}?withUser=${participantId}`,
    }),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
