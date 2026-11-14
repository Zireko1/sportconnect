"use client";

import { useMemo } from "react";
import { AnnonceCard } from "./AnnonceCard";
import { AlertesCta } from "./AlertesCta";
import { haversineKm, hasCoords } from "@/lib/geo";
import { useUserLocation, type ProfileLocation } from "@/lib/hooks/useUserLocation";
import type { Database } from "@/types/database";

export type FeedAnnonce = Database["public"]["Tables"]["annonces"]["Row"] & {
  users?: { name: string; avatar_url: string | null } | null;
};

interface NearbyFeedProps {
  annonces: FeedAnnonce[];
  profile: ProfileLocation | null;
  variant?: "default" | "grid";
  limit?: number;
  /** Afficher l'encart alertes s'il y a moins de 3 annonces dans la région */
  showAlertCta?: boolean;
}

/** Rayon considéré comme « la région » de l'utilisateur */
const REGION_RADIUS_KM = 30;
const MIN_REGION_ANNONCES = 3;

/**
 * Trie les annonces par distance croissante quand une position est connue
 * (géoloc ou ville du profil), sinon conserve l'ordre chronologique.
 * Les annonces sans coordonnées passent après, dans l'ordre chronologique.
 */
export function NearbyFeed({ annonces, profile, variant = "default", limit = 20, showAlertCta = false }: NearbyFeedProps) {
  const { location } = useUserLocation(profile);

  const items = useMemo(() => {
    const withDistance = annonces.map((a) => ({
      annonce: a,
      distanceKm: location && hasCoords(a) ? haversineKm(location.lat, location.lon, a.latitude, a.longitude) : null,
    }));
    if (location) {
      // sort() est stable : à distance inconnue, l'ordre chronologique est conservé
      withDistance.sort((x, y) => {
        if (x.distanceKm === null) return y.distanceKm === null ? 0 : 1;
        if (y.distanceKm === null) return -1;
        return x.distanceKm - y.distanceKm;
      });
    }
    const regionCount = location
      ? withDistance.filter((x) => x.distanceKm !== null && x.distanceKm <= REGION_RADIUS_KM).length
      : withDistance.length;
    return { list: withDistance.slice(0, limit), regionCount };
  }, [annonces, location, limit]);

  const cta = showAlertCta && items.regionCount < MIN_REGION_ANNONCES;

  const cards = items.list.map(({ annonce, distanceKm }) => (
    <AnnonceCard key={annonce.id} annonce={annonce} distanceKm={distanceKm} />
  ));

  if (variant === "grid") {
    return (
      <>
        {cta && <AlertesCta className="mb-4" />}
        <div className="grid grid-cols-2 gap-4">{cards}</div>
      </>
    );
  }
  return (
    <div className="px-4 space-y-3 py-4">
      {cta && <AlertesCta />}
      {cards}
    </div>
  );
}
