"use client";

import { useState, useTransition, useMemo } from "react";
import { SPORT_EMOJI, SPORT_LABEL } from "@/components/ui/Badge";
import { saveAlertConfig, sendTestEmail, type AlertConfigData } from "@/lib/actions/alertes";
import type { Sport, AlertFrequency, Level } from "@/types/database";

const ALL_SPORTS = Object.keys(SPORT_LABEL) as Sport[];

const DAYS = [
  { index: 1, short: "L", full: "Lundi" },
  { index: 2, short: "M", full: "Mardi" },
  { index: 3, short: "M", full: "Mercredi" },
  { index: 4, short: "J", full: "Jeudi" },
  { index: 5, short: "V", full: "Vendredi" },
  { index: 6, short: "S", full: "Samedi" },
  { index: 0, short: "D", full: "Dimanche" },
];

const TIME_SLOTS = [
  { value: "matin",      label: "Matin",        sub: "7h – 12h",   icon: "🌅" },
  { value: "apres-midi", label: "Après-midi",   sub: "12h – 18h",  icon: "☀️" },
  { value: "soiree",     label: "Soirée",       sub: "18h – 22h",  icon: "🌆" },
  { value: "tous",       label: "Peu importe",  sub: "Toute la journée", icon: "⏰" },
];

const LEVELS: { value: Level | "tous"; label: string }[] = [
  { value: "debutant",      label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "confirme",      label: "Confirmé" },
  { value: "tous",          label: "Tous niveaux" },
];

const FREQUENCIES: { value: AlertFrequency; label: string; sub: string; badge?: string }[] = [
  { value: "realtime", label: "Temps réel",       sub: "Dès qu'une annonce correspond" },
  { value: "daily",    label: "Récap quotidien",  sub: "Un email par jour avec toutes les annonces", badge: "Recommandé" },
  { value: "weekly",   label: "Récap hebdo",      sub: "Un résumé chaque lundi matin" },
];

const DEFAULT_CONFIG: AlertConfigData = {
  active: true,
  sports: ["soccer_five", "trail"] as Sport[],
  radius_km: 30,
  days_of_week: [1, 2, 3, 4, 5, 6, 0],
  time_slots: ["matin", "apres-midi", "soiree"],
  level: "tous",
  frequency: "daily",
};

function estimateWeekly(cfg: AlertConfigData): number {
  if (!cfg.active || cfg.sports.length === 0 || cfg.days_of_week.length === 0) return 0;
  const slotFactor = cfg.time_slots.includes("tous") ? 1 : cfg.time_slots.length / 3;
  const radiusFactor = Math.min(cfg.radius_km / 30, 3.5);
  return Math.max(1, Math.round(
    cfg.sports.length * 2 * (cfg.days_of_week.length / 7) * slotFactor * radiusFactor
  ));
}

