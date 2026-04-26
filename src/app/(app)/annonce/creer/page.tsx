"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { SportBadge, LevelBadge, StatusBadge, SPORT_EMOJI, SPORT_LABEL } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { createAnnonce } from "@/lib/actions/annonces";
import type { Sport, SportType, Level } from "@/types/database";

// Mapping sport → type
const SPORT_TYPE: Record<Sport, SportType> = {
  soccer_five: "collectif",
  padel: "collectif",
  basket: "collectif",
  volley: "collectif",
  futsal: "collectif",
  badminton: "collectif",
  velo: "outdoor",
  trail: "outdoor",
};

const SPORTS = Object.keys(SPORT_TYPE) as Sport[];

const CITIES = ["Annecy", "Chambéry", "Aix-les-Bains", "Annemasse"];

const LEVELS: { value: Level; label: string }[] = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "confirme", label: "Confirmé" },
];

interface FormState {
  sport: Sport | "";
  title: string;
  description: string;
  date: string;
  time: string;
  location_name: string;
  city: string;
  total_spots: string;
  level: Level | "";
  price_per_player: string;
  distance_km: string;
  elevation_m: string;
  pace: string;
}

const EMPTY_FORM: FormState = {
  sport: "",
  title: "",
  description: "",
  date: "",
  time: "",
  location_name: "",
  city: "",
  total_spots: "",
  level: "",
  price_per_player: "0",
  distance_km: "",
  elevation_m: "",
  pace: "",
};

