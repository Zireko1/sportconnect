"use client";

import dynamic from "next/dynamic";
import { useBreakpoint } from "@/lib/hooks/useBreakpoint";

// Leaflet manipule window/document : pas de rendu serveur.
const LocationLeaflet = dynamic(() => import("./LocationLeaflet"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#e8f5ec] animate-pulse" />,
});

interface LocationMapProps {
  locationName: string;
  city: string;
  lat: number | null;
  lon: number | null;
  /** Ne monter Leaflet que sur ce format (la page détail a une mise en page mobile et une desktop) */
  breakpoint?: "mobile" | "desktop";
}

/** Lien universel Google Maps (ouvre l'app sur mobile, le site sinon) */
function googleMapsUrl({ locationName, city, lat, lon }: Omit<LocationMapProps, "breakpoint">) {
  const query = lat !== null && lon !== null ? `${lat},${lon}` : `${locationName}, ${city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Carte de localisation d'une annonce + adresse + lien Google Maps */
export function LocationMap({ breakpoint, ...props }: LocationMapProps) {
  const { locationName, city, lat, lon } = props;
  const matches = useBreakpoint(breakpoint);
  const hasCoords = lat !== null && lon !== null;

  return (
    <div className="bg-surface rounded-card shadow-card overflow-hidden">
      {hasCoords && (
        <div className="relative h-[220px] w-full overflow-hidden isolate bg-[#e8f5ec]">
          {matches && <LocationLeaflet lat={lat} lon={lon} />}
        </div>
      )}

      <div className="p-4 space-y-3">
        <p className="flex items-start gap-2 font-dm text-sm text-text-primary">
          <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3aaa5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            {locationName}, {city}
          </span>
        </p>
        <a
          href={googleMapsUrl(props)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 min-h-[44px] w-full border border-green-alpine text-green-alpine hover:bg-green-light font-dm font-medium text-sm rounded-card transition-colors"
        >
          Ouvrir dans Google Maps
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
