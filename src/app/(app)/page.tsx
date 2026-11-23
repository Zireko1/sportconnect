import { Suspense } from "react";
import { AnnonceFilters } from "@/components/annonces/AnnonceFilters";
import { AnnonceFeed } from "@/components/annonces/AnnonceFeed";
import { SearchBar } from "@/components/annonces/SearchBar";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Logo } from "@/components/ui/Logo";
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
              <Logo />
              <p className="font-dm text-text-secondary text-xs mt-1">
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

        {/* Accroche early adopter */}
        <EarlyAdopterCard className="mx-4 mt-3" />

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
          <AnnonceFeed
            sport={sport}
            ville={ville}
            q={q}
            slot={
              <section className="bg-surface rounded-card shadow-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#e0ebe2] flex items-center justify-between">
                  <h2 className="font-syne font-bold text-sm text-text-primary">Carte</h2>
                  <a href="/explorer?vue=carte" className="font-dm text-xs text-green-alpine hover:text-green-dark">
                    Agrandir
                  </a>
                </div>
                <Suspense fallback={<div className="h-[250px] bg-[#e8f5ec] animate-pulse" />}>
                  <AnnonceMapSection sport={sport} ville={ville} q={q} breakpoint="mobile" heightClass="h-[250px]" />
                </Suspense>
              </section>
            }
          />
        </Suspense>
      </div>

      {/* ========== DESKTOP LAYOUT (>= lg) ========== */}
      <div className="hidden lg:grid lg:grid-cols-[220px_1fr_260px] xl:grid-cols-[280px_1fr_320px] lg:gap-6 max-w-7xl mx-auto px-6 py-6 items-start">

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

        {/* RIGHT SIDEBAR — communauté + carte */}
        <aside className="sticky top-20 space-y-4">
          {/* Accroche early adopter */}
          <EarlyAdopterCard />

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
              <AnnonceMapSection sport={sport} ville={ville} q={q} breakpoint="desktop" />
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

function EarlyAdopterCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-surface rounded-card shadow-card px-4 py-4 border-l-4 border-green-alpine ${className}`}>
      <p className="font-syne font-bold text-base text-text-primary leading-snug">
        Rejoins les premiers sportifs de la région <span aria-hidden>🏃</span>
      </p>
      <p className="font-dm text-xs text-text-secondary mt-1">
        Sois parmi les fondateurs de la communauté{" "}
        <span className="font-semibold text-green-alpine">SportVoisin</span> — Haute-Savoie &amp; bassin lémanique
      </p>
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
