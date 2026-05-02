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

          {/* Carte placeholder */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e0ebe2] flex items-center justify-between">
              <p className="font-syne font-bold text-sm text-text-primary">Carte</p>
              <span className="font-dm text-[10px] font-medium bg-green-alpine/10 text-green-dark px-2 py-0.5 rounded-pill">
                Bientôt
              </span>
            </div>
            <div className="relative h-52 bg-[#e8f5ec] overflow-hidden">
              {/* Faux fond cartographique */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 320 208"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Grille */}
                {[32, 64, 96, 128, 160, 192].map((y) => (
                  <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} stroke="#2d9e4e" strokeWidth="0.5" opacity="0.15" />
                ))}
                {[40, 80, 120, 160, 200, 240, 280].map((x) => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="208" stroke="#2d9e4e" strokeWidth="0.5" opacity="0.15" />
                ))}
                {/* Routes stylisées */}
                <path d="M0 110 C70 95 150 125 320 105" stroke="#2d9e4e" strokeWidth="3" fill="none" opacity="0.2" strokeLinecap="round" />
                <path d="M0 60 C90 70 200 55 320 65" stroke="#2d9e4e" strokeWidth="1.5" fill="none" opacity="0.15" strokeLinecap="round" />
                <path d="M155 0 C148 55 165 145 158 208" stroke="#2d9e4e" strokeWidth="2" fill="none" opacity="0.18" strokeLinecap="round" />
                <path d="M80 0 C75 80 85 150 78 208" stroke="#2d9e4e" strokeWidth="1" fill="none" opacity="0.1" strokeLinecap="round" />
                {/* Zones */}
                <ellipse cx="110" cy="90" rx="30" ry="20" fill="#2d9e4e" opacity="0.06" />
                <ellipse cx="210" cy="130" rx="25" ry="16" fill="#2d9e4e" opacity="0.06" />
              </svg>

              {/* Pins de localisation */}
              <div className="absolute w-4 h-4 bg-green-alpine rounded-full shadow-md border-2 border-white" style={{ top: "38%", left: "32%" }} />
              <div className="absolute w-3 h-3 bg-green-alpine/70 rounded-full shadow border-2 border-white" style={{ top: "58%", left: "62%" }} />
              <div className="absolute w-2.5 h-2.5 bg-green-dark/50 rounded-full border border-white" style={{ top: "28%", left: "65%" }} />
              <div className="absolute w-2 h-2 bg-green-dark/40 rounded-full border border-white" style={{ top: "72%", left: "22%" }} />

              {/* Bulle centrale */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                <div className="w-11 h-11 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d9e4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <p className="font-dm text-xs font-medium text-green-dark bg-white/80 backdrop-blur-sm px-3 py-1 rounded-pill shadow-sm">
                  Carte interactive à venir
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
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
