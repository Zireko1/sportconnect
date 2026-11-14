import { Suspense } from "react";
import { AnnonceFeed } from "@/components/annonces/AnnonceFeed";
import { AnnonceFilters } from "@/components/annonces/AnnonceFilters";
import { SearchBar } from "@/components/annonces/SearchBar";
import { AnnonceMapSection } from "@/components/map/AnnonceMapSection";
import Link from "next/link";

interface ExplorerPageProps {
  searchParams: Promise<{ sport?: string; ville?: string; q?: string; vue?: string }>;
}

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const { sport, ville, q, vue } = await searchParams;
  const isMap = vue === "carte";

  // Liens d'onglets qui conservent les filtres en cours
  const tabHref = (carte: boolean) => {
    const params = new URLSearchParams();
    if (sport) params.set("sport", sport);
    if (ville) params.set("ville", ville);
    if (q) params.set("q", q);
    if (carte) params.set("vue", "carte");
    const qs = params.toString();
    return qs ? `/explorer?${qs}` : "/explorer";
  };

  return (
    <div className="max-w-sm mx-auto">
      <header className="bg-surface px-4 pt-12 pb-4 space-y-3 sticky top-0 z-40 border-b border-[#e0ebe2]">
        <h1 className="font-syne font-bold text-xl text-text-primary">Explorer</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </header>

      <Suspense>
        <AnnonceFilters />
      </Suspense>

      <div className="px-4 pt-4 pb-1 flex items-center justify-between gap-3">
        <h2 className="font-syne font-bold text-base text-text-primary">
          {sport || ville || q ? "Résultats" : "Toutes les annonces"}
        </h2>
        {/* Onglets Liste / Carte */}
        <div role="tablist" aria-label="Affichage" className="flex bg-[#f0f5f1] rounded-pill p-0.5">
          {[
            { label: "Liste", carte: false },
            { label: "Carte", carte: true },
          ].map(({ label, carte }) => {
            const selected = carte === isMap;
            return (
              <Link
                key={label}
                href={tabHref(carte)}
                role="tab"
                aria-selected={selected}
                scroll={false}
                className={[
                  "font-dm text-xs font-medium px-3.5 py-1.5 rounded-pill transition-colors",
                  selected ? "bg-white text-green-dark shadow-sm" : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {isMap ? (
        <div className="py-3">
          <Suspense fallback={<div className="h-[300px] lg:h-[400px] bg-[#e8f5ec] animate-pulse" />}>
            <AnnonceMapSection sport={sport} ville={ville} q={q} />
          </Suspense>
        </div>
      ) : (
        <Suspense>
          <AnnonceFeed sport={sport} ville={ville} q={q} />
        </Suspense>
      )}
    </div>
  );
}
