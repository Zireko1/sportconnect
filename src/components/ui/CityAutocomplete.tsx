"use client";

import { useState, useEffect, useRef } from "react";

type Country = "FR" | "CH";

interface GeoSuggestion {
  key: string;
  city: string;
  /** Code postal (FR) ou canton (CH) */
  detail: string;
  lat: number;
  lon: number;
  country: Country;
}

const FLAGS: Record<Country, string> = { FR: "🇫🇷", CH: "🇨🇭" };

/** Communes françaises — API Adresse (IGN / data.gouv.fr) */
async function searchFrance(q: string, signal: AbortSignal): Promise<GeoSuggestion[]> {
  const res = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&type=municipality&limit=5`,
    { signal }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as {
    features?: Array<{
      properties: { id?: string; name: string; postcode: string };
      geometry: { coordinates: [number, number] };
    }>;
  };
  return (json.features ?? []).map((f) => ({
    key: `FR-${f.properties.id ?? `${f.properties.name}-${f.properties.postcode}`}`,
    city: f.properties.name,
    detail: f.properties.postcode,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    country: "FR" as const,
  }));
}

/**
 * Communes suisses — swisstopo SearchServer.
 * L'origine des communes est « gg25 » (« municipality » est refusé par l'API).
 * Le label contient du HTML : "<b>Genève (GE)</b>".
 */
async function searchSwitzerland(q: string, signal: AbortSignal): Promise<GeoSuggestion[]> {
  const res = await fetch(
    `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${encodeURIComponent(q)}&type=locations&origins=gg25&limit=5&sr=4326`,
    { signal }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as {
    results?: Array<{ attrs: { label: string; detail?: string; lat: number; lon: number; featureId?: string } }>;
  };
  // La recherche swisstopo est approximative (« annecy » → Yens, Ins…) :
  // on ne garde que les communes dont un mot commence par la saisie.
  const nq = normalize(q);
  const wordStart = new RegExp(`(^| )${nq.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  return (json.results ?? [])
    .filter(({ attrs }) => wordStart.test(normalize(attrs.detail ?? attrs.label.replace(/<[^>]*>/g, ""))))
    .map(({ attrs }) => {
    const label = attrs.label.replace(/<[^>]*>/g, "").trim(); // "Genève (GE)"
    const m = label.match(/^(.*?)\s*\(([A-Z]{2})\)$/);
    return {
      key: `CH-${attrs.featureId ?? label}`,
      city: m ? m[1] : label,
      detail: m ? m[2] : "",
      lat: attrs.lat,
      lon: attrs.lon,
      country: "CH" as const,
    };
  });
}

/** Minuscules, sans accents, tirets/apostrophes → espaces */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Correspondances exactes en tête (peu importe le pays), puis France, puis Suisse.
 * Dédoublonnage (ex. Genève / Genf = même commune).
 */
function mergeResults(q: string, fr: GeoSuggestion[], ch: GeoSuggestion[]): GeoSuggestion[] {
  const nq = normalize(q);
  const isExact = (s: GeoSuggestion) => normalize(s.city) === nq;
  const merged = dedupe(fr, ch);
  return [...merged.filter(isExact), ...merged.filter((s) => !isExact(s))];
}

function dedupe(fr: GeoSuggestion[], ch: GeoSuggestion[]): GeoSuggestion[] {
  const seen = new Set<string>();
  const out: GeoSuggestion[] = [];
  for (const s of [...fr, ...ch]) {
    const nameKey = `${s.country}|${s.city.toLowerCase()}|${s.detail}`;
    if (seen.has(s.key) || seen.has(nameKey)) continue;
    seen.add(s.key);
    seen.add(nameKey);
    out.push(s);
  }
  return out;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, lat?: number, lon?: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  label = "Ville",
  placeholder = "Ex : Annecy, Chambéry…",
  error,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync si la valeur change de l'extérieur (reset formulaire, etc.)
  useEffect(() => { setQuery(value); }, [value]);

  // Fermer le dropdown au clic en dehors
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    if (!val.trim()) {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
      setLoading(false);
      onChange("");
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < 2) return;
    timerRef.current = setTimeout(async () => {
      // Annule la recherche précédente pour éviter qu'une réponse lente écrase la plus récente
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      // En parallèle ; si une API échoue, on garde les résultats de l'autre
      const [fr, ch] = await Promise.allSettled([
        searchFrance(val, controller.signal),
        searchSwitzerland(val, controller.signal),
      ]);
      if (controller.signal.aborted) return;

      const list = mergeResults(
        val,
        fr.status === "fulfilled" ? fr.value : [],
        ch.status === "fulfilled" ? ch.value : []
      );
      setSuggestions(list);
      setOpen(list.length > 0);
      setLoading(false);
    }, 300);
  }

  function select(s: GeoSuggestion) {
    setQuery(s.city);
    onChange(s.city, s.lat, s.lon);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block font-dm text-xs font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          className={[
            "w-full bg-background border rounded-lg px-3 py-2.5 font-dm text-sm text-text-primary",
            "placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-green-alpine/30 focus:border-green-alpine transition-colors",
            error ? "border-red-400" : "border-[#e0ebe2]",
          ].join(" ")}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-green-alpine/30 border-t-green-alpine rounded-full animate-spin block" />
        )}
        {!loading && query && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleInput(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Effacer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {error && <p className="mt-1 font-dm text-xs text-red-500">{error}</p>}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-surface border border-[#e0ebe2] rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onMouseDown={() => select(s)}
                className="w-full text-left px-3 py-2.5 font-dm text-sm text-text-primary hover:bg-green-light transition-colors border-b border-[#f0f5f1] last:border-0"
              >
                <span className="mr-1.5 text-xs opacity-70" aria-label={s.country === "FR" ? "France" : "Suisse"}>
                  {FLAGS[s.country]}
                </span>
                <span className="font-medium">{s.city}</span>
                <span className="text-text-secondary ml-1.5 text-xs">{s.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
