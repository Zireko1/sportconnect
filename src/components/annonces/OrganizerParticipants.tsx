import Link from "next/link";

export interface ParticipantChip {
  userId: string;
  firstName: string;
  avatarUrl: string | null;
}

/**
 * Vue organisateur des participants : chaque inscrit est cliquable et ouvre
 * la conversation (?withUser= → ouverture du chat existante), puis les places
 * libres restantes en grisé.
 */
export function OrganizerParticipants({
  annonceId,
  participants,
  total,
  activeUserId,
}: {
  annonceId: string;
  participants: ParticipantChip[];
  total: number;
  activeUserId?: string;
}) {
  const freeSpots = Math.max(total - participants.length, 0);
  const freeVisible = Math.min(freeSpots, 20);

  return (
    <div>
      {participants.length > 0 ? (
        <>
          <ul className="flex flex-wrap gap-2 mb-3">
            {participants.map((p) => {
              const active = p.userId === activeUserId;
              return (
                <li key={p.userId}>
                  <Link
                    href={`/annonce/${annonceId}?withUser=${p.userId}`}
                    title={`Contacter ${p.firstName}`}
                    aria-label={`Contacter ${p.firstName}`}
                    className={[
                      "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors",
                      active
                        ? "bg-green-alpine border-green-alpine text-white"
                        : "bg-green-light border-[#c8e6cf] text-green-dark hover:border-green-alpine",
                    ].join(" ")}
                  >
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <span
                        className={[
                          "w-7 h-7 rounded-full flex items-center justify-center font-syne font-bold text-xs",
                          active ? "bg-white text-green-alpine" : "bg-green-alpine text-white",
                        ].join(" ")}
                      >
                        {p.firstName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="font-dm text-sm font-medium">{p.firstName}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="font-dm text-xs text-text-secondary mb-3">Clique sur un participant pour lui écrire.</p>
        </>
      ) : (
        <p className="font-dm text-sm text-text-secondary mb-3">Personne ne s&apos;est encore inscrit.</p>
      )}

      {freeVisible > 0 && (
        <div className="flex flex-wrap gap-2" aria-label={`${freeSpots} place${freeSpots > 1 ? "s" : ""} libre${freeSpots > 1 ? "s" : ""}`}>
          {Array.from({ length: freeVisible }).map((_, i) => (
            <div
              key={i}
              title="Place libre"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f1f3f1] border border-[#e0e4e0]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa59c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          ))}
          {freeSpots > freeVisible && (
            <span className="font-dm text-xs text-text-secondary self-center">+{freeSpots - freeVisible}</span>
          )}
        </div>
      )}
    </div>
  );
}
