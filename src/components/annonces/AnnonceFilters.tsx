"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SPORT_EMOJI, SPORT_LABEL } from "@/components/ui/Badge";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";

const SPORTS = Object.keys(SPORT_LABEL) as (keyof typeof SPORT_LABEL)[];

interface AnnonceFiltersProps {
  variant?: "default" | "sidebar";
}

export function AnnonceFilters({ variant = "default" }: AnnonceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSport = searchParams.get("sport") ?? "";
  const activeCity = searchParams.get("ville") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  if (variant === "sidebar") {
    return (
      <div className="space-y-5">
        {/* Sport */}
        <div>
          <p className="font-dm text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
            Sport
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={!activeSport}
              onClick={() => setParam("sport", "")}
              size="sm"
            >
              Tous
            </FilterPill>
            {SPORTS.map((sport) => (
              <FilterPill
                key={sport}
                active={activeSport === sport}
                onClick={() =>
                  setParam("sport", activeSport === sport ? "" : sport)
                }
                size="sm"
              >
                {SPORT_EMOJI[sport]} {SPORT_LABEL[sport]}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Ville */}
        <div>
          <p className="font-dm text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
            Ville
          </p>
          <CityAutocomplete
            label=""
            value={activeCity}
            onChange={(city) => setParam("ville", city)}
            placeholder="Rechercher une ville…"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-3 bg-surface border-b border-[#dce6f0]">
      {/* Filtre sport — scroll horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <FilterPill
          active={!activeSport}
          onClick={() => setParam("sport", "")}
        >
          Tous
        </FilterPill>
        {SPORTS.map((sport) => (
          <FilterPill
            key={sport}
            active={activeSport === sport}
            onClick={() =>
              setParam("sport", activeSport === sport ? "" : sport)
            }
          >
            {SPORT_EMOJI[sport]} {SPORT_LABEL[sport]}
          </FilterPill>
        ))}
      </div>

      {/* Filtre ville */}
      <div className="px-1">
        <CityAutocomplete
          label=""
          value={activeCity}
          onChange={(city) => setParam("ville", city)}
          placeholder="Filtrer par ville…"
        />
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-shrink-0 rounded-pill font-dm transition-colors whitespace-nowrap",
        size === "sm" ? "px-3 py-1 text-xs" : "px-3 py-1.5 text-sm",
        active
          ? "bg-navy text-white"
          : "bg-navy-light text-navy-dark hover:bg-navy/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
