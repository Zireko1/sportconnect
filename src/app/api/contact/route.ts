import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !body.nom?.trim() || !body.email?.trim() || !body.message?.trim()) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  const { nom, email, message } = body as { nom: string; email: string; message: string };

  const { error } = await resend.emails.send({
    from: "alertes@sportvoisin.fr",
    to: "ottman.zirek@gmail.com",
    subject: `[SportVoisin] Message de ${nom}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d9e4e;">Nouveau message via SportVoisin</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <hr style="border: none; border-top: 1px solid #e0ebe2; margin: 16px 0;" />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'envoi." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
