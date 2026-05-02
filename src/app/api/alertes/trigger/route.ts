import { NextRequest, NextResponse } from "next/server";
import { triggerMatchingForAnnonce } from "@/lib/matching";

export async function POST(req: NextRequest) {
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
