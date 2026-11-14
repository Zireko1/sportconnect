"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPORT_EMOJI, SPORT_LABEL, LevelBadge } from "@/components/ui/Badge";
import { useUserLocation, type ProfileLocation } from "@/lib/hooks/useUserLocation";
import { getNearbySportifs, type NearbySportif } from "@/lib/actions/sportifs";
import type { Sport } from "@/types/database";

interface Props {
  profile: ProfileLocation | null;
  mySports: Sport[];
}

export function SportifsNearby({ profile, mySports }: Props) {
  const { location, status, ready, request } = useUserLocation(profile);
  const [sportifs, setSportifs] = useState<NearbySportif[] | null>(null);

  const lat = location?.lat;
  const lon = location?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    let cancelled = false;
    setSportifs(null);
    getNearbySportifs(lat, lon)
      .then((res) => !cancelled && setSportifs(res))
      .catch(() => !cancelled && setSportifs([]));
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (!ready) return <ListSkeleton />;

  // Aucune position connue (ni géoloc ni ville de profil)
  if (!location) {
    return (
      <div className="bg-surface rounded-card shadow-card p-6 text-center space-y-3">
        <div className="text-4xl">📍</div>
        <p className="font-syne font-bold text-text-primary">
          Activez la géolocalisation pour voir les sportifs près de chez vous
        </p>
        <p className="font-dm text-sm text-text-secondary">
          Ta position sert uniquement à calculer des distances approximatives. Elle reste sur ton
          appareil et n&apos;est jamais affichée aux autres.
        </p>
        <button
          type="button"
          onClick={request}
          disabled={status === "locating"}
          className="inline-block bg-green-alpine text-white font-dm font-medium text-sm px-5 py-2.5 rounded-card disabled:opacity-60"
        >
          {status === "locating" ? "Localisation…" : "📍 Activer la géolocalisation"}
        </button>
        {status === "denied" && (
          <p className="font-dm text-xs text-text-secondary">
            Géolocalisation refusée. Tu peux aussi{" "}
            <Link href="/profil" className="text-green-alpine underline">
              renseigner ta ville dans ton profil
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-dm text-xs text-green-dark bg-green-light px-2.5 py-1 rounded-pill">
          📍 Dans un rayon de 50 km autour de {location.label ?? "ta position"}
        </span>
        {location.source !== "gps" && (
          <button
            type="button"
            onClick={request}
            className="font-dm text-xs font-medium border border-green-alpine text-green-alpine hover:bg-green-light px-2.5 py-1 rounded-pill"
          >
            {status === "locating" ? "Localisation…" : "📍 Autour de moi"}
          </button>
        )}
      </div>

      {sportifs === null ? (
        <ListSkeleton />
      ) : sportifs.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card p-6 text-center space-y-3">
          <div className="text-4xl">🌱</div>
          <p className="font-syne font-bold text-text-primary">Pas encore de sportifs dans ton coin</p>
          <p className="font-dm text-sm text-text-secondary">
            Publie une annonce ou active les alertes : tu seras prévenu dès que quelqu&apos;un propose
            une activité près de chez toi.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link href="/annonce/creer" className="bg-green-alpine text-white font-dm font-medium text-sm px-4 py-2 rounded-card">
              Publier une annonce
            </Link>
            <Link href="/mes-alertes" className="border border-green-alpine text-green-alpine font-dm font-medium text-sm px-4 py-2 rounded-card">
              🔔 Activer les alertes
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sportifs.map((s) => (
            <SportifCard key={s.id} sportif={s} mySports={mySports} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SportifCard({ sportif, mySports }: { sportif: NearbySportif; mySports: Sport[] }) {
  // Sport proposé par défaut : un sport en commun, sinon son premier sport
  const proposedSport = sportif.sports.find((s) => mySports.includes(s)) ?? sportif.sports[0];
  const params = new URLSearchParams({ sport: proposedSport, avec: sportif.id, avecNom: sportif.firstName });

  return (
    <li className="bg-surface rounded-card shadow-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        {sportif.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sportif.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-green-light flex items-center justify-center font-syne font-bold text-green-dark">
            {sportif.firstName[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link href={`/profil/${sportif.id}`} className="font-syne font-bold text-text-primary hover:text-green-alpine">
            {sportif.firstName}
          </Link>
          <p className="font-dm text-xs text-text-secondary">
            {sportif.approxKm <= 1 ? "à moins de 2 km" : `à ~${sportif.approxKm} km`}
            {sportif.city ? ` · ${sportif.city}` : ""}
          </p>
        </div>
        {sportif.level && <LevelBadge level={sportif.level} />}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sportif.sports.map((s) => (
          <span
            key={s}
            className={[
              "font-dm text-xs px-2 py-0.5 rounded-pill",
              mySports.includes(s) ? "bg-green-light text-green-dark font-medium" : "bg-[#f0f5f1] text-text-secondary",
            ].join(" ")}
          >
            {SPORT_EMOJI[s] ?? "🏅"} {SPORT_LABEL[s] ?? s}
          </span>
        ))}
      </div>

      <Link
        href={`/annonce/creer?${params.toString()}`}
        className="block text-center bg-green-alpine hover:bg-green-dark text-white font-dm font-medium text-sm py-2 rounded-card transition-colors"
      >
        Proposer un match
      </Link>
    </li>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface rounded-card shadow-card p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-green-light" />
            <div className="h-4 w-24 bg-[#f0f5f1] rounded" />
          </div>
          <div className="h-5 w-2/3 bg-[#f0f5f1] rounded-pill" />
          <div className="h-8 bg-green-light rounded-card" />
        </div>
      ))}
    </div>
  );
}
