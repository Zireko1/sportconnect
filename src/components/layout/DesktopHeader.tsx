"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";

const NAV_LINKS = [
  { href: "/", label: "Accueil", exact: true },
  { href: "/explorer", label: "Explorer", exact: false },
  { href: "/sportifs", label: "Sportifs", exact: false },
  { href: "/mes-alertes", label: "Alertes", exact: false },
  { href: "/messages", label: "Messages", exact: false },
  { href: "/profil", label: "Profil", exact: false },
];

export function DesktopHeader({ avatar }: { avatar: React.ReactNode }) {
  const pathname = usePathname();
  const unread = useUnreadMessages();

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
                "relative font-dm text-sm transition-colors",
                active
                  ? "text-green-alpine font-medium"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {label}
              {href === "/messages" && unread > 0 && (
                <span
                  aria-label={`${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`}
                  className="absolute -top-2 -right-4 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center"
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
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
