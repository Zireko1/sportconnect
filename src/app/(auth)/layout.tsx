export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <a href="/" className="mb-8 flex-shrink-0">
        <span className="font-syne font-bold text-2xl text-green-alpine">
          Sport<span className="text-green-dark">Connect</span>
        </span>
      </a>

      <div className="w-full max-w-sm">{children}</div>

      <p className="mt-8 font-dm text-xs text-text-secondary text-center">
        Sillon alpin — Annecy · Chambéry · Aix-les-Bains
      </p>
    </div>
  );
}
