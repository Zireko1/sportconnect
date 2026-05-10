"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { SPORT_EMOJI, SPORT_LABEL } from "@/components/ui/Badge";

const SPORTS = Object.keys(SPORT_LABEL) as (keyof typeof SPORT_LABEL)[];

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSport(sport: string) {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleInscription(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, sports: selectedSports },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[inscription] supabase.auth.signUp error:", {
        message: error.message,
        status: error.status,
        name: error.name,
        cause: error.cause,
      });

      const msg = error.message.toLowerCase();
      const isAlreadyExists =
        msg.includes("already registered") ||
        msg.includes("already in use") ||
        msg.includes("user already") ||
        error.status === 422;

      setError(
        isAlreadyExists
          ? "Un compte existe déjà avec cet email."
          : `Erreur lors de l'inscription. Réessaie. (${error.message})`
      );
      setLoading(false);
      return;
    }

    // Supabase peut retourner success mais sans session si l'email est déjà confirmé
    if (signUpData.user && !signUpData.session && signUpData.user.identities?.length === 0) {
      console.warn("[inscription] Utilisateur déjà existant (identities vides) :", signUpData.user.id);
      setError("Un compte existe déjà avec cet email.");
      setLoading(false);
      return;
    }

    console.log("[inscription] signUp OK, userId:", signUpData.user?.id);
    router.push("/inscription/confirmation");
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Erreur lors de la connexion Google.");
      setGoogleLoading(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5 p-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-syne font-bold text-xl text-text-primary">
              {step === 1 ? "Créer un compte" : "Tes sports"}
            </h1>
            <span className="font-dm text-xs text-text-secondary ml-auto">
              {step}/2
            </span>
          </div>
          <p className="font-dm text-text-secondary text-sm">
            {step === 1
              ? "Rejoins la communauté du Sillon alpin"
              : "Sélectionne tes sports pour personnaliser tes alertes"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-card px-4 py-3">
            <p className="font-dm text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Étape 1 — infos compte */}
        {step === 1 && (
          <>
            <form onSubmit={handleStep1} className="space-y-4">
              <Input
                label="Prénom et nom"
                type="text"
                placeholder="Alex Martin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Mot de passe"
                type="password"
                placeholder="8 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                hint="8 caractères minimum"
                autoComplete="new-password"
              />
              <Button type="submit">Continuer</Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e0ebe2]" />
              <span className="font-dm text-xs text-text-secondary">ou</span>
              <div className="flex-1 h-px bg-[#e0ebe2]" />
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-surface border border-[#d1e8d4] hover:border-green-alpine/60 rounded-card px-4 py-3 font-dm text-sm font-medium text-text-primary transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              {googleLoading ? "Redirection…" : "S'inscrire avec Google"}
            </button>

            <p className="font-dm text-sm text-text-secondary text-center">
              Déjà un compte ?{" "}
              <a href="/connexion" className="text-green-alpine hover:text-green-dark font-medium">
                Se connecter
              </a>
            </p>
          </>
        )}

        {/* Étape 2 — choix des sports */}
        {step === 2 && (
          <form onSubmit={handleInscription} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={[
                    "flex items-center gap-2 px-3 py-2.5 rounded-card border font-dm text-sm transition-colors text-left",
                    selectedSports.includes(sport)
                      ? "bg-green-alpine text-white border-green-alpine"
                      : "bg-surface text-text-primary border-[#d1e8d4] hover:border-green-alpine/60",
                  ].join(" ")}
                >
                  <span>{SPORT_EMOJI[sport]}</span>
                  <span className="truncate">{SPORT_LABEL[sport]}</span>
                </button>
              ))}
            </div>

            <p className="font-dm text-xs text-text-secondary">
              {selectedSports.length === 0
                ? "Sélectionne au moins un sport"
                : `${selectedSports.length} sport${selectedSports.length > 1 ? "s" : ""} sélectionné${selectedSports.length > 1 ? "s" : ""}`}
            </p>

            <Button type="submit" loading={loading} disabled={selectedSports.length === 0}>
              Créer mon compte
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full font-dm text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              ← Retour
            </button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}
