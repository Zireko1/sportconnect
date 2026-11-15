import type { Sport, Level } from "@/types/database";

// Valeurs de sport_enum en base ("autre" n'existe que côté annonces)
export const PROFILE_SPORTS = [
  "soccer_five", "padel", "basket", "volley", "futsal",
  "badminton", "velo", "trail", "randonnee",
] as const satisfies readonly Sport[];

export const SPORT_LABELS: Record<(typeof PROFILE_SPORTS)[number], string> = {
  soccer_five: "Football 5",
  padel: "Padel",
  basket: "Basket",
  volley: "Volley",
  futsal: "Futsal",
  badminton: "Badminton",
  velo: "Vélo",
  trail: "Trail",
  randonnee: "Randonnée",
};

/** Sport libre (« Autre sport ») : espaces normalisés, 40 caractères max, null si vide. */
export const SPORT_CUSTOM_MAX = 40;
export function normalizeSportCustom(value: string | null | undefined): string | null {
  const v = (value ?? "").replace(/\s+/g, " ").trim().slice(0, SPORT_CUSTOM_MAX);
  return v || null;
}

// "confirme" en base, affiché « Avancé » dans le formulaire
export const PROFILE_LEVELS: { value: Level; label: string }[] = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "confirme", label: "Avancé" },
];
