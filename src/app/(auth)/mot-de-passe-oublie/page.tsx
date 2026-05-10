"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/nouveau-mot-de-passe`,
    });

    setLoading(false);
    if (error) {
      setError("Erreur lors de l'envoi. Réessaie.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card>
        <CardBody className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-navy-light rounded-full flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div>
            <h1 className="font-syne font-bold text-xl text-text-primary">Email envoyé</h1>
            <p className="font-dm text-text-secondary text-sm mt-2">
              Vérifie ta boîte mail pour réinitialiser ton mot de passe.
            </p>
          </div>
          <a href="/connexion" className="block font-dm text-sm text-navy hover:text-navy-dark">
            Retour à la connexion
          </a>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-5 p-6">
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Mot de passe oublié</h1>
          <p className="font-dm text-text-secondary text-sm mt-1">
            On t&apos;envoie un lien pour le réinitialiser.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-card px-4 py-3">
            <p className="font-dm text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={loading}>
            Envoyer le lien
          </Button>
        </form>

        <a href="/connexion" className="block font-dm text-sm text-text-secondary hover:text-text-primary text-center">
          ← Retour à la connexion
        </a>
      </CardBody>
    </Card>
  );
}
