import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SportBadge, StatusBadge } from "@/components/ui/Badge";
import { JoinButton } from "@/components/annonces/JoinButton";
import { ShareButton } from "@/components/annonces/ShareButton";
import { ContactSection } from "@/components/annonces/ContactSection";
import type { Database } from "@/types/database";

type AnnonceDetail = Database["public"]["Tables"]["annonces"]["Row"] & {
  users: { name: string; avatar_url: string | null } | null;
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ withUser?: string }>;
}

const LEVEL_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  confirme: "Confirmé",
};

export default async function AnnonceDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { withUser } = await searchParams;
  const supabase = await createClient();

  const [{ data: annonce, error }, { data: { user } }] = await Promise.all([
    supabase.from("annonces").select("*, users(name, avatar_url)").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);

  if (error || !annonce) notFound();

  const ann = annonce as AnnonceDetail;

  const { count: matchesOrganized } = await supabase
    .from("annonces")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", ann.organizer_id);

  const isOrganizer = !!user && user.id === ann.organizer_id;
  let isInscrit = false;
  let chatPartnerName = "";

  const fetchInscription = user && !isOrganizer
    ? supabase.from("inscriptions").select("id").eq("annonce_id", id).eq("user_id", user.id).maybeSingle()
    : Promise.resolve({ data: null });

  const fetchChatPartner = user && isOrganizer && withUser
    ? supabase.from("users").select("name").eq("id", withUser).single()
    : Promise.resolve({ data: null });

  const [{ data: inscription }, { data: chatPartnerRow }] = await Promise.all([
    fetchInscription,
    fetchChatPartner,
  ]);

  if (inscription) isInscrit = true;
  if (chatPartnerRow) chatPartnerName = chatPartnerRow.name;

  // Determine chat state
  let chatPartnerId: string | null = null;
  let chatLabel = "";
  let chatDefaultOpen = false;

  if (user) {
    if (!isOrganizer) {
      chatPartnerId = ann.organizer_id;
      chatLabel = "Contacter l'organisateur";
    } else if (withUser) {
      chatPartnerId = withUser;
      chatLabel = `Conversation avec ${chatPartnerName || "un participant"}`;
      chatDefaultOpen = true;
    }
  }

  const spotsLeft = ann.total_spots - ann.filled_spots;
  const isFull = ann.status === "full" || spotsLeft <= 0;
  const isUrgent = spotsLeft > 0 && spotsLeft <= 2;
  const isOutdoor = ann.sport_type === "outdoor";

  const organizerName = ann.users?.name ?? "Organisateur";
  const initials = organizerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinProps = { annonceId: id, isInscrit, isFull, isOrganizer, isAuthenticated: !!user };

  return (
    <>
      {/* ===== MOBILE HEADER (< lg) ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-[#e0ebe2] flex items-center justify-between px-4 h-14">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeftIcon />
          <span className="font-dm text-sm">Retour</span>
        </Link>
        <ShareButton title={ann.title} variant="icon" />
      </header>

      {/* ===== MOBILE LAYOUT (< lg) ===== */}
      <div className="lg:hidden pt-14 pb-28 max-w-sm mx-auto">
        {/* Hero */}
        <section className="px-4 py-5 space-y-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <SportBadge sport={ann.sport} customLabel={ann.sport_custom} />
            <StatusBadge status={ann.status} />
          </div>
          <h1 className="font-syne font-bold text-2xl text-text-primary leading-tight">
            {ann.title}
          </h1>
          {ann.description && (
            <p className="font-dm text-sm text-text-secondary leading-relaxed">
              {ann.description}
            </p>
          )}
        </section>

        {/* Info chips */}
        <section className="px-4 pb-4">
          <InfoChips ann={ann} isOutdoor={isOutdoor} />
        </section>

        {/* Barre d'urgence */}
        {isUrgent && (
          <div className="px-4 pb-4">
            <UrgencyBar spotsLeft={spotsLeft} />
          </div>
        )}

        {/* Visualisation des places */}
        <section className="mx-4 mb-4 bg-surface rounded-card shadow-card p-4">
          <p className="font-syne font-bold text-sm text-text-primary mb-3">
            Participants — {ann.filled_spots}/{ann.total_spots}
          </p>
          <SpotsVisualization filled={ann.filled_spots} total={ann.total_spots} />
        </section>

        {/* Organisateur */}
        <div className="mx-4 mb-4">
          <OrganizerCard
            organizerName={organizerName}
            initials={initials}
            avatarUrl={ann.users?.avatar_url ?? null}
            matchesOrganized={matchesOrganized ?? 0}
          />
        </div>

        {/* Chat */}
        {user && chatPartnerId && (
          <div className="mx-4 mb-4">
            <ContactSection
              annonceId={id}
              currentUserId={user.id}
              chatPartnerId={chatPartnerId}
              label={chatLabel}
              annonceTitle={ann.title}
              defaultOpen={chatDefaultOpen}
            />
          </div>
        )}

        {/* Carte */}
        <div className="mx-4 mb-4">
          <MapPlaceholder locationName={ann.location_name} city={ann.city} />
        </div>
      </div>

      {/* ===== MOBILE CTA fixe (< lg) ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-t border-[#e0ebe2] px-4 py-3 safe-bottom">
        <JoinButton {...joinProps} />
      </div>

      {/* ===== DESKTOP LAYOUT (>= lg) ===== */}
      <div className="hidden lg:block max-w-5xl mx-auto px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-dm text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeftIcon />
          Retour aux annonces
        </Link>

        <div className="grid grid-cols-[1fr_304px] gap-8 items-start">
          {/* Colonne principale */}
          <main className="space-y-5 min-w-0">
            {/* Hero */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
                <SportBadge sport={ann.sport} customLabel={ann.sport_custom} />
                <StatusBadge status={ann.status} />
              </div>
              <h1 className="font-syne font-bold text-3xl text-text-primary leading-tight mb-3">
                {ann.title}
              </h1>
              {ann.description && (
                <p className="font-dm text-sm text-text-secondary leading-relaxed">
                  {ann.description}
                </p>
              )}
            </div>

            {/* Informations */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <p className="font-syne font-bold text-sm text-text-primary mb-4">Informations</p>
              <InfoChips ann={ann} isOutdoor={isOutdoor} />
            </div>

            {/* Barre d'urgence */}
            {isUrgent && <UrgencyBar spotsLeft={spotsLeft} />}

            {/* Participants */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <p className="font-syne font-bold text-sm text-text-primary mb-4">
                Participants — {ann.filled_spots}/{ann.total_spots}
              </p>
              <SpotsVisualization filled={ann.filled_spots} total={ann.total_spots} />
            </div>

            {/* Carte */}
            <MapPlaceholder locationName={ann.location_name} city={ann.city} />
          </main>

          {/* Sidebar droite */}
          <aside className="sticky top-24 space-y-4">
            {/* CTA */}
            <div className="bg-surface rounded-card shadow-card p-4 space-y-3">
              <JoinButton {...joinProps} />
              <ShareButton title={ann.title} variant="button" />
            </div>

            {/* Organisateur */}
            <OrganizerCard
              organizerName={organizerName}
              initials={initials}
              avatarUrl={ann.users?.avatar_url ?? null}
              matchesOrganized={matchesOrganized ?? 0}
            />

            {/* Chat */}
            {user && chatPartnerId && (
              <ContactSection
                annonceId={id}
                currentUserId={user.id}
                chatPartnerId={chatPartnerId}
                label={chatLabel}
                annonceTitle={ann.title}
                defaultOpen={chatDefaultOpen}
              />
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

/* ========== SOUS-COMPOSANTS ========== */

function InfoChips({
  ann,
  isOutdoor,
}: {
  ann: AnnonceDetail;
  isOutdoor: boolean;
}) {
  const d = new Date(ann.date_time);
  const dateStr = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const capitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="flex flex-wrap gap-2">
      <Chip icon={<CalIcon />}>{capitalized} · {timeStr}</Chip>
      <Chip icon={<PinIcon />}>{ann.location_name} · {ann.city}</Chip>
      {ann.level && (
        <Chip icon={<LevelIcon />}>{LEVEL_LABELS[ann.level] ?? ann.level}</Chip>
      )}
      <Chip icon={<EuroIcon />}>
        {ann.price_per_player > 0 ? `${ann.price_per_player} € / joueur` : "Gratuit"}
      </Chip>
      {isOutdoor && ann.distance_km != null && (
        <Chip icon={<RouteIcon />}>{ann.distance_km} km</Chip>
      )}
      {isOutdoor && ann.elevation_m != null && (
        <Chip icon={<MtnIcon />}>{ann.elevation_m} m D+</Chip>
      )}
      {isOutdoor && ann.pace && (
        <Chip icon={<SpeedIcon />}>{ann.pace}</Chip>
      )}
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-background border border-[#e0ebe2] rounded-card px-3 py-2">
      <span className="text-green-alpine flex-shrink-0">{icon}</span>
      <span className="font-dm text-sm text-text-primary">{children}</span>
    </div>
  );
}

function UrgencyBar({ spotsLeft }: { spotsLeft: number }) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-card px-4 py-3">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#dc2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <p className="font-dm text-sm text-red-700 font-medium">
        Plus que {spotsLeft} place{spotsLeft > 1 ? "s" : ""} disponible
        {spotsLeft > 1 ? "s" : ""} !
      </p>
    </div>
  );
}

function SpotsVisualization({ filled, total }: { filled: number; total: number }) {
  const maxVisible = Math.min(total, 20);
  const extra = total > 20 ? total - 20 : 0;
  const filledVisible = Math.min(filled, maxVisible);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {Array.from({ length: maxVisible }).map((_, i) => {
          const occupied = i < filledVisible;
          return (
            <div
              key={i}
              title={occupied ? "Participant inscrit" : "Place libre"}
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                occupied
                  ? "bg-green-alpine shadow-sm"
                  : "bg-green-light border border-[#c8e6cf]",
              ].join(" ")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={occupied ? "white" : "#2d9e4e"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={occupied ? 1 : 0.45}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          );
        })}
        {extra > 0 && (
          <div className="w-8 h-8 rounded-full bg-[#f0f5f1] border border-[#e0ebe2] flex items-center justify-center">
            <span className="font-dm text-[10px] font-medium text-text-secondary">+{extra}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-alpine" />
          <span className="font-dm text-xs text-text-secondary">
            {filled} inscrit{filled > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-light border border-[#c8e6cf]" />
          <span className="font-dm text-xs text-text-secondary">
            {total - filled} libre{total - filled !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrganizerCard({
  organizerName,
  initials,
  avatarUrl,
  matchesOrganized,
}: {
  organizerName: string;
  initials: string;
  avatarUrl: string | null;
  matchesOrganized: number;
}) {
  return (
    <div className="bg-surface rounded-card shadow-card p-4">
      <p className="font-syne font-bold text-sm text-text-primary mb-3">Organisateur</p>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={organizerName}
            className="w-12 h-12 rounded-full object-cover border-2 border-green-light flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-green-alpine flex items-center justify-center flex-shrink-0">
            <span className="font-syne font-bold text-white text-sm">{initials}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-syne font-bold text-text-primary text-sm truncate">
            {organizerName}
          </p>
          <p className="font-dm text-xs text-text-secondary">
            {matchesOrganized} match{matchesOrganized > 1 ? "s" : ""} organisé
            {matchesOrganized > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function MapPlaceholder({ locationName, city }: { locationName: string; city: string }) {
  return (
    <div className="bg-surface rounded-card shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e0ebe2] flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-syne font-bold text-sm text-text-primary truncate">{locationName}</p>
          <p className="font-dm text-xs text-text-secondary">{city}</p>
        </div>
        <span className="font-dm text-[10px] font-medium bg-green-alpine/10 text-green-dark px-2 py-0.5 rounded-pill ml-2 flex-shrink-0">
          Carte
        </span>
      </div>
      <div className="relative h-44 bg-[#e8f5ec] overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 320 176"
          preserveAspectRatio="xMidYMid slice"
        >
          {[28, 56, 84, 112, 140].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} stroke="#2d9e4e" strokeWidth="0.5" opacity="0.15" />
          ))}
          {[40, 80, 120, 160, 200, 240, 280].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="176" stroke="#2d9e4e" strokeWidth="0.5" opacity="0.15" />
          ))}
          <path d="M0 88 C60 75 150 105 320 85" stroke="#2d9e4e" strokeWidth="3" fill="none" opacity="0.2" strokeLinecap="round" />
          <path d="M0 48 C80 58 200 42 320 52" stroke="#2d9e4e" strokeWidth="1.5" fill="none" opacity="0.15" strokeLinecap="round" />
          <path d="M150 0 C144 52 158 128 152 176" stroke="#2d9e4e" strokeWidth="2" fill="none" opacity="0.18" strokeLinecap="round" />
          <ellipse cx="110" cy="85" rx="28" ry="18" fill="#2d9e4e" opacity="0.06" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d9e4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <p className="font-dm text-xs font-medium text-green-dark bg-white/80 px-3 py-1 rounded-pill shadow-sm max-w-[200px] text-center truncate">
            {locationName}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========== ICÔNES ========== */

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LevelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function EuroIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M4 14h12M19.5 4.5A7.5 7.5 0 1 0 19.5 19.5" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function MtnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
