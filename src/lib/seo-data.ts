import { haversineKm } from "./geo";
import type { Sport } from "@/types/database";

export const SITE_URL = "https://sportvoisin.fr";

export interface SeoSport {
  slug: string;
  /** Nom affiché (minuscule, s'insère dans une phrase : « partenaire de padel ») */
  name: string;
  /** Nom avec majuscule pour les titres courts */
  label: string;
  /** Sports correspondants en base (vide = pas encore proposé dans l'app) */
  dbSports: Sport[];
  /** Mot-clé recherché dans les annonces « Autre sport » (sport_custom) */
  customKeyword?: string;
  pitch: string;
}

export const SEO_SPORTS: SeoSport[] = [
  {
    slug: "padel", name: "padel", label: "Padel", dbSports: ["padel"],
    pitch: "Le padel se joue à 4 : il manque presque toujours un joueur. Trouve le partenaire qui complète ta partie, à ton niveau.",
  },
  {
    slug: "football", name: "football", label: "Football", dbSports: ["soccer_five", "futsal"],
    pitch: "Five, futsal ou foot à 7 : complète ton équipe en quelques minutes ou rejoins un match qui cherche des joueurs.",
  },
  {
    slug: "tennis", name: "tennis", label: "Tennis", dbSports: [], customKeyword: "tennis",
    pitch: "Simple ou double, trouve un partenaire de tennis de ton niveau pour taper la balle près de chez toi.",
  },
  {
    slug: "running", name: "running", label: "Running", dbSports: ["trail"], customKeyword: "running",
    pitch: "Footing, fractionné ou trail en montagne : cours à plusieurs, à ton allure, sur les plus beaux parcours du coin.",
  },
  {
    slug: "basketball", name: "basket", label: "Basket", dbSports: ["basket"],
    pitch: "3x3 sur le playground ou 5x5 en salle : trouve des joueurs de basket pour monter une équipe.",
  },
  {
    slug: "volleyball", name: "volley", label: "Volley", dbSports: ["volley"],
    pitch: "Beach-volley au bord du lac ou volley en salle : il manque souvent quelques joueurs pour faire une belle partie.",
  },
  {
    slug: "badminton", name: "badminton", label: "Badminton", dbSports: ["badminton"],
    pitch: "En simple ou en double, trouve un partenaire de badminton pour réserver un terrain et jouer régulièrement.",
  },
];

export interface SeoCity {
  slug: string;
  name: string;
  /** « à Annecy », « à Genève » */
  a: string;
  country: "FR" | "CH";
  region: string;
  lat: number;
  lon: number;
}

export const SEO_CITIES: SeoCity[] = [
  { slug: "annecy", name: "Annecy", a: "à Annecy", country: "FR", region: "Haute-Savoie", lat: 45.8992, lon: 6.1294 },
  { slug: "geneve", name: "Genève", a: "à Genève", country: "CH", region: "canton de Genève", lat: 46.2044, lon: 6.1432 },
  { slug: "lausanne", name: "Lausanne", a: "à Lausanne", country: "CH", region: "canton de Vaud", lat: 46.5197, lon: 6.6323 },
  { slug: "thonon-les-bains", name: "Thonon-les-Bains", a: "à Thonon-les-Bains", country: "FR", region: "Chablais", lat: 46.3705, lon: 6.4794 },
  { slug: "chambery", name: "Chambéry", a: "à Chambéry", country: "FR", region: "Savoie", lat: 45.5646, lon: 5.9178 },
  { slug: "evian-les-bains", name: "Évian-les-Bains", a: "à Évian-les-Bains", country: "FR", region: "Chablais", lat: 46.4009, lon: 6.5897 },
  { slug: "albertville", name: "Albertville", a: "à Albertville", country: "FR", region: "Savoie", lat: 45.6755, lon: 6.3925 },
  { slug: "cluses", name: "Cluses", a: "à Cluses", country: "FR", region: "vallée de l'Arve", lat: 46.0603, lon: 6.5795 },
  { slug: "bonneville", name: "Bonneville", a: "à Bonneville", country: "FR", region: "vallée de l'Arve", lat: 46.078, lon: 6.4009 },
  { slug: "nyon", name: "Nyon", a: "à Nyon", country: "CH", region: "canton de Vaud", lat: 46.3833, lon: 6.2396 },
  { slug: "morges", name: "Morges", a: "à Morges", country: "CH", region: "canton de Vaud", lat: 46.5113, lon: 6.4985 },
  { slug: "rolle", name: "Rolle", a: "à Rolle", country: "CH", region: "canton de Vaud", lat: 46.4586, lon: 6.3397 },
  { slug: "gland", name: "Gland", a: "à Gland", country: "CH", region: "canton de Vaud", lat: 46.4208, lon: 6.27 },
  { slug: "divonne-les-bains", name: "Divonne-les-Bains", a: "à Divonne-les-Bains", country: "FR", region: "Pays de Gex", lat: 46.357, lon: 6.1386 },
];

export function getSeoSport(slug: string) {
  return SEO_SPORTS.find((s) => s.slug === slug);
}

export function getSeoCity(slug: string) {
  return SEO_CITIES.find((c) => c.slug === slug);
}

/** Villes de la liste les plus proches (hors la ville elle-même) */
export function nearbyCities(city: SeoCity, count = 5) {
  return SEO_CITIES.filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, km: Math.round(haversineKm(city.lat, city.lon, c.lat, c.lon)) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}

export function allSeoParams() {
  return SEO_SPORTS.flatMap((s) => SEO_CITIES.map((c) => ({ sport: s.slug, ville: c.slug })));
}
