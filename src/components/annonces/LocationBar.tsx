"use client";

import { useUserLocation, type ProfileLocation } from "@/lib/hooks/useUserLocation";

/**
 * Bouton « 📍 Autour de moi » + badge « Annonces près de [ville] ».
 * La position est partagée avec NearbyFeed via useUserLocation.
 */
export function LocationBar({ profile, className = "" }: { profile: ProfileLocation | null; className?: string }) {
  const { location, status, request } = useUserLocation(profile);
  const usingGps = location?.source === "gps";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {location && (
        <span className="inline-flex items-center gap-1 font-dm text-xs text-green-dark bg-green-light px-2.5 py-1 rounded-pill">
          <span aria-hidden>📍</span>
          Annonces près de {location.label ?? "ta position"}
        </span>
      )}

      {status === "locating" ? (
        <span className="font-dm text-xs text-text-secondary">Localisation…</span>
      ) : (
        <button
          type="button"
          onClick={request}
          className={
            usingGps
              ? "font-dm text-xs text-text-secondary hover:text-green-alpine underline-offset-2 hover:underline"
              : "inline-flex items-center gap-1 font-dm text-xs font-medium border border-green-alpine text-green-alpine hover:bg-green-light px-2.5 py-1 rounded-pill transition-colors"
          }
        >
          {usingGps ? "Actualiser" : <><span aria-hidden>📍</span> Autour de moi</>}
        </button>
      )}

      {status === "denied" && (
        <span className="font-dm text-[11px] text-text-secondary w-full">
          Géolocalisation refusée
          {profile?.city ? ` — tri selon ta ville (${profile.city}).` : ". Renseigne ta ville dans ton profil pour un tri par proximité."}
        </span>
      )}
      {status === "unavailable" && (
        <span className="font-dm text-[11px] text-text-secondary w-full">
          Position indisponible
          {profile?.city ? ` — tri selon ta ville (${profile.city}).` : "."}
        </span>
      )}
    </div>
  );
}
