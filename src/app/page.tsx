export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-syne font-bold text-3xl text-green-alpine">
            Sport<span className="text-green-dark">Connect</span>
          </span>
          <p className="font-dm text-text-secondary text-sm mt-1">
            Sillon alpin — Bêta privée
          </p>
        </div>

        <div className="bg-surface rounded-card shadow-card p-6 space-y-4">
          <h1 className="font-syne font-bold text-xl text-text-primary">
            Initialisation réussie ✓
          </h1>
          <p className="font-dm text-text-secondary text-sm">
            Next.js 14 · Tailwind · Supabase · Vercel
          </p>
          <div className="flex flex-wrap gap-2">
            {["⚽ Soccer Five", "🎾 Padel", "🚴 Vélo", "🏃 Trail"].map((sport) => (
              <span
                key={sport}
                className="bg-green-light text-green-dark text-xs font-dm font-medium px-3 py-1 rounded-pill"
              >
                {sport}
              </span>
            ))}
          </div>
          <button className="w-full bg-green-alpine hover:bg-green-dark text-white font-dm font-medium py-3 rounded-card transition-colors">
            Commencer
          </button>
        </div>
      </div>
    </main>
  );
}