export default function CreerAnnoncePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isPending, startTransition] = useTransition();

  const sport = form.sport as Sport | "";
  const sportType = sport ? SPORT_TYPE[sport] : null;
  const isOutdoor = sportType === "outdoor";
  const isCollectif = sportType === "collectif";

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function selectSport(s: Sport) {
    const type = SPORT_TYPE[s];
    const defaultTitle = type === "collectif"
      ? `${SPORT_LABEL[s]} — il manque des joueurs`
      : `Sortie ${SPORT_LABEL[s]} — cherche compagnons`;
    setForm((f) => ({ ...f, sport: s, title: defaultTitle }));
    setStep(2);
  }

  function validateStep2() {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errs.title = "Titre requis";
    if (!form.date) errs.date = "Date requise";
    if (!form.time) errs.time = "Heure requise";
    if (!form.location_name.trim()) errs.location_name = isOutdoor ? "Point de départ requis" : "Terrain / salle requis";
    if (!form.city) errs.city = "Ville requise";
    if (!form.total_spots || parseInt(form.total_spots) < 2) errs.total_spots = "Minimum 2 participants";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2() || !sport) return;

    const dateTime = new Date(`${form.date}T${form.time}`).toISOString();

    startTransition(async () => {
      await createAnnonce({
        sport,
        sport_type: SPORT_TYPE[sport],
        title: form.title,
        description: form.description || undefined,
        date_time: dateTime,
        location_name: form.location_name,
        city: form.city,
        total_spots: parseInt(form.total_spots),
        level: (form.level as Level) || undefined,
        price_per_player: parseFloat(form.price_per_player) || 0,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : undefined,
        elevation_m: form.elevation_m ? parseInt(form.elevation_m) : undefined,
        pace: form.pace || undefined,
      });
    });
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* Header */}
      <header className="bg-surface px-4 pt-12 pb-4 border-b border-[#e0ebe2] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Retour"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h1 className="font-syne font-bold text-lg text-text-primary">
              {step === 1 ? "Quel sport ?" : step === 2 ? "Les détails" : "Aperçu"}
            </h1>
            <p className="font-dm text-text-secondary text-xs">
              Étape {step} / 3
            </p>
          </div>
          {/* Indicateur de progression */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={[
                  "h-1.5 rounded-full transition-all",
                  s <= step ? "bg-green-alpine w-5" : "bg-[#e0ebe2] w-2",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Étape 1 — Choix du sport */}
      {step === 1 && (
        <div className="px-4 py-6 space-y-4">
          <p className="font-dm text-text-secondary text-sm">
            Le formulaire s&apos;adapte automatiquement selon le sport choisi.
          </p>

          <div className="space-y-2">
            <p className="font-syne font-bold text-xs text-text-secondary uppercase tracking-wide">
              Sports collectifs
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.filter((s) => SPORT_TYPE[s] === "collectif").map((s) => (
                <button
                  key={s}
                  onClick={() => selectSport(s)}
                  className="flex items-center gap-2.5 bg-surface border border-[#d1e8d4] hover:border-green-alpine hover:bg-green-light rounded-card px-3 py-3 transition-colors text-left"
                >
                  <span className="text-2xl">{SPORT_EMOJI[s]}</span>
                  <span className="font-dm text-sm font-medium text-text-primary">
                    {SPORT_LABEL[s]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-syne font-bold text-xs text-text-secondary uppercase tracking-wide">
              Sports outdoor
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.filter((s) => SPORT_TYPE[s] === "outdoor").map((s) => (
                <button
                  key={s}
                  onClick={() => selectSport(s)}
                  className="flex items-center gap-2.5 bg-surface border border-[#d1e8d4] hover:border-green-alpine hover:bg-green-light rounded-card px-3 py-3 transition-colors text-left"
                >
                  <span className="text-2xl">{SPORT_EMOJI[s]}</span>
                  <span className="font-dm text-sm font-medium text-text-primary">
                    {SPORT_LABEL[s]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Étape 2 — Formulaire */}
      {step === 2 && sport && (
        <form onSubmit={(e) => { e.preventDefault(); if (validateStep2()) setStep(3); }} className="px-4 py-6 space-y-5">
          {/* Sport sélectionné */}
          <div className="flex items-center gap-2">
            <SportBadge sport={sport} />
            <span className="font-dm text-xs text-text-secondary">
              {isCollectif ? "Il manque des joueurs" : "Je cherche des compagnons"}
            </span>
          </div>

          <Input
            label="Titre de l'annonce"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            error={errors.title}
            placeholder={isCollectif ? "Ex : Soccer Five dimanche matin Annecy" : "Ex : Trail matinal autour du lac d'Annecy"}
          />

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              error={errors.date}
              min={new Date().toISOString().split("T")[0]}
            />
            <Input
              label="Heure"
              type="time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              error={errors.time}
            />
          </div>

          <Input
            label={isOutdoor ? "Point de départ" : "Terrain / salle"}
            value={form.location_name}
            onChange={(e) => set("location_name", e.target.value)}
            error={errors.location_name}
            placeholder={isOutdoor ? "Ex : Parking Plage d'Albigny" : "Ex : Complexe sportif La Forêt"}
          />

          <Select
            label="Ville"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            error={errors.city}
            options={[
              { value: "", label: "Choisir une ville" },
              ...CITIES.map((c) => ({ value: c, label: c })),
            ]}
          />

          {/* Champs outdoor */}
          {isOutdoor && (
            <div className="space-y-4 p-4 bg-green-light rounded-card">
              <p className="font-dm text-xs font-medium text-green-dark">Détails de la sortie</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Distance (km)"
                  type="number"
                  min="1"
                  max="500"
                  step="0.5"
                  value={form.distance_km}
                  onChange={(e) => set("distance_km", e.target.value)}
                  placeholder="Ex : 25"
                />
                <Input
                  label="D+ (mètres)"
                  type="number"
                  min="0"
                  step="50"
                  value={form.elevation_m}
                  onChange={(e) => set("elevation_m", e.target.value)}
                  placeholder="Ex : 800"
                />
              </div>
              <Input
                label={sport === "velo" ? "Allure (km/h moy.)" : "Allure (min/km)"}
                value={form.pace}
                onChange={(e) => set("pace", e.target.value)}
                placeholder={sport === "velo" ? "Ex : 28 km/h" : "Ex : 5min30/km"}
              />
            </div>
          )}

          {/* Participants */}
          <Input
            label={isCollectif ? "Nombre total de joueurs nécessaires" : "Nombre max de participants"}
            type="number"
            min={isCollectif ? "2" : "2"}
            max={isCollectif ? "20" : "30"}
            value={form.total_spots}
            onChange={(e) => set("total_spots", e.target.value)}
            error={errors.total_spots}
            hint={isCollectif ? "Toi inclus dans le compte" : "2 minimum, 30 maximum"}
          />

          {/* Niveau + Prix */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Niveau"
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              options={[
                { value: "", label: "Tous niveaux" },
                ...LEVELS.map((l) => ({ value: l.value, label: l.label })),
              ]}
            />
            <Input
              label="Prix / participant (€)"
              type="number"
              min="0"
              step="0.5"
              value={form.price_per_player}
              onChange={(e) => set("price_per_player", e.target.value)}
              hint="0 = gratuit"
            />
          </div>

          <Textarea
            label="Description (facultatif)"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={isCollectif
              ? "Niveau, terrain, équipement nécessaire…"
              : "Parcours, niveau attendu, ravitaillement…"}
          />

          <Button type="submit">Aperçu de l&apos;annonce →</Button>
        </form>
      )}

      {/* Étape 3 — Aperçu + confirmation */}
      {step === 3 && sport && (
        <div className="px-4 py-6 space-y-5">
          <p className="font-dm text-sm text-text-secondary">
            Vérifie ton annonce avant de la publier.
          </p>

          {/* Prévisualisation */}
          <AnnoncePreview form={form} sport={sport} isOutdoor={isOutdoor} />

          <div className="space-y-3">
            <Button onClick={handleSubmit} loading={isPending}>
              {isPending ? "Publication en cours…" : "Publier l'annonce"}
            </Button>
            <Button variant="ghost" onClick={() => setStep(2)} disabled={isPending}>
              ← Modifier
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnoncePreview({
  form,
  sport,
  isOutdoor,
}: {
  form: FormState;
  sport: Sport;
  isOutdoor: boolean;
}) {
  const dateLabel = form.date && form.time
    ? `${new Date(`${form.date}T${form.time}`).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long",
      })} · ${form.time}`
    : "Date à définir";

  const spotsLeft = form.total_spots ? parseInt(form.total_spots) - 1 : 0;

  return (
    <Card highlighted>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <SportBadge sport={sport} />
          <StatusBadge status="open" />
        </div>

        <h3 className="font-syne font-bold text-text-primary leading-snug">
          {form.title || "Titre de l'annonce"}
        </h3>

        <div className="space-y-1.5 font-dm text-sm text-text-secondary">
          <p className="flex items-center gap-1.5">
            <span>📅</span> {dateLabel}
          </p>
          {form.location_name && (
            <p className="flex items-center gap-1.5">
              <span>📍</span> {form.location_name}{form.city ? ` · ${form.city}` : ""}
            </p>
          )}
          {isOutdoor && (form.distance_km || form.elevation_m || form.pace) && (
            <p className="flex items-center gap-3">
              {form.distance_km && <span>🛣 {form.distance_km} km</span>}
              {form.elevation_m && <span>⛰ {form.elevation_m} m D+</span>}
              {form.pace && <span>⚡ {form.pace}</span>}
            </p>
          )}
        </div>

        {form.description && (
          <p className="font-dm text-sm text-text-secondary border-t border-[#f0f5f1] pt-2">
            {form.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[#f0f5f1]">
          <div className="flex items-center gap-2">
            {form.level && <LevelBadge level={form.level} />}
            {spotsLeft > 0 && (
              <span className="font-dm text-xs text-green-alpine font-medium">
                {spotsLeft} place{spotsLeft > 1 ? "s" : ""} dispo
              </span>
            )}
          </div>
          {parseFloat(form.price_per_player) > 0 ? (
            <span className="font-syne font-bold text-text-primary text-sm">
              {form.price_per_player}€
            </span>
          ) : (
            <span className="font-dm text-xs text-green-alpine bg-green-light px-2 py-0.5 rounded-pill">
              Gratuit
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
