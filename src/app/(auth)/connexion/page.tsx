"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Erreur lors de la connexion Google.");
      setGoogleLoading(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5 p-6">
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Connexion</h1>
          <p className="font-dm text-text-secondary text-sm mt-1">
            Content de te revoir 👋
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-card px-4 py-3">
            <p className="font-dm text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <div className="space-y-1.5">
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="text-right">
              <a
                href="/mot-de-passe-oublie"
                className="font-dm text-xs text-navy hover:text-navy-dark"
              >
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <Button type="submit" loading={loading}>
            Se connecter
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#dce6f0]" />
          <span className="font-dm text-xs text-text-secondary">ou</span>
          <div className="flex-1 h-px bg-[#dce6f0]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-surface border border-[#c8d9eb] hover:border-navy/60 rounded-card px-4 py-3 font-dm text-sm font-medium text-text-primary transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          {googleLoading ? "Redirection…" : "Continuer avec Google"}
        </button>

        <p className="font-dm text-sm text-text-secondary text-center">
          Pas encore de compte ?{" "}
          <a href="/inscription" className="text-navy hover:text-navy-dark font-medium">
            S&apos;inscrire
          </a>
        </p>
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
