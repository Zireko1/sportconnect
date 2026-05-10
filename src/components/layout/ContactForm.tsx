"use client";

import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, message }),
      });

      if (!res.ok) throw new Error();

      setState("success");
      setNom("");
      setEmail("");
      setMessage("");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-green-light rounded-xl px-5 py-6 text-center">
        <p className="font-syne font-bold text-green-alpine text-base">Message envoyé !</p>
        <p className="font-dm text-sm text-text-secondary mt-1">
          On vous répond sous 48 h.
        </p>
        <button
          onClick={() => setState("idle")}
          className="font-dm text-sm text-green-alpine hover:text-green-dark transition-colors mt-3"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-dm text-xs text-text-secondary mb-1 block">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            placeholder="Votre nom"
            className="w-full font-dm text-sm bg-[#f8faf6] border border-[#e0ebe2] rounded-xl px-3 py-2.5 text-text-primary placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-green-alpine/30 focus:border-green-alpine transition"
          />
        </div>
        <div>
          <label className="font-dm text-xs text-text-secondary mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
            className="w-full font-dm text-sm bg-[#f8faf6] border border-[#e0ebe2] rounded-xl px-3 py-2.5 text-text-primary placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-green-alpine/30 focus:border-green-alpine transition"
          />
        </div>
      </div>
      <div>
        <label className="font-dm text-xs text-text-secondary mb-1 block">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          placeholder="Votre message…"
          className="w-full font-dm text-sm bg-[#f8faf6] border border-[#e0ebe2] rounded-xl px-3 py-2.5 text-text-primary placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-green-alpine/30 focus:border-green-alpine transition resize-none"
        />
      </div>

      {state === "error" && (
        <p className="font-dm text-sm text-red-500">
          Une erreur est survenue. Réessayez ou contactez-nous directement.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full font-dm text-sm font-medium bg-green-alpine text-white px-4 py-2.5 rounded-pill hover:bg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Envoi en cours…" : "Envoyer"}
      </button>
    </form>
  );
}
