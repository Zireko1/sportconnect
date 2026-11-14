import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnonceCard } from "@/components/annonces/AnnonceCard";
import type { FeedAnnonce } from "@/components/annonces/NearbyFeed";
import { createPublicClient } from "@/lib/supabase/public";
import { boundingBox } from "@/lib/geo";
import {
  SEO_SPORTS, SITE_URL, allSeoParams, getSeoCity, getSeoSport, nearbyCities,
  type SeoCity, type SeoSport,
} from "@/lib/seo-data";

// Pages générées au build (SSG), régénérées au plus une fois par heure (ISR).
export const revalidate = 3600;
// Seules les combinaisons listées existent : le reste renvoie une 404.
export const dynamicParams = false;

/** Rayon autour du centre-ville pris en compte pour les annonces et les sportifs */
const CITY_RADIUS_KM = 15;

type Params = { sport: string; ville: string };

export function generateStaticParams(): Params[] {
  return allSeoParams();
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const sport = getSeoSport(params.sport);
  const city = getSeoCity(params.ville);
  if (!sport || !city) return {};

  const title = `Trouver un partenaire de ${sport.name} ${city.a} | SportVoisin`;
  const description = `Cherche un partenaire de ${sport.name} ${city.a} (${city.region}) : annonces de matchs et sorties, sportifs inscrits près de chez toi. Gratuit, inscription en 1 minute.`;
  const url = `${SITE_URL}/${sport.slug}/${city.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "SportVoisin", locale: "fr_FR", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Filtre PostgREST : même nom de ville OU coordonnées dans la zone */
function cityFilter(city: SeoCity) {
  const b = boundingBox(city.lat, city.lon, CITY_RADIUS_KM);
  return `city.ilike.${city.name},and(latitude.gte.${b.minLat},latitude.lte.${b.maxLat},longitude.gte.${b.minLon},longitude.lte.${b.maxLon})`;
}

/** Filtre PostgREST sur le sport : sports en base + annonces « Autre sport » par mot-clé */
function sportFilter(sport: SeoSport) {
  const parts: string[] = [];
  if (sport.dbSports.length) parts.push(`sport.in.(${sport.dbSports.join(",")})`);
  if (sport.customKeyword) parts.push(`and(sport.eq.autre,sport_custom.ilike.*${sport.customKeyword}*)`);
  return parts.join(",");
}

async function getCityData(sport: SeoSport, city: SeoCity) {
  const supabase = createPublicClient();
  const [annoncesRes, sportifsRes] = await Promise.all([
    supabase
      .from("annonces")
      .select("*, users:public_profiles(name:first_name, avatar_url)")
      .or(sportFilter(sport))
      .in("status", ["open", "full"])
      .gte("date_time", new Date().toISOString())
      .or(cityFilter(city))
      .order("date_time", { ascending: true })
      .limit(6),
    // Les profils ne peuvent cocher que les sports en base
    sport.dbSports.length
      ? supabase.rpc("count_profiles_near", {
          p_lat: city.lat,
          p_lon: city.lon,
          p_radius_km: CITY_RADIUS_KM,
          p_city: city.name,
          p_sports: sport.dbSports,
        })
      : Promise.resolve({ data: 0 }),
  ]);

  return {
    annonces: (annoncesRes.data ?? []) as FeedAnnonce[],
    sportifs: typeof sportifsRes.data === "number" ? sportifsRes.data : 0,
  };
}

const STEPS = [
  { icon: "📝", title: "Inscris-toi gratuitement", text: "Indique ta ville, tes sports et ton niveau. Ça prend une minute." },
  { icon: "🔎", title: "Trouve ou publie une annonce", text: "Rejoins un match qui cherche des joueurs, ou publie le tien en précisant le lieu, l'heure et le niveau." },
  { icon: "🤝", title: "Retrouve-toi sur le terrain", text: "Échange avec les participants par messagerie, puis va jouer. Active les alertes pour ne rien rater." },
];

export default async function SeoSportCityPage({ params }: { params: Params }) {
  const sport = getSeoSport(params.sport);
  const city = getSeoCity(params.ville);
  if (!sport || !city) notFound();

  const { annonces, sportifs } = await getCityData(sport, city);
  const neighbors = nearbyCities(city, 5);
  const otherSports = SEO_SPORTS.filter((s) => s.slug !== sport.slug);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SportVoisin", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: sport.label, item: `${SITE_URL}/${sport.slug}/${city.slug}` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${SITE_URL}/${sport.slug}/${city.slug}` },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Hero */}
      <section className="space-y-4">
        <nav aria-label="Fil d'Ariane" className="font-dm text-xs text-text-secondary">
          <Link href="/" className="hover:text-green-alpine">Accueil</Link> › {sport.label} › {city.name}
        </nav>
        <h1 className="font-syne font-bold text-3xl sm:text-4xl text-text-primary leading-tight">
          Trouver un partenaire de {sport.name} {city.a}
        </h1>
        <p className="font-dm text-text-secondary max-w-2xl">
          {sport.pitch} SportVoisin met en relation les sportifs {city.a} et dans tout le secteur ({city.region}),
          autour du Léman et des Alpes.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/inscription" className="bg-green-alpine hover:bg-green-dark text-white font-dm font-medium px-5 py-3 rounded-card transition-colors">
            S&apos;inscrire gratuitement
          </Link>
          <Link href="/annonce/creer" className="border border-green-alpine text-green-alpine hover:bg-green-light font-dm font-medium px-5 py-3 rounded-card transition-colors">
            Créer une annonce
          </Link>
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="space-y-4">
        <h2 className="font-syne font-bold text-xl text-text-primary">
          Annonces de {sport.name} {city.a} et alentours
        </h2>
        {annonces.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {annonces.map((a) => <AnnonceCard key={a.id} annonce={a} />)}
          </div>
        ) : (
          <div className="bg-surface rounded-card shadow-card p-6 space-y-3">
            <p className="font-dm text-text-secondary">
              Aucune annonce de {sport.name} en cours {city.a} pour le moment. Sois le premier à en publier une :
              les sportifs du coin qui ont activé les alertes seront prévenus par email.
            </p>
            <Link href="/annonce/creer" className="inline-block font-dm font-medium text-green-alpine hover:text-green-dark">
              Publier une annonce →
            </Link>
          </div>
        )}
      </section>

      {/* Communauté */}
      <section className="bg-green-light rounded-card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="font-syne font-bold text-4xl text-green-alpine leading-none">{sportifs}</p>
        <p className="font-dm text-text-primary flex-1">
          {sportifs === 0
            ? `La communauté ${sport.name} ${city.a} démarre : inscris-toi et sois parmi les premiers !`
            : sportifs === 1
              ? `sportif inscrit ${city.a} et alentours pratique le ${sport.name}. Rejoins-le !`
              : `sportifs inscrits ${city.a} et alentours pratiquent le ${sport.name}. Rejoins-les !`}
        </p>
        <Link href="/inscription" className="bg-green-alpine hover:bg-green-dark text-white font-dm font-medium text-sm px-4 py-2.5 rounded-card text-center transition-colors">
          Rejoindre la communauté
        </Link>
      </section>

      {/* Comment ça marche */}
      <section className="space-y-4">
        <h2 className="font-syne font-bold text-xl text-text-primary">Comment ça marche ?</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-surface rounded-card shadow-card p-5 space-y-2">
              <span className="text-2xl" aria-hidden>{step.icon}</span>
              <p className="font-syne font-bold text-text-primary">{i + 1}. {step.title}</p>
              <p className="font-dm text-sm text-text-secondary">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA final */}
      <section className="bg-surface rounded-card shadow-card p-6 text-center space-y-3">
        <h2 className="font-syne font-bold text-xl text-text-primary">
          Prêt à jouer au {sport.name} {city.a} ?
        </h2>
        <p className="font-dm text-sm text-text-secondary">Gratuit, sans engagement, et tes alertes te préviennent dès qu&apos;un match est publié.</p>
        <div className="flex justify-center flex-wrap gap-3">
          <Link href="/inscription" className="bg-green-alpine hover:bg-green-dark text-white font-dm font-medium px-5 py-3 rounded-card transition-colors">
            S&apos;inscrire gratuitement
          </Link>
          <Link href="/annonce/creer" className="border border-green-alpine text-green-alpine hover:bg-green-light font-dm font-medium px-5 py-3 rounded-card transition-colors">
            Créer une annonce
          </Link>
        </div>
      </section>

      {/* Maillage interne */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="font-syne font-bold text-base text-text-primary">{sport.label} dans les villes voisines</h2>
          <ul className="space-y-1">
            {neighbors.map(({ city: c, km }) => (
              <li key={c.slug}>
                <Link href={`/${sport.slug}/${c.slug}`} className="font-dm text-sm text-green-alpine hover:text-green-dark">
                  Partenaire de {sport.name} {c.a}
                </Link>
                <span className="font-dm text-xs text-text-secondary"> · ~{km} km</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="font-syne font-bold text-base text-text-primary">Autres sports {city.a}</h2>
          <ul className="space-y-1">
            {otherSports.map((s) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}/${city.slug}`} className="font-dm text-sm text-green-alpine hover:text-green-dark">
                  Partenaire de {s.name} {city.a}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
