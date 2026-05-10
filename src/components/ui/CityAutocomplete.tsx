"use client";

import { useState, useEffect, useRef } from "react";

interface GeoSuggestion {
  label: string;
  city: string;
  postcode: string;
  lat: number;
  lon: number;
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
      onChange("");
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < 2) return;
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&type=municipality&limit=5`
        );
        const json = await res.json() as {
          features: Array<{
            properties: { label: string; name: string; postcode: string };
            geometry: { coordinates: [number, number] };
          }>;
        };
        const list: GeoSuggestion[] = (json.features ?? []).map((f) => ({
          label: f.properties.label,
          city: f.properties.name,
          postcode: f.properties.postcode,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        }));
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
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
            "placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors",
            error ? "border-red-400" : "border-[#dce6f0]",
          ].join(" ")}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-navy/30 border-t-navy rounded-full animate-spin block" />
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
        <ul className="absolute z-50 mt-1 w-full bg-surface border border-[#dce6f0] rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => select(s)}
                className="w-full text-left px-3 py-2.5 font-dm text-sm text-text-primary hover:bg-navy-light transition-colors border-b border-[#f0f5fb] last:border-0"
              >
                <span className="font-medium">{s.city}</span>
                <span className="text-text-secondary ml-1.5 text-xs">{s.postcode}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
