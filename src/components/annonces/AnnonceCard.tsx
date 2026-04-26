import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { SportBadge, LevelBadge, StatusBadge } from "@/components/ui/Badge";
import type { Database } from "@/types/database";

type Annonce = Database["public"]["Tables"]["annonces"]["Row"] & {
  users?: { name: string; avatar_url: string | null } | null;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const spotsLeft = annonce.total_spots - annonce.filled_spots;
  const isOutdoor = annonce.sport_type === "outdoor";

  return (
    <Link href={`/annonce/${annonce.id}`}>
      <Card className="active:scale-[0.99] transition-transform cursor-pointer">
        <CardBody className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <SportBadge sport={annonce.sport} />
            <StatusBadge status={annonce.status} />
          </div>

          {/* Titre */}
          <h3 className="font-syne font-bold text-text-primary leading-snug">
            {annonce.title}
          </h3>

          {/* Date + lieu */}
          <div className="flex items-center gap-3 text-text-secondary">
            <span className="flex items-center gap-1.5 font-dm text-sm">
              <CalendarIcon />
              {formatDate(annonce.date_time)} · {formatTime(annonce.date_time)}
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-dm text-sm text-text-secondary">
            <PinIcon />
            {annonce.location_name}
            <span className="text-text-secondary/50">·</span>
            {annonce.city}
          </span>

          {/* Stats outdoor */}
          {isOutdoor && (
            <div className="flex items-center gap-3 font-dm text-sm text-text-secondary">
              {annonce.distance_km && (
                <span className="flex items-center gap-1">
                  <RouteIcon />
                  {annonce.distance_km} km
                </span>
              )}
              {annonce.elevation_m && (
                <span className="flex items-center gap-1">
                  <MountainIcon />
                  {annonce.elevation_m} m D+
                </span>
              )}
              {annonce.pace && (
                <span className="flex items-center gap-1">
                  <SpeedIcon />
                  {annonce.pace}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-[#f0f5f1]">
            <div className="flex items-center gap-2">
              {annonce.level && <LevelBadge level={annonce.level} />}
              <span className="font-dm text-xs text-text-secondary">
                {spotsLeft > 0 ? (
                  <span className="text-green-alpine font-medium">
                    {spotsLeft} place{spotsLeft > 1 ? "s" : ""} dispo
                  </span>
                ) : (
                  <span className="text-orange-500 font-medium">Complet</span>
                )}
              </span>
            </div>
            {annonce.price_per_player > 0 ? (
              <span className="font-syne font-bold text-text-primary text-sm">
                {annonce.price_per_player}€
              </span>
            ) : (
              <span className="font-dm text-xs text-green-alpine bg-green-light px-2 py-0.5 rounded-pill">
                Gratuit
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
