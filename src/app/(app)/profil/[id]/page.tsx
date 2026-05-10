import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/ui/StarRating";
import { submitAvisJoueur } from "@/lib/actions/avis";
import type { Database, Sport, Level } from "@/types/database";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilJoueurPage({ params }: PageProps) {
  const { id: playerId } = await params;
  const supabase = await createClient();

  const [{ data: playerData }, { data: { user } }] = await Promise.all([
    supabase.from("users").select("*").eq("id", playerId).single(),
    supabase.auth.getUser(),
  ]);

  if (!playerData) notFound();
  if (user?.id === playerId) redirect("/profil");

  const player = playerData as UserRow;

  // Avg rating of this player
  const { data: avisJoueurData } = await supabase
    .from("avis_joueurs")
    .select("note")
    .eq("reviewed_id", playerId);

  const allAvis = (avisJoueurData ?? []) as { note: number }[];
  const avgNote =
    allAvis.length > 0
      ? allAvis.reduce((sum, a) => sum + a.note, 0) / allAvis.length
      : null;

  // Find a common past annonce to enable player rating
  let commonAnnonceId: string | null = null;
  let existingNote: number | null = null;

  if (user) {
    const now = new Date().toISOString();

    const [{ data: organizedByPlayer }, { data: inscribedByPlayer }] = await Promise.all([
      supabase
        .from("annonces")
        .select("id")
        .eq("organizer_id", playerId)
        .lt("date_time", now),
      supabase.from("inscriptions").select("annonce_id").eq("user_id", playerId),
    ]);

    const playerAnnonceIds = [
      ...new Set([
        ...(organizedByPlayer ?? []).map((a) => a.id),
        ...(inscribedByPlayer ?? []).map((i) => i.annonce_id),
      ]),
    ];

    if (playerAnnonceIds.length > 0) {
      const [{ data: myOrganized }, { data: myInscriptions }] = await Promise.all([
        supabase
          .from("annonces")
          .select("id")
          .in("id", playerAnnonceIds)
          .eq("organizer_id", user.id),
        supabase
          .from("inscriptions")
          .select("annonce_id")
          .eq("user_id", user.id)
          .in("annonce_id", playerAnnonceIds),
      ]);

      const myCommonIds = new Set([
        ...(myOrganized ?? []).map((a) => a.id),
        ...(myInscriptions ?? []).map((i) => i.annonce_id),
      ]);

      commonAnnonceId = playerAnnonceIds.find((id) => myCommonIds.has(id)) ?? null;

      if (commonAnnonceId) {
        const { data: existingAvis } = await supabase
          .from("avis_joueurs")
          .select("note")
          .eq("reviewer_id", user.id)
          .eq("reviewed_id", playerId)
          .eq("annonce_id", commonAnnonceId)
          .maybeSingle();

        existingNote = existingAvis ? (existingAvis as { note: number }).note : null;
      }
    }
  }

  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ratePlayerAction = commonAnnonceId
    ? submitAvisJoueur.bind(null, playerId, commonAnnonceId)
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-card shadow-card p-6">
        <div className="flex items-center gap-5 mb-4">
          {player.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.avatar_url}
              alt={player.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-light flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-alpine flex items-center justify-center flex-shrink-0">
              <span className="font-syne font-bold text-white text-xl">{initials}</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-syne font-bold text-2xl text-text-primary truncate">
              {player.name}
            </h1>
            {player.city && (
              <p className="font-dm text-sm text-text-secondary mt-0.5">📍 {player.city}</p>
            )}
            {avgNote !== null && (
              <div className="mt-2">
                <StarRating mode="display" average={avgNote} count={allAvis.length} />
              </div>
            )}
          </div>
        </div>

        {/* Rating widget */}
        {ratePlayerAction && (
          <div className="border-t border-[#e0ebe2] pt-4">
            <p className="font-dm text-sm text-text-secondary mb-3">
              {existingNote !== null ? "Votre évaluation" : "Évaluer ce joueur"}
            </p>
            <StarRating
              mode="interactive"
              action={ratePlayerAction}
              existing={existingNote ?? undefined}
            />
          </div>
        )}
      </div>

      {/* Sports pratiqués */}
      {player.sports && player.sports.length > 0 && (
        <div className="bg-surface rounded-card shadow-card p-5">
          <h2 className="font-syne font-bold text-base text-text-primary mb-3">
            Sports pratiqués
          </h2>
          <div className="flex flex-wrap gap-2">
            {player.sports.map((sport) => (
              <span
                key={sport}
                className="font-dm text-sm bg-green-light text-green-alpine font-medium px-3 py-1 rounded-full"
              >
                {SPORT_LABELS[sport] ?? sport}
              </span>
            ))}
          </div>
          {player.level && (
            <p className="font-dm text-sm text-text-secondary mt-3">
              Niveau :{" "}
              <span className="text-text-primary font-medium">
                {LEVEL_LABELS[player.level]}
              </span>
            </p>
          )}
        </div>
      )}

      <Link
        href="/"
        className="block font-dm text-sm text-text-secondary hover:text-text-primary transition-colors text-center"
      >
        ← Retour aux annonces
      </Link>
    </div>
  );
}
