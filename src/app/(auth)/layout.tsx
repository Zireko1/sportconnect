import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Logo size="lg" className="mb-8" />

      <div className="w-full max-w-sm">{children}</div>

      <p className="mt-8 font-dm text-xs text-text-secondary text-center">
        Autour du Léman et des Alpes — Annecy · Genève · Lausanne · Chambéry
      </p>
    </div>
  );
}
