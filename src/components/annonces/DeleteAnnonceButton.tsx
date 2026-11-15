"use client";

import { useState, useTransition } from "react";
import { deleteAnnonce } from "@/lib/actions/annonces";

/** Bouton discret de suppression, avec confirmation en deux temps. Réservé à l'organisateur. */
export function DeleteAnnonceButton({ annonceId }: { annonceId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        // En cas de succès, l'action redirige vers /explorer
        const res = await deleteAnnonce(annonceId, message);
        if (res?.error) setError(res.error);
      } catch {
        setError("La suppression a échoué. Réessaie dans un instant.");
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => { setError(null); setConfirming(true); }}
        className="w-full font-dm text-xs text-red-600 hover:text-red-700 hover:underline transition-colors py-2 text-center"
      >
        Supprimer l&apos;annonce
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-labelledby={`del-${annonceId}`} className="rounded-card border border-red-200 bg-red-50 px-3 py-3 space-y-2">
      <p id={`del-${annonceId}`} className="font-dm text-xs text-red-800 text-center">
        Es-tu sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
      </p>
      <label className="block">
        <span className="block font-dm text-[11px] text-text-secondary mb-1">
          Un mot pour les inscrits (facultatif) — ils seront prévenus par email
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={2}
          disabled={pending}
          placeholder="Ex. : Désolé, terrain indisponible ce jour-là."
          className="w-full font-dm text-xs text-text-primary bg-surface border border-[#e0ebe2] rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:border-red-300"
        />
      </label>
      {error && <p role="alert" className="font-dm text-xs text-red-600 text-center font-medium">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="flex-1 font-dm text-xs font-medium text-text-secondary bg-surface border border-[#e0ebe2] rounded-pill py-2 hover:text-text-primary transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="flex-1 font-dm text-xs font-medium text-red-600 bg-surface border border-red-300 rounded-pill py-2 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {pending ? "Suppression…" : "Oui, supprimer"}
        </button>
      </div>
    </div>
  );
}
