import { Suspense } from "react";
import { AnnonceFeed } from "@/components/annonces/AnnonceFeed";
import { AnnonceFilters } from "@/components/annonces/AnnonceFilters";
import { SearchBar } from "@/components/annonces/SearchBar";

interface ExplorerPageProps {
  searchParams: Promise<{ sport?: string; ville?: string; q?: string }>;
}

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const { sport, ville, q } = await searchParams;

  return (
    <div className="max-w-sm mx-auto">
      <header className="bg-surface px-4 pt-12 pb-4 space-y-3 sticky top-0 z-40 border-b border-[#dce6f0]">
        <h1 className="font-syne font-bold text-xl text-text-primary">Explorer</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </header>

      <Suspense>
        <AnnonceFilters />
      </Suspense>

      <div className="px-4 pt-4 pb-1">
        <h2 className="font-syne font-bold text-base text-text-primary">
          {sport || ville || q ? "Résultats" : "Toutes les annonces"}
        </h2>
      </div>

      <Suspense>
        <AnnonceFeed sport={sport} ville={ville} q={q} />
      </Suspense>
    </div>
  );
}
