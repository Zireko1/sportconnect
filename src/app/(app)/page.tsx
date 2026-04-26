import { Suspense } from "react";
import { AnnonceFilters } from "@/components/annonces/AnnonceFilters";
import { AnnonceFeed } from "@/components/annonces/AnnonceFeed";
import { CommunityStats } from "@/components/annonces/CommunityStats";
import { SearchBar } from "@/components/annonces/SearchBar";
import { UserAvatar } from "@/components/layout/UserAvatar";

interface HomePageProps {
  searchParams: Promise<{ sport?: string; ville?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { sport, ville, q } = await searchParams;
  const hasFilters = sport || ville || q;

  return (
    <div className="max-w-sm mx-auto">
      {/* Header */}
      <header className="bg-surface px-4 pt-12 pb-4 space-y-3 sticky top-0 z-40 border-b border-[#e0ebe2]">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-syne font-bold text-xl text-green-alpine">
              Sport<span className="text-green-dark">Connect</span>
            </span>
            <p className="font-dm text-text-secondary text-xs">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <Suspense fallback={<div className="w-9 h-9 rounded-full bg-green-light animate-pulse" />}>
            <UserAvatar />
          </Suspense>
        </div>

        {/* Barre de recherche */}
        <Suspense>
          <SearchBar />
        </Suspense>
      </header>

      {/* Stats communauté */}
      <Suspense fallback={<StatsSkeleton />}>
        <CommunityStats />
      </Suspense>

      {/* Filtres sport + ville */}
      <Suspense>
        <AnnonceFilters />
      </Suspense>

      {/* Titre section */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <h2 className="font-syne font-bold text-base text-text-primary">
          {hasFilters ? "Résultats" : "Matchs & sorties à venir"}
        </h2>
        {hasFilters && (
          <a
            href="/"
            className="font-dm text-xs text-green-alpine hover:text-green-dark"
          >
            Effacer les filtres
          </a>
        )}
      </div>

      {/* Fil d'annonces */}
      <Suspense fallback={<FeedSkeleton />}>
        <AnnonceFeed sport={sport} ville={ville} q={q} />
      </Suspense>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-px bg-[#e0ebe2] border-b border-[#e0ebe2]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface px-2 py-3 text-center space-y-1">
          <div className="h-5 w-10 bg-green-light rounded animate-pulse mx-auto" />
          <div className="h-3 w-16 bg-[#f0f5f1] rounded animate-pulse mx-auto" />
        </div>
      ))}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="px-4 space-y-3 py-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface rounded-card shadow-card p-4 space-y-3 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="h-6 w-24 bg-green-light rounded-pill" />
            <div className="h-6 w-20 bg-[#f0f5f1] rounded-pill" />
          </div>
          <div className="h-5 w-3/4 bg-[#f0f5f1] rounded" />
          <div className="h-4 w-1/2 bg-[#f0f5f1] rounded" />
          <div className="h-4 w-2/3 bg-[#f0f5f1] rounded" />
          <div className="flex justify-between pt-1 border-t border-[#f0f5f1]">
            <div className="h-5 w-20 bg-[#f0f5f1] rounded-pill" />
            <div className="h-5 w-12 bg-green-light rounded-pill" />
          </div>
        </div>
      ))}
    </div>
  );
}
