"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SPORT_EMOJI, SPORT_LABEL } from "@/components/ui/Badge";

const SPORTS = Object.keys(SPORT_LABEL) as (keyof typeof SPORT_LABEL)[];

const CITIES = ["Annecy", "Chambéry", "Aix-les-Bains", "Annemasse"];

export function AnnonceFilters() {
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

  return (
    <div className="space-y-3 px-4 py-3 bg-surface border-b border-[#e0ebe2]">
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
            onClick={() => setParam("sport", activeSport === sport ? "" : sport)}
          >
            {SPORT_EMOJI[sport]} {SPORT_LABEL[sport]}
          </FilterPill>
        ))}
      </div>

      {/* Filtre ville */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <FilterPill
          active={!activeCity}
          onClick={() => setParam("ville", "")}
          size="sm"
        >
          Toutes les villes
        </FilterPill>
        {CITIES.map((city) => (
          <FilterPill
            key={city}
            active={activeCity === city}
            onClick={() => setParam("ville", activeCity === city ? "" : city)}
            size="sm"
          >
            {city}
          </FilterPill>
        ))}
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
          ? "bg-green-alpine text-white"
          : "bg-green-light text-green-dark hover:bg-green-alpine/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