export function AlertesForm({ defaultConfig }: { defaultConfig: AlertConfigData | null }) {
  const [cfg, setCfg] = useState<AlertConfigData>(defaultConfig ?? DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const estimate = useMemo(() => estimateWeekly(cfg), [cfg]);

  function set<K extends keyof AlertConfigData>(key: K, value: AlertConfigData[K]) {
    setCfg((c) => ({ ...c, [key]: value }));
    setSaved(false);
  }

  function toggleSport(sport: Sport) {
    set("sports", cfg.sports.includes(sport)
      ? cfg.sports.filter((s) => s !== sport)
      : [...cfg.sports, sport]
    );
  }

  function toggleDay(index: number) {
    set("days_of_week", cfg.days_of_week.includes(index)
      ? cfg.days_of_week.filter((d) => d !== index)
      : [...cfg.days_of_week, index]
    );
  }

  function toggleSlot(value: string) {
    if (value === "tous") {
      set("time_slots", ["tous"]);
      return;
    }
    const without = cfg.time_slots.filter((s) => s !== "tous");
    set("time_slots", without.includes(value)
      ? without.filter((s) => s !== value)
      : [...without, value]
    );
  }

  function handleSave() {
    startTransition(async () => {
      await saveAlertConfig(cfg);
      setSaved(true);
    });
  }

  function handleTest() {
    startTransition(async () => {
      const { email } = await sendTestEmail();
      setTestSent(email);
      setTimeout(() => setTestSent(null), 4000);
    });
  }

  // ── Active summary tags ──
  const summaryTags: string[] = [];
  if (cfg.sports.length > 0) {
    summaryTags.push(cfg.sports.map((s) => `${SPORT_EMOJI[s]} ${SPORT_LABEL[s]}`).join(", "));
  }
  summaryTags.push(`📍 ${cfg.radius_km} km`);
  if (cfg.days_of_week.length < 7) {
    const dayLabels = DAYS.filter((d) => cfg.days_of_week.includes(d.index)).map((d) => d.full);
    summaryTags.push(`📅 ${dayLabels.join(", ")}`);
  } else {
    summaryTags.push("📅 Tous les jours");
  }
  if (!cfg.time_slots.includes("tous")) {
    summaryTags.push(`🕐 ${cfg.time_slots.map((s) => TIME_SLOTS.find((t) => t.value === s)?.label).join(", ")}`);
  }
  if (cfg.level !== "tous") {
    summaryTags.push(`🎯 ${LEVELS.find((l) => l.value === cfg.level)?.label}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 lg:pb-10">

      {/* ── Page header ── */}
      <div className="mb-6">
        <p className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-1">SportVoisin</p>
        <h1 className="font-syne text-2xl font-bold text-text-primary mb-1">Mes alertes email</h1>
        <p className="font-dm text-sm text-text-secondary">
          Reçois un email dès qu&apos;une annonce correspond à tes critères près de chez toi.
        </p>
      </div>

      {/* ── Desktop 2-col / mobile 1-col ── */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 space-y-4 lg:space-y-0">

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-4">

          {/* Master toggle */}
          <div className="bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d9e4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-dm font-medium text-sm text-text-primary">Alertes email activées</p>
                <p className="font-dm text-xs text-text-secondary">
                  {cfg.active ? "Tu reçois des alertes selon tes critères" : "Toutes tes alertes sont en pause"}
                </p>
              </div>
              <button
                onClick={() => set("active", !cfg.active)}
                className={[
                  "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                  cfg.active ? "bg-green-alpine" : "bg-[#d1d5db]",
                ].join(" ")}
                aria-label="Toggle alertes"
              >
                <span className={[
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  cfg.active ? "translate-x-5" : "translate-x-0.5",
                ].join(" ")} />
              </button>
            </div>
          </div>

          {/* Sports */}
          <div className={["bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card", !cfg.active ? "opacity-50 pointer-events-none" : ""].join(" ")}>
            <SectionTitle>Sports à surveiller</SectionTitle>
            <p className="font-dm text-xs text-text-secondary mb-3">
              {cfg.sports.length === 0 ? "Sélectionne au moins un sport" : `${cfg.sports.length} sport${cfg.sports.length > 1 ? "s" : ""} sélectionné${cfg.sports.length > 1 ? "s" : ""}`}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ALL_SPORTS.map((sport) => {
                const on = cfg.sports.includes(sport);
                return (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={[
                      "relative flex flex-col items-center gap-1 py-3 px-1 rounded-card border transition-all text-center",
                      on
                        ? "bg-green-light border-green-alpine shadow-sm"
                        : "bg-background border-[#e0ebe2] hover:border-green-alpine/40",
                    ].join(" ")}
                  >
                    {on && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-alpine rounded-full flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                    <span className="text-xl">{SPORT_EMOJI[sport]}</span>
                    <span className={["font-dm text-[11px] leading-tight", on ? "text-green-dark font-medium" : "text-text-secondary"].join(" ")}>
                      {SPORT_LABEL[sport]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radius */}
          <div className={["bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card", !cfg.active ? "opacity-50 pointer-events-none" : ""].join(" ")}>
            <div className="flex items-baseline justify-between mb-3">
              <SectionTitle>Rayon géographique</SectionTitle>
              <span className="font-syne font-bold text-xl text-green-alpine">{cfg.radius_km} <span className="text-sm font-dm font-normal text-text-secondary">km</span></span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={cfg.radius_km}
              onChange={(e) => set("radius_km", parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                bg-[#e0ebe2]
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-green-alpine
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-green-alpine
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white"
              style={{
                background: `linear-gradient(to right, #2d9e4e ${((cfg.radius_km - 5) / 95) * 100}%, #e0ebe2 ${((cfg.radius_km - 5) / 95) * 100}%)`
              }}
            />
            <div className="flex justify-between mt-1.5">
              {[5, 25, 50, 75, 100].map((v) => (
                <span key={v} className="font-dm text-[10px] text-text-secondary">{v} km</span>
              ))}
            </div>
          </div>

        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="space-y-4">

          {/* Jours */}
          <div className={["bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card", !cfg.active ? "opacity-50 pointer-events-none" : ""].join(" ")}>
            <SectionTitle>Jours disponibles</SectionTitle>
            <div className="flex gap-1.5 mt-3">
              {DAYS.map((day) => {
                const on = cfg.days_of_week.includes(day.index);
                return (
                  <button
                    key={day.index}
                    onClick={() => toggleDay(day.index)}
                    title={day.full}
                    className={[
                      "flex-1 py-2 rounded-lg font-dm text-xs font-medium transition-all",
                      on
                        ? "bg-green-alpine text-white shadow-sm"
                        : "bg-background border border-[#e0ebe2] text-text-secondary hover:border-green-alpine/40",
                    ].join(" ")}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
            <p className="font-dm text-xs text-text-secondary mt-2">
              {cfg.days_of_week.length === 7
                ? "Tous les jours"
                : `${cfg.days_of_week.length} jour${cfg.days_of_week.length > 1 ? "s" : ""} sélectionné${cfg.days_of_week.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Créneaux */}
          <div className={["bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card", !cfg.active ? "opacity-50 pointer-events-none" : ""].join(" ")}>
            <SectionTitle>Créneaux horaires</SectionTitle>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {TIME_SLOTS.map((slot) => {
                const on = cfg.time_slots.includes(slot.value);
                return (
                  <button
                    key={slot.value}
                    onClick={() => toggleSlot(slot.value)}
                    className={[
                      "flex items-center gap-2 p-3 rounded-card border text-left transition-all",
                      on
                        ? "bg-green-light border-green-alpine"
                        : "bg-background border-[#e0ebe2] hover:border-green-alpine/40",
                    ].join(" ")}
                  >
                    <span className="text-base flex-shrink-0">{slot.icon}</span>
                    <div>
                      <p className={["font-dm text-xs font-medium", on ? "text-green-dark" : "text-text-primary"].join(" ")}>{slot.label}</p>
                      <p className="font-dm text-[10px] text-text-secondary">{slot.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Niveau */}
          <div className={["bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card", !cfg.active ? "opacity-50 pointer-events-none" : ""].join(" ")}>
            <SectionTitle>Niveau recherché</SectionTitle>
            <div className="flex flex-wrap gap-2 mt-3">
              {LEVELS.map((lvl) => {
                const on = cfg.level === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    onClick={() => set("level", lvl.value)}
                    className={[
                      "px-3 py-1.5 rounded-pill border font-dm text-xs font-medium transition-all",
                      on
                        ? "bg-green-alpine text-white border-green-alpine"
                        : "bg-background border-[#e0ebe2] text-text-secondary hover:border-green-alpine/40",
                    ].join(" ")}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fréquence */}
          <div className={["bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card", !cfg.active ? "opacity-50 pointer-events-none" : ""].join(" ")}>
            <SectionTitle>Fréquence des emails</SectionTitle>
            <div className="flex flex-col gap-2 mt-3">
              {FREQUENCIES.map((freq) => {
                const on = cfg.frequency === freq.value;
                return (
                  <button
                    key={freq.value}
                    onClick={() => set("frequency", freq.value)}
                    className={[
                      "flex items-center gap-3 p-3 rounded-card border text-left transition-all",
                      on
                        ? "bg-green-light border-green-alpine"
                        : "bg-background border-[#e0ebe2] hover:border-green-alpine/40",
                    ].join(" ")}
                  >
                    {/* Radio dot */}
                    <span className={[
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                      on ? "border-green-alpine" : "border-[#ccc]",
                    ].join(" ")}>
                      {on && <span className="w-2 h-2 rounded-full bg-green-alpine" />}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={["font-dm text-sm font-medium", on ? "text-green-dark" : "text-text-primary"].join(" ")}>
                          {freq.label}
                        </p>
                        {freq.badge && (
                          <span className="font-dm text-[10px] font-semibold bg-green-alpine text-white px-2 py-0.5 rounded-full">
                            {freq.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-dm text-xs text-text-secondary">{freq.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résumé + estimation + boutons */}
          <div className="bg-surface rounded-card border border-[#e0ebe2] p-4 shadow-card">

            {/* Estimation */}
            <div className="flex items-center gap-3 mb-4 bg-green-light rounded-xl p-3 border border-[#c8e8d0]">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#d8edd8] flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d9e4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.95 3.39 2 2 0 0 1 3.94 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <p className="font-dm text-xs text-text-secondary">Estimation alertes / semaine</p>
                <p className="font-syne font-bold text-xl text-green-alpine leading-tight">
                  {cfg.active && cfg.sports.length > 0 ? `~${estimate}` : "0"}
                  <span className="font-dm text-sm font-normal text-text-secondary ml-1">alertes</span>
                </p>
              </div>
            </div>

            {/* Résumé critères */}
            <p className="font-dm text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Critères actifs</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {cfg.active && summaryTags.length > 0 ? summaryTags.map((tag, i) => (
                <span key={i} className="font-dm text-[11px] bg-background border border-[#e0ebe2] text-text-secondary rounded-full px-2.5 py-1">
                  {tag}
                </span>
              )) : (
                <span className="font-dm text-xs text-text-secondary italic">Alertes désactivées</span>
              )}
            </div>

            {/* Feedback sauvegarde */}
            {saved && (
              <div className="flex items-center gap-2 text-green-alpine font-dm text-sm mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Alertes enregistrées
              </div>
            )}
            {testSent && (
              <div className="flex items-center gap-2 text-green-alpine font-dm text-sm mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Email de test envoyé à {testSent}
              </div>
            )}

            {/* Boutons */}
            <button
              onClick={handleSave}
              disabled={isPending || cfg.sports.length === 0}
              className="w-full bg-green-alpine text-white font-syne font-bold text-sm py-3 rounded-pill mb-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-dark transition-colors"
            >
              {isPending ? "Enregistrement…" : "Enregistrer mes alertes"}
            </button>
            <button
              onClick={handleTest}
              disabled={isPending || !cfg.active}
              className="w-full bg-transparent border border-[#e0ebe2] text-text-secondary font-dm text-sm py-2.5 rounded-pill disabled:opacity-40 disabled:cursor-not-allowed hover:border-green-alpine/40 hover:text-text-primary transition-colors"
            >
              M&apos;envoyer un mail de test
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-syne font-bold text-sm text-text-primary">{children}</p>
  );
}
