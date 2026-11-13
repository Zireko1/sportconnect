import { NextRequest, NextResponse } from "next/server";
import { sendDigest } from "@/lib/alert-digest";

function authorizeCron(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const result = await sendDigest("daily");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron daily]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
