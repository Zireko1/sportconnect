"use client";

import { useEffect, useState } from "react";

/**
 * Vrai si l'écran correspond au format demandé (lg = 1024px, comme Tailwind).
 * Sans format : toujours vrai. null tant que ce n'est pas déterminé
 * (rendu serveur / premier rendu), pour éviter tout décalage d'hydratation.
 */
export function useBreakpoint(breakpoint?: "mobile" | "desktop"): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(breakpoint ? null : true);

  useEffect(() => {
    if (!breakpoint) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setMatches(breakpoint === "desktop" ? mq.matches : !mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return matches;
}
