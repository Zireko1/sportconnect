"use client";

import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "./ChatPanel";

interface Props {
  annonceId: string;
  currentUserId: string;
  chatPartnerId: string;
  label: string;
  annonceTitle: string;
  defaultOpen?: boolean;
}

export function ContactSection({
  annonceId,
  currentUserId,
  chatPartnerId,
  label,
  annonceTitle,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Ouvert d'office (arrivée depuis /messages) : on amène le chat à l'écran.
  // La page monte une version mobile et une desktop ; seule la visible
  // (offsetParent non nul) défile.
  useEffect(() => {
    if (!defaultOpen || !ref.current || ref.current.offsetParent === null) return;
    const el = ref.current;
    const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    return () => clearTimeout(t);
  }, [defaultOpen]);

  return (
    <div ref={ref} className="bg-surface rounded-card shadow-card overflow-hidden scroll-mt-20">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-green-light transition-colors"
      >
        <span className="flex items-center gap-2 font-dm text-sm font-medium text-green-alpine">
          <ChatIcon />
          {label}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ChatPanel
          annonceId={annonceId}
          currentUserId={currentUserId}
          chatPartnerId={chatPartnerId}
          annonceTitle={annonceTitle}
        />
      )}
    </div>
  );
}

function ChatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#999"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
