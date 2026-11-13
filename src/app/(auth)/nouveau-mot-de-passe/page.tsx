"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";

const MIN_LENGTH = 6;

export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionMissing, setSessionMissing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      // Lien expiré ou page ouverte sans passer par le lien de l'email
      if (error.name === "AuthSessionMissingError" || /session/i.test(error.message)) {
        setSessionMissing(true);
        setError("Ton lien a expiré ou n'est plus valide. Demande un nouveau lien.");
      } else if (/different from the old/i.test(error.message)) {
        setError("Le nouveau mot de passe doit être différent de l'ancien.");
      } else {
        setError("Erreur lors de l'enregistrement. Réessaie.");
      }
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <Card>
      <CardBody className="space-y-5 p-6">
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Nouveau mot de passe</h1>
          <p className="font-dm text-text-secondary text-sm mt-1">
            Choisis un nouveau mot de passe pour ton compte.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-card px-4 py-3">
            <p className="font-dm text-sm text-red-600">{error}</p>
            {sessionMissing && (
              <a href="/mot-de-passe-oublie" className="block mt-2 font-dm text-sm font-medium text-red-700 underline">
                Recevoir un nouveau lien
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="new-password"
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            id="confirm-password"
            label="Confirmer le mot de passe"
            type="password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <Button type="submit" loading={loading}>
            Enregistrer
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
