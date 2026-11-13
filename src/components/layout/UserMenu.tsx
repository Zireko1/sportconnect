"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/layout/SignOutButton";

const MENU_LINKS = [
  { href: "/profil", label: "Mon profil" },
  { href: "/mes-alertes", label: "Mes alertes" },
  { href: "/messages", label: "Messages" },
];

const itemClass =
  "block w-full text-left px-4 py-2.5 font-dm text-sm text-text-primary hover:bg-green-light transition-colors";

export function UserMenu({
  name,
  avatarUrl,
  initials,
}: {
  name: string;
  avatarUrl: string | null;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fermer au changement de page
  useEffect(() => setOpen(false), [pathname]);

  // Fermer au clic extérieur et avec Échap
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu utilisateur"
        aria-haspopup="menu"
        aria-expanded={open}
        className="block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-green-alpine focus-visible:ring-offset-2"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="w-9 h-9 rounded-full object-cover border-2 border-green-light"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-green-alpine flex items-center justify-center">
            <span className="font-syne font-bold text-white text-xs">{initials}</span>
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 bg-surface border border-[#e0ebe2] rounded-card shadow-lg py-1.5 z-50"
        >
          {name && (
            <p className="px-4 pt-1.5 pb-2 font-dm text-xs text-text-secondary truncate border-b border-[#e0ebe2] mb-1">
              {name}
            </p>
          )}
          {MENU_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-[#e0ebe2] my-1" />
          <SignOutButton
            onDone={() => setOpen(false)}
            className="block w-full text-left px-4 py-2.5 font-dm text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          />
        </div>
      )}
    </div>
  );
}
