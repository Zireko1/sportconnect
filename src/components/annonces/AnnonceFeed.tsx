import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { NearbyFeed, type FeedAnnonce } from "./NearbyFeed";
import { AlertesCta } from "./AlertesCta";
import type { Sport } from "@/types/database";

interface AnnonceFeedProps {
  sport?: string;
  ville?: string;
  q?: string;
  variant?: "default" | "grid";
}

/** Nombre d'annonces à venir chargées : le tri par proximité se fait côté client sur ce lot */
const FETCH_LIMIT = 100;
/** Nombre d'annonces affichées */
const DISPLAY_LIMIT = 20;

export async function AnnonceFeed({ sport, ville, q, variant = "default" }: AnnonceFeedProps) {
  const supabase = await createClient();

  const baseQuery = supabase
    .from("annonces")
    .select("*, users:public_profiles(name:first_name, avatar_url)")
    .in("status", ["open", "full"])
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(FETCH_LIMIT);

  const sportFiltered = sport ? baseQuery.eq("sport", sport as Sport) : baseQuery;
  const villeFiltered = ville ? sportFiltered.eq("city", ville) : sportFiltered;
  const finalQuery = q ? villeFiltered.ilike("title", `%${q}%`) : villeFiltered;

  const [{ data, error }, viewer] = await Promise.all([finalQuery, getViewer()]);
  const annonces = data as FeedAnnonce[] | null;

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="font-dm text-text-secondary text-sm">
          Erreur lors du chargement. Réessaie.
        </p>
      </div>
    );
  }

  const hasFilters = Boolean(sport || ville || q);
  // Connecté, sans alerte active et sans filtre : on pousse les alertes
  const showAlertCta = Boolean(viewer && !viewer.hasActiveAlert && !hasFilters);

  if (!annonces || annonces.length === 0) {
    if (showAlertCta) {
      return (
        <div className={variant === "grid" ? "" : "px-4 py-4"}>
          <AlertesCta />
        </div>
      );
    }
    return <EmptyState sport={sport} ville={ville} q={q} />;
  }

  const profile = viewer
    ? { city: viewer.city, latitude: viewer.latitude, longitude: viewer.longitude }
    : null;

  return (
    <NearbyFeed
      annonces={annonces}
      profile={profile}
      variant={variant}
      limit={DISPLAY_LIMIT}
      showAlertCta={showAlertCta}
    />
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
