import Link from "next/link";
import { ContactForm } from "./ContactForm";

const FOOTER_LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/confidentialite", label: "Confidentialité" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#e0ebe2] bg-surface mt-12">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h2 className="font-syne font-bold text-xl text-text-primary mb-1">Une question ?</h2>
        <p className="font-dm text-sm text-text-secondary mb-6">
          L&apos;équipe SportVoisin vous répond rapidement.
        </p>
        <ContactForm />
        <nav
          aria-label="Informations légales"
          className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-8"
        >
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-dm text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="font-dm text-xs text-text-secondary text-center mt-3">
          © {new Date().getFullYear()} SportVoisin · Sillon alpin
        </p>
      </div>
    </footer>
  );
}
