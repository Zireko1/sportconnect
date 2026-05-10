"use client";

import { useTransition, useState } from "react";
import { joinAnnonce, leaveAnnonce } from "@/lib/actions/inscriptions";

interface JoinButtonProps {
  annonceId: string;
  isInscrit: boolean;
  isFull: boolean;
  isOrganizer: boolean;
  isAuthenticated: boolean;
}

export function JoinButton({
  annonceId,
  isInscrit,
  isFull,
  isOrganizer,
  isAuthenticated,
}: JoinButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const base =
    "w-full font-dm font-medium text-sm rounded-card py-3.5 transition-colors text-center";

  if (isOrganizer) {
    return (
      <div className={`${base} bg-green-light text-green-dark flex items-center justify-center gap-2`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Tu organises ce match
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/connexion"
        className={`${base} bg-green-alpine text-white hover:bg-green-dark block`}
      >
        Se connecter pour rejoindre
      </a>
    );
  }

  if (isInscrit) {
    return (
      <div className="space-y-2">
        <div className={`${base} bg-green-light text-green-dark flex items-center justify-center gap-2`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Tu es inscrit
        </div>
        {error && (
          <p className="font-dm text-xs text-red-600 text-center">{error}</p>
        )}
        <button
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await leaveAnnonce(annonceId);
              } catch {
                setError("Impossible de se désinscrire. Réessaie.");
              }
            });
          }}
          disabled={pending}
          className="w-full font-dm text-xs text-text-secondary hover:text-red-600 transition-colors py-2 text-center"
        >
          {pending ? "…" : "Se désinscrire"}
        </button>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className={`${base} bg-[#f5f5f5] text-text-secondary cursor-not-allowed`}>
        Complet — liste d&apos;attente à venir
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await joinAnnonce(annonceId);
            } catch {
              setError("Impossible de rejoindre. Réessaie.");
            }
          });
        }}
        disabled={pending}
        className={`${base} bg-green-alpine text-white hover:bg-green-dark active:scale-[0.99] ${pending ? "opacity-70 cursor-wait" : ""}`}
      >
        {pending ? "Inscription en cours…" : "Rejoindre ce match"}
      </button>
      {error && (
        <p className="font-dm text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
