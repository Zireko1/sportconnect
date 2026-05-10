import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessageNotifEmail } from "@/emails/MessageNotif";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  let body: { messageId?: string; annonceId?: string; senderId?: string; receiverId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { messageId, annonceId, senderId, receiverId } = body;
  if (!messageId || !annonceId || !senderId || !receiverId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Anti-spam: skip if we already notified for this conversation in the last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("annonce_id", annonceId)
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .gte("created_at", twoHoursAgo)
    .neq("id", messageId);

  if (count && count > 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Fetch the data needed for the email
  const [{ data: msgRow }, { data: sender }, { data: receiver }, { data: annonce }] =
    await Promise.all([
      supabase.from("messages").select("content").eq("id", messageId).single(),
      supabase.from("users").select("name, email").eq("id", senderId).single(),
      supabase.from("users").select("name, email").eq("id", receiverId).single(),
      supabase.from("annonces").select("id, title").eq("id", annonceId).single(),
    ]);

  if (!msgRow || !sender || !receiver || !annonce) {
    return NextResponse.json({ error: "Data not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    await resend.emails.send({
      from: "alertes@sportvoisin.fr",
      to: receiver.email,
      subject: `[SportVoisin] Nouveau message de ${sender.name}`,
      react: MessageNotifEmail({
        receiverName: receiver.name,
        senderName: sender.name,
        messagePreview: msgRow.content.slice(0, 50),
        annonceTitle: annonce.title,
        annonceUrl: `${appUrl}/annonce/${annonce.id}`,
      }),
    });
  } catch (err) {
    console.error("[messages/notify] Resend error:", err);
    return NextResponse.json({ ok: false, error: "Email send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: true });
}
