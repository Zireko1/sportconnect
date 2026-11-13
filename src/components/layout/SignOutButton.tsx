"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({
  className = "",
  children = "Se déconnecter",
  onDone,
}: {
  className?: string;
  children?: React.ReactNode;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      console.error("[signout]", error.message);
      return;
    }
    onDone?.();
    router.replace("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={loading} className={className}>
      {loading ? "Déconnexion…" : children}
    </button>
  );
}
