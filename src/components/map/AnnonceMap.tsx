"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ProfileLocation } from "@/lib/hooks/useUserLocation";

export interface MapAnnonce {
  id: string;
  sport: string;
  sportCustom: string | null;
  dateTime: string;
  city: string;
  lat: number;
  lon: number;
  /** Prénom de l'organisateur */
  organizer: string | null;
}

export interface AnnonceMapProps {
  annonces: MapAnnonce[];
  profile: ProfileLocation | null;
  className?: string;
  /** Ne monter Leaflet que sur ce format (lg = 1024px, comme Tailwind) */
  breakpoint?: "mobile" | "desktop";
  /** Classes de hauteur (défaut : 300px mobile / 400px desktop) */
  heightClass?: string;
}

/** Hauteur : 300px sur mobile, 400px à partir de lg */
const HEIGHT = "h-[300px] lg:h-[400px]";

// Leaflet manipule window/document : pas de rendu serveur.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className={`${HEIGHT} w-full bg-[#e8f5ec] animate-pulse flex items-center justify-center`}>
      <span className="font-dm text-xs text-green-dark">Chargement de la carte…</span>
    </div>
  ),
});

export function AnnonceMap({ className = "", breakpoint, heightClass = HEIGHT, ...props }: AnnonceMapProps) {
  // null = pas encore déterminé (rendu serveur / premier rendu)
  const [matches, setMatches] = useState<boolean | null>(breakpoint ? null : true);

  useEffect(() => {
    if (!breakpoint) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setMatches(breakpoint === "desktop" ? mq.matches : !mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden isolate ${className}`}>
      {matches ? <LeafletMap {...props} /> : <div className="h-full w-full bg-[#e8f5ec]" />}
    </div>
  );
}
