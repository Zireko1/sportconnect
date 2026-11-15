"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Nombre de messages non lus reçus par l'utilisateur connecté (0 si déconnecté).
 * Recompte au changement de page, à chaque message reçu (realtime) et quand
 * le chat marque des messages comme lus (événement window « messages:read »).
 */
export function useUnreadMessages(): number {
  const [count, setCount] = useState(0);
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  // Session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Comptage + realtime
  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    const supabase = createClient();
    let cancelled = false;

    async function refresh() {
      const { count: n, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", userId!)
        .eq("read", false);
      if (error) console.error("[unread] échec comptage:", error.message);
      if (!cancelled) setCount(n ?? 0);
    }
    refresh();

    const channel = supabase
      .channel(`unread-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` },
        () => refresh()
      )
      .subscribe();

    window.addEventListener("messages:read", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("messages:read", refresh);
      supabase.removeChannel(channel);
    };
  }, [userId, pathname]);

  return count;
}
