"use client";

import { useState } from "react";

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

interface ShareButtonProps {
  title: string;
  variant?: "icon" | "button";
}

export function ShareButton({ title, variant = "icon" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `SportVoisin — ${title}`, url });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        aria-label="Partager"
        className="text-text-secondary hover:text-text-primary transition-colors"
      >
        <ShareIcon />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="w-full font-dm text-sm text-text-secondary hover:text-text-primary transition-colors py-2 flex items-center justify-center gap-2"
    >
      <ShareIcon />
      {copied ? "Lien copié !" : "Partager l'annonce"}
    </button>
  );
}
