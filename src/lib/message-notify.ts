import { createAdminClient } from "@/lib/supabase/admin";
import { resend, resolveRecipient } from "@/lib/resend";
import { MessageNotifEmail } from "@/emails/MessageNotif";

/** Au-delà, un message est trop ancien pour déclencher une notification (anti-rejeu). */
const MAX_MESSAGE_AGE_MS = 10 * 60 * 1000;
/** Une seule notification par conversation (annonce + expéditeur → destinataire) sur cette fenêtre. */
const ANTI_SPAM_WINDOW_MS = 2 * 60 * 60 * 1000;

export type NotifyResult =
  | { status: "sent" }
  | { status: "skipped"; reason: "already_notified" | "rate_limited" | "too_old" }
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "error"; error: string };

/**
 * Envoie l'email « nouveau message » au destinataire d'un message.
 *
 * Tout est relu en base à partir de l'id : l'appelant ne choisit ni le
 * destinataire, ni l'annonce, ni le contenu. `senderId` doit être l'utilisateur
 * authentifié qui a envoyé le message.
 */
export async function notifyNewMessage(messageId: string, senderId: string): Promise<NotifyResult> {
  const supabase = createAdminClient();

  const { data: msg } = await supabase
    .from("messages")
    .select("id, annonce_id, sender_id, receiver_id, content, created_at, notified_at")
    .eq("id", messageId)
    .maybeSingle();

  if (!msg) return { status: "not_found" };
  if (msg.sender_id !== senderId) return { status: "forbidden" };
  if (msg.notified_at) return { status: "skipped", reason: "already_notified" };
  if (Date.now() - new Date(msg.created_at).getTime() > MAX_MESSAGE_AGE_MS) {
    return { status: "skipped", reason: "too_old" };
  }

  // Anti-spam : déjà notifié pour cette conversation récemment ?
  const since = new Date(Date.now() - ANTI_SPAM_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("annonce_id", msg.annonce_id)
    .eq("sender_id", msg.sender_id)
    .eq("receiver_id", msg.receiver_id)
    .gte("notified_at", since);
  if (count && count > 0) return { status: "skipped", reason: "rate_limited" };

  // Réservation atomique : seul le premier appel passe
  const { data: claimed } = await supabase
    .from("messages")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", msg.id)
    .is("notified_at", null)
    .select("id");
  if (!claimed?.length) return { status: "skipped", reason: "already_notified" };

  const [{ data: sender }, { data: receiver }, { data: annonce }] = await Promise.all([
    supabase.from("users").select("name").eq("id", msg.sender_id).single(),
    supabase.from("users").select("name, email").eq("id", msg.receiver_id).single(),
    supabase.from("annonces").select("id, title").eq("id", msg.annonce_id).single(),
  ]);
  if (!sender || !receiver?.email || !annonce) return { status: "not_found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? "alertes@sportvoisin.fr",
    to: resolveRecipient(receiver.email),
    subject: `[SportVoisin] Nouveau message de ${sender.name}`,
    react: MessageNotifEmail({
      receiverName: receiver.name,
      senderName: sender.name,
      messagePreview: msg.content.slice(0, 50),
      annonceTitle: annonce.title,
      annonceUrl: `${appUrl}/annonce/${annonce.id}`,
    }),
  });

  if (error) {
    // Échec d'envoi : on libère la réservation pour ne pas bloquer l'anti-spam
    await supabase.from("messages").update({ notified_at: null }).eq("id", msg.id);
    return { status: "error", error: error.message };
  }
  return { status: "sent" };
}
