"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { updateProfile } from "@/lib/actions/profil";
import { PROFILE_SPORTS, PROFILE_LEVELS, SPORT_LABELS, SPORT_CUSTOM_MAX } from "@/lib/profile-options";
import type { Sport, Level } from "@/types/database";

export interface EditableProfile {
  name: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  sports: Sport[];
  sport_custom: string | null;
  level: Level | null;
}

export function EditProfilForm({ profile }: { profile: EditableProfile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.city ?? "");
  const [coords, setCoords] = useState({ lat: profile.latitude, lon: profile.longitude });
  const [sports, setSports] = useState<Sport[]>(profile.sports ?? []);
  const [sportCustom, setSportCustom] = useState(profile.sport_custom ?? "");
  const [level, setLevel] = useState<Level | null>(profile.level);

  function reset() {
    setName(profile.name);
    setCity(profile.city ?? "");
    setCoords({ lat: profile.latitude, lon: profile.longitude });
    setSports(profile.sports ?? []);
    setSportCustom(profile.sport_custom ?? "");
    setLevel(profile.level);
    setError(null);
  }

  function toggleSport(s: Sport) {
    setSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    startTransition(async () => {
      const res = await updateProfile({
        name,
        city: city || null,
        latitude: coords.lat,
        longitude: coords.lon,
        sports,
        sport_custom: sportCustom || null,
        level,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setSaved(true);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => { reset(); setSaved(false); setOpen(true); }}
          className="w-full font-dm text-sm font-medium text-green-alpine bg-surface border border-green-alpine/40 hover:bg-green-light rounded-card transition-colors py-3"
        >
          ✏️ Modifier mon profil
        </button>
        {saved && (
          <p className="font-dm text-xs text-green-alpine text-center">Profil mis à jour ✓</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card p-5 space-y-5">
      <h2 className="font-syne font-bold text-base text-text-primary">Modifier mon profil</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-card px-4 py-3">
          <p className="font-dm text-sm text-red-600">{error}</p>
        </div>
      )}

      <Input
        id="profil-name"
        label="Prénom et nom"
        value={name}
        maxLength={80}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <CityAutocomplete
        value={city}
        onChange={(c, lat, lon) => {
          setCity(c);
          setCoords({ lat: lat ?? null, lon: lon ?? null });
        }}
      />

      <fieldset className="space-y-2">
        <legend className="block text-sm font-dm font-medium text-text-primary mb-1.5">
          Sports pratiqués
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {PROFILE_SPORTS.map((s) => {
            const checked = sports.includes(s);
            return (
              <label
                key={s}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-card border cursor-pointer font-dm text-sm transition-colors",
                  checked
                    ? "bg-green-light border-green-alpine text-green-alpine font-medium"
                    : "border-[#d1e8d4] text-text-primary hover:bg-green-light/50",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSport(s)}
                  className="accent-green-alpine"
                />
                {SPORT_LABELS[s]}
              </label>
            );
          })}
        </div>
        <Input
          id="profil-sport-custom"
          label="Autre sport (facultatif)"
          placeholder="Ex. : escalade, tennis de table…"
          value={sportCustom}
          maxLength={SPORT_CUSTOM_MAX}
          onChange={(e) => setSportCustom(e.target.value)}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="block text-sm font-dm font-medium text-text-primary mb-1.5">Niveau</legend>
        <div className="grid grid-cols-3 gap-2">
          {PROFILE_LEVELS.map(({ value, label }) => {
            const checked = level === value;
            return (
              <label
                key={value}
                className={[
                  "flex items-center justify-center px-2 py-2 rounded-card border cursor-pointer font-dm text-sm text-center transition-colors",
                  checked
                    ? "bg-green-light border-green-alpine text-green-alpine font-medium"
                    : "border-[#d1e8d4] text-text-primary hover:bg-green-light/50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="level"
                  value={value}
                  checked={checked}
                  onChange={() => setLevel(value)}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => { reset(); setOpen(false); }}
          disabled={pending}
        >
          Annuler
        </Button>
        <Button type="submit" loading={pending}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
