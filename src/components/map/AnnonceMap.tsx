"use client";

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

export function AnnonceMap({ className = "", ...props }: AnnonceMapProps) {
  return (
    <div className={`relative w-full ${HEIGHT} overflow-hidden isolate ${className}`}>
      <LeafletMap {...props} />
    </div>
  );
}
