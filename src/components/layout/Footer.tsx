import { ContactForm } from "./ContactForm";

export function Footer() {
  return (
    <footer className="border-t border-[#e0ebe2] bg-surface mt-12">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h2 className="font-syne font-bold text-xl text-text-primary mb-1">Une question ?</h2>
        <p className="font-dm text-sm text-text-secondary mb-6">
          L&apos;équipe SportVoisin vous répond rapidement.
        </p>
        <ContactForm />
        <p className="font-dm text-xs text-text-secondary text-center mt-8">
          © {new Date().getFullYear()} SportVoisin · Sillon alpin
        </p>
      </div>
    </footer>
  );
}
