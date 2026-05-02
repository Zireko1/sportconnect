"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "/", label: "Accueil", exact: true },
  { href: "/explorer", label: "Explorer", exact: false },
  { href: "/mes-alertes", label: "Alertes", exact: false },
  { href: "/profil", label: "Profil", exact: false },
];

export function DesktopHeader({ avatar }: { avatar: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <header className="hidden lg:flex items-center justify-between px-8 h-16 bg-surface border-b border-[#e0ebe2] sticky top-0 z-40">
      {/* Logo */}
      <Logo />

      {/* Nav links */}
      <nav className="flex items-center gap-8">
        {NAV_LINKS.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "font-dm text-sm transition-colors",
                active
                  ? "text-green-alpine font-medium"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/annonce/creer"
          className="font-dm text-sm font-medium bg-green-alpine text-white px-4 py-2 rounded-pill hover:bg-green-dark transition-colors"
        >
          + Publier
        </Link>
        {avatar}
      </div>
    </header>
  );
}
