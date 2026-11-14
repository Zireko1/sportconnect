"use client";

import { useMemo } from "react";
import { AnnonceCard } from "./AnnonceCard";
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
}

/**
 * Trie les annonces par distance croissante quand une position est connue
 * (géoloc ou ville du profil), sinon conserve l'ordre chronologique.
 * Les annonces sans coordonnées passent après, dans l'ordre chronologique.
 */
export function NearbyFeed({ annonces, profile, variant = "default", limit = 20 }: NearbyFeedProps) {
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
    return withDistance.slice(0, limit);
  }, [annonces, location, limit]);

  const cards = items.map(({ annonce, distanceKm }) => (
    <AnnonceCard key={annonce.id} annonce={annonce} distanceKm={distanceKm} />
  ));

  if (variant === "grid") {
    return <div className="grid grid-cols-2 gap-4">{cards}</div>;
  }
  return <div className="px-4 space-y-3 py-4">{cards}</div>;
}
