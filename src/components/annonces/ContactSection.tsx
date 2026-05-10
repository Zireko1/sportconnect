"use client";

import { useState } from "react";
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

  return (
    <div className="bg-surface rounded-card shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-navy-light transition-colors"
      >
        <span className="flex items-center gap-2 font-dm text-sm font-medium text-navy">
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
