import { NextRequest, NextResponse } from "next/server";
import { triggerMatchingForAnnonce } from "@/lib/matching";

function authorizeCron(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!authorizeCron(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { annonceId } = await req.json();
    if (!annonceId) return NextResponse.json({ error: "annonceId requis" }, { status: 400 });
    await triggerMatchingForAnnonce(annonceId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[trigger] erreur matching:", err);
    return NextResponse.json({ error: "erreur interne" }, { status: 500 });
  }
}
