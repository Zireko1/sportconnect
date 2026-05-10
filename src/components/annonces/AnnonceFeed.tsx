import { createClient } from "@/lib/supabase/server";
import { AnnonceCard } from "./AnnonceCard";
import type { Database, Sport } from "@/types/database";

type AnnonceRow = Database["public"]["Tables"]["annonces"]["Row"] & {
  users?: { name: string; avatar_url: string | null } | null;
};

interface AnnonceFeedProps {
  sport?: string;
  ville?: string;
  q?: string;
  variant?: "default" | "grid";
}

export async function AnnonceFeed({ sport, ville, q, variant = "default" }: AnnonceFeedProps) {
  const supabase = await createClient();

  const baseQuery = supabase
    .from("annonces")
    .select("*, users(name, avatar_url)")
    .in("status", ["open", "full"])
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(20);

  const sportFiltered = sport ? baseQuery.eq("sport", sport as Sport) : baseQuery;
  const villeFiltered = ville ? sportFiltered.eq("city", ville) : sportFiltered;
  const finalQuery = q ? villeFiltered.ilike("title", `%${q}%`) : villeFiltered;

  const { data, error } = await finalQuery;
  const annonces = data as AnnonceRow[] | null;

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="font-dm text-text-secondary text-sm">
          Erreur lors du chargement. Réessaie.
        </p>
      </div>
    );
  }

  if (!annonces || annonces.length === 0) {
    return <EmptyState sport={sport} ville={ville} q={q} />;
  }

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {annonces.map((annonce) => (
          <AnnonceCard key={annonce.id} annonce={annonce} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3 py-4">
      {annonces.map((annonce) => (
        <AnnonceCard key={annonce.id} annonce={annonce} />
      ))}
    </div>
  );
}

function EmptyState({ sport, ville, q }: { sport?: string; ville?: string; q?: string }) {
  const hasFilters = sport || ville || q;
  return (
    <div className="px-4 py-16 text-center space-y-3">
      <div className="text-4xl">🏟️</div>
      <h3 className="font-syne font-bold text-text-primary">
        {hasFilters ? "Aucune annonce trouvée" : "Aucune annonce pour le moment"}
      </h3>
      <p className="font-dm text-text-secondary text-sm max-w-xs mx-auto">
        {hasFilters
          ? "Essaie d'autres filtres ou sois le premier à publier !"
          : "Sois le premier à publier un match ou une sortie dans ta ville."}
      </p>
      <a
        href="/annonce/creer"
        className="inline-block mt-2 bg-green-alpine text-white font-dm font-medium text-sm px-5 py-2.5 rounded-card"
      >
        Publier une annonce
      </a>
    </div>
  );
}
