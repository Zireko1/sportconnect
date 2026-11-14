import { Suspense } from "react";
import { AnnonceFilters } from "@/components/annonces/AnnonceFilters";
import { AnnonceFeed } from "@/components/annonces/AnnonceFeed";
import { CommunityStats } from "@/components/annonces/CommunityStats";
import { SearchBar } from "@/components/annonces/SearchBar";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { LocationBar } from "@/components/annonces/LocationBar";
import { getViewer } from "@/lib/viewer";
import { AnnonceMapSection } from "@/components/map/AnnonceMapSection";

interface HomePageProps {
  searchParams: Promise<{ sport?: string; ville?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { sport, ville, q } = await searchParams;
  const hasFilters = sport || ville || q;
  const viewer = await getViewer();
  const profileLocation = viewer
    ? { city: viewer.city, latitude: viewer.latitude, longitude: viewer.longitude }
    : null;

  return (
    <>
      {/* ========== MOBILE LAYOUT (< lg) ========== */}
      <div className="lg:hidden max-w-sm mx-auto">
        {/* Header sticky mobile */}
        <header className="bg-surface px-4 pt-12 pb-4 space-y-3 sticky top-0 z-40 border-b border-[#e0ebe2]">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-syne font-bold text-xl text-green-alpine">
                Sport<span className="text-green-dark">Voisin</span>
              </span>
              <p className="font-dm text-text-secondary text-xs">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <Suspense
              fallback={
                <div className="w-9 h-9 rounded-full bg-green-light animate-pulse" />
              }
            >
              <UserAvatar />
            </Suspense>
          </div>
          <Suspense>
            <SearchBar />
          </Suspense>
        </header>

        {/* Stats communauté */}
        <Suspense fallback={<StatsSkeleton />}>
          <CommunityStats />
        </Suspense>

        <SportifsTeaser className="mx-4 mt-3" />

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
        <LocationBar profile={profileLocation} className="px-4 pt-1" />

        {/* Fil d'annonces */}
        <Suspense fallback={<FeedSkeleton />}>
          <AnnonceFeed sport={sport} ville={ville} q={q} />
        </Suspense>
      </div>

      {/* ========== DESKTOP LAYOUT (>= lg) ========== */}
      <div className="hidden lg:grid lg:grid-cols-[280px_1fr_320px] lg:gap-6 max-w-7xl mx-auto px-6 py-6 items-start">

        {/* LEFT SIDEBAR — recherche + filtres */}
        <aside className="sticky top-20 space-y-4">
          <div className="bg-surface rounded-card shadow-card p-4">
            <p className="font-syne font-bold text-sm text-text-primary mb-3">
              Recherche
            </p>
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
          <div className="bg-surface rounded-card shadow-card p-4">
            <p className="font-syne font-bold text-sm text-text-primary mb-3">
              Filtres
            </p>
            <Suspense>
              <AnnonceFilters variant="sidebar" />
            </Suspense>
          </div>
        </aside>

        {/* CENTER — fil d'annonces */}
        <main className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-xl text-text-primary">
              {hasFilters ? "Résultats" : "Matchs & sorties à venir"}
            </h2>
            {hasFilters && (
              <a
                href="/"
                className="font-dm text-sm text-green-alpine hover:text-green-dark"
              >
                Effacer les filtres
              </a>
            )}
          </div>
          <LocationBar profile={profileLocation} className="-mt-2 mb-4" />
          <Suspense fallback={<FeedSkeletonGrid />}>
            <AnnonceFeed sport={sport} ville={ville} q={q} variant="grid" />
          </Suspense>
        </main>

        {/* RIGHT SIDEBAR — stats + carte */}
        <aside className="sticky top-20 space-y-4">
          {/* Stats */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e0ebe2]">
              <p className="font-syne font-bold text-sm text-text-primary">
                Communauté
              </p>
            </div>
            <Suspense fallback={<StatsSkeleton />}>
              <CommunityStats />
            </Suspense>
          </div>

          <SportifsTeaser />

          {/* Carte des annonces */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e0ebe2] flex items-center justify-between">
              <p className="font-syne font-bold text-sm text-text-primary">Carte</p>
              <a href="/explorer?vue=carte" className="font-dm text-xs text-green-alpine hover:text-green-dark">
                Agrandir
              </a>
            </div>
            <Suspense fallback={<div className="h-[400px] bg-[#e8f5ec] animate-pulse" />}>
              <AnnonceMapSection sport={sport} ville={ville} q={q} />
            </Suspense>
          </div>
        </aside>
      </div>
    </>
  );
}

function SportifsTeaser({ className = "" }: { className?: string }) {
  return (
    <a
      href="/sportifs"
      className={`flex items-center gap-3 bg-surface rounded-card shadow-card px-4 py-3 hover:bg-green-light transition-colors ${className}`}
    >
      <span className="text-2xl" aria-hidden>👥</span>
      <span className="flex-1">
        <span className="block font-syne font-bold text-sm text-text-primary">Sportifs autour de moi</span>
        <span className="block font-dm text-xs text-text-secondary">Trouve des partenaires près de chez toi</span>
      </span>
      <span className="text-green-alpine" aria-hidden>→</span>
    </a>
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

function FeedSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-surface rounded-card shadow-card p-4 space-y-3 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="h-6 w-20 bg-green-light rounded-pill" />
            <div className="h-6 w-16 bg-[#f0f5f1] rounded-pill" />
          </div>
          <div className="h-5 w-3/4 bg-[#f0f5f1] rounded" />
          <div className="h-4 w-1/2 bg-[#f0f5f1] rounded" />
          <div className="h-4 w-2/3 bg-[#f0f5f1] rounded" />
          <div className="flex justify-between pt-1 border-t border-[#f0f5f1]">
            <div className="h-5 w-16 bg-[#f0f5f1] rounded-pill" />
            <div className="h-5 w-10 bg-green-light rounded-pill" />
          </div>
        </div>
      ))}
    </div>
  );
}
