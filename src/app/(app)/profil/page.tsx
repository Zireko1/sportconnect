import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database, Sport, Level } from "@/types/database";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type AnnonceRow = Database["public"]["Tables"]["annonces"]["Row"];

export const metadata = {
  title: "Mon profil — SportVoisin",
};

const SPORT_LABELS: Record<Sport, string> = {
  soccer_five: "Football 5",
  padel: "Padel",
  basket: "Basket",
  volley: "Volley",
  futsal: "Futsal",
  badminton: "Badminton",
  velo: "Vélo",
  trail: "Trail",
  randonnee: "Randonnée",
  autre: "Autre",
};

const LEVEL_LABELS: Record<Level, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  confirme: "Confirmé",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Ouverte",
  full: "Complète",
  cancelled: "Annulée",
  completed: "Terminée",
};

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [{ data: profile }, { data: annonces }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("annonces")
      .select("id, title, sport, date_time, city, status, total_spots, filled_spots")
      .eq("organizer_id", user.id)
      .order("date_time", { ascending: false })
      .limit(20),
  ]);

  const p = profile as UserRow | null;
  const myAnnonces = (annonces ?? []) as Pick<
    AnnonceRow,
    "id" | "title" | "sport" | "date_time" | "city" | "status" | "total_spots" | "filled_spots"
  >[];

  const initials = p?.name
    ? p.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header profil */}
      <div className="bg-surface rounded-card shadow-card p-6 flex items-center gap-5">
        {p?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.avatar_url}
            alt={p.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-green-light flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-green-alpine flex items-center justify-center flex-shrink-0">
            <span className="font-syne font-bold text-white text-xl">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-syne font-bold text-2xl text-text-primary truncate">
            {p?.name ?? "—"}
          </h1>
          <p className="font-dm text-sm text-text-secondary truncate">{user.email}</p>
          {p?.city && (
            <p className="font-dm text-sm text-text-secondary mt-0.5">📍 {p.city}</p>
          )}
        </div>
      </div>

      {/* Sports favoris */}
      <div className="bg-surface rounded-card shadow-card p-5">
        <h2 className="font-syne font-bold text-base text-text-primary mb-3">Sports pratiqués</h2>
        {p?.sports && p.sports.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {p.sports.map((sport) => (
              <span
                key={sport}
                className="font-dm text-sm bg-green-light text-green-alpine font-medium px-3 py-1 rounded-full"
              >
                {SPORT_LABELS[sport] ?? sport}
              </span>
            ))}
          </div>
        ) : (
          <p className="font-dm text-sm text-text-secondary">Aucun sport renseigné.</p>
        )}
        {p?.level && (
          <p className="font-dm text-sm text-text-secondary mt-3">
            Niveau :{" "}
            <span className="text-text-primary font-medium">{LEVEL_LABELS[p.level]}</span>
          </p>
        )}
      </div>

      {/* Annonces créées */}
      <div className="bg-surface rounded-card shadow-card p-5">
        <h2 className="font-syne font-bold text-base text-text-primary mb-3">
          Mes annonces{" "}
          {myAnnonces.length > 0 && (
            <span className="font-dm text-sm font-normal text-text-secondary">
              ({myAnnonces.length})
            </span>
          )}
        </h2>

        {myAnnonces.length === 0 ? (
          <div className="text-center py-6">
            <p className="font-dm text-sm text-text-secondary mb-3">
              Vous n&apos;avez pas encore créé d&apos;annonce.
            </p>
            <Link
              href="/annonce/creer"
              className="font-dm text-sm font-medium bg-green-alpine text-white px-4 py-2 rounded-pill hover:bg-green-dark transition-colors"
            >
              + Publier une annonce
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myAnnonces.map((annonce) => {
              const date = new Date(annonce.date_time);
              const isOpen = annonce.status === "open";
              return (
                <Link
                  key={annonce.id}
                  href={`/annonce/${annonce.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-green-light transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-dm text-sm font-medium text-text-primary truncate">
                      {annonce.title}
                    </p>
                    <p className="font-dm text-xs text-text-secondary mt-0.5">
                      {date.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {annonce.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-dm text-xs text-text-secondary">
                      {annonce.filled_spots}/{annonce.total_spots}
                    </span>
                    <span
                      className={`font-dm text-xs font-medium px-2 py-0.5 rounded-full ${
                        isOpen
                          ? "bg-green-light text-green-alpine"
                          : "bg-[#f3f3f3] text-text-secondary"
                      }`}
                    >
                      {STATUS_LABELS[annonce.status] ?? annonce.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Déconnexion */}
      <DeconnexionButton />
    </div>
  );
}

function DeconnexionButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="w-full font-dm text-sm text-text-secondary hover:text-red-500 transition-colors py-3 text-center"
      >
        Se déconnecter
      </button>
    </form>
  );
}
