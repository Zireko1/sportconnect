import { createClient } from "@/lib/supabase/server";

export async function CommunityStats() {
  const supabase = await createClient();

  const [{ count: usersCount }, { count: annoncesCount }, { count: matchesCount }] =
    await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("annonces")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "full"]),
      supabase
        .from("annonces")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed"),
    ]);

  const stats = [
    { label: "Sportifs", value: usersCount ?? 0 },
    { label: "Annonces actives", value: annoncesCount ?? 0 },
    { label: "Matchs joués", value: matchesCount ?? 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-px bg-[#e0ebe2] border-b border-[#e0ebe2]">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-surface px-2 py-3 text-center">
          <p className="font-syne font-bold text-lg text-green-alpine leading-none">
            {value}
          </p>
          <p className="font-dm text-[10px] text-text-secondary mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
