import Link from "next/link";

/** Encart proéminent incitant à activer les alertes quand il y a peu d'annonces proches. */
export function AlertesCta({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gradient-to-br from-green-light to-white border-2 border-green-alpine/40 rounded-card p-5 space-y-3 shadow-card ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none" aria-hidden>🔔</span>
        <div className="space-y-1">
          <p className="font-syne font-bold text-text-primary">Pas encore d&apos;annonces près de chez vous.</p>
          <p className="font-dm text-sm text-text-secondary">
            Activez les alertes pour être notifié dès qu&apos;une activité est publiée ! 🔔
          </p>
        </div>
      </div>
      <Link
        href="/mes-alertes"
        className="block text-center bg-green-alpine hover:bg-green-dark text-white font-dm font-medium text-sm py-2.5 rounded-card transition-colors"
      >
        Créer mon alerte gratuite
      </Link>
      <p className="font-dm text-[11px] text-text-secondary text-center">
        Gratuit · désabonnement en un clic
      </p>
    </div>
  );
}
