import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewMessage } from "@/lib/message-notify";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Notification email d'un nouveau message, appelée par le chat juste après l'envoi.
 * Réservée à l'expéditeur authentifié du message ; destinataire, annonce et
 * contenu sont relus en base (cf. notifyNewMessage).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let messageId: unknown;
  try {
    ({ messageId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (typeof messageId !== "string" || !UUID_RE.test(messageId)) {
    return NextResponse.json({ error: "messageId invalide" }, { status: 400 });
  }

  const result = await notifyNewMessage(messageId, user.id);

  switch (result.status) {
    case "sent":
      return NextResponse.json({ ok: true, sent: true });
    case "skipped":
      return NextResponse.json({ ok: true, skipped: true, reason: result.reason });
    // Même réponse pour « inconnu » et « pas à toi » : on ne révèle pas l'existence du message
    case "forbidden":
    case "not_found":
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    case "error":
      console.error("[messages/notify] Resend error:", result.error);
      return NextResponse.json({ ok: false, error: "Email send failed" }, { status: 500 });
  }
}
