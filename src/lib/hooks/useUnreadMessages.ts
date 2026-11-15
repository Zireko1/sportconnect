"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Nombre de messages non lus reçus par l'utilisateur connecté (0 si déconnecté).
 * Recompte au changement de page, à chaque message reçu (realtime) et quand
 * le chat marque des messages comme lus (événement window « messages:read »).
 *
 * Attention : le client Supabase navigateur est un singleton et
 * supabase.channel(nom) renvoie le canal existant s'il porte déjà ce nom.
 * Ce hook étant monté plusieurs fois (header desktop + bottom nav), chaque
 * abonnement utilise un nom de canal unique, sinon .on() est appelé sur un
 * canal déjà souscrit → « cannot add postgres_changes callbacks after subscribe() ».
 */
export function useUnreadMessages(): number {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const refreshRef = useRef<() => void>(() => {});

  // Session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    const { count: n, error } = await createClient()
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("read", false);
    if (error) console.error("[unread] échec comptage:", error.message);
    setCount(n ?? 0);
  }, [userId]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Recomptage au changement d'utilisateur ou de page
  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  // Abonnement realtime : un seul par instance et par utilisateur (pas par page)
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const topic = `unread-${userId}-${Math.random().toString(36).slice(2, 10)}`;

    const channel = supabase
      .channel(topic)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` },
        () => refreshRef.current()
      )
      .subscribe();

    const onRead = () => refreshRef.current();
    window.addEventListener("messages:read", onRead);

    return () => {
      window.removeEventListener("messages:read", onRead);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}
