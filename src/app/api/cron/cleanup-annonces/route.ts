import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function authorizeCron(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("annonces")
    .delete()
    .lt("date_time", now)
    .select("id");

  if (error) {
    console.error("[cleanup-annonces]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const deleted = data?.length ?? 0;
  console.log(`[cleanup-annonces] ${deleted} annonce(s) supprimée(s)`);

  return NextResponse.json({ ok: true, deleted });
}
