import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";

/**
 * Layout des pages de contenu statiques (SEO, blog).
 * Pas de UserAvatar ici : il lit les cookies et rendrait les pages dynamiques.
 */
export default function SeoLayout({ children }: { children: React.ReactNode }) {
  const login = (
    <Link href="/connexion" className="font-dm text-sm font-medium text-green-alpine hover:text-green-dark transition-colors">
      Connexion
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader avatar={login} />
      <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-[#e0ebe2]">
        <Logo />
        {login}
      </header>
      <div className="pb-20 lg:pb-0">
        {children}
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
