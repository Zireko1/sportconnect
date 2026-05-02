import { type HTMLAttributes } from "react";

type BadgeVariant = "sport" | "level" | "status" | "city";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  sport: "bg-green-light text-green-dark",
  level: "bg-[#e8f0fe] text-[#1a3c8e]",
  status: "bg-green-alpine/10 text-green-dark",
  city: "bg-[#f0f0f0] text-text-secondary",
};

const SPORT_EMOJI: Record<string, string> = {
  soccer_five: "⚽",
  padel: "🎾",
  basket: "🏀",
  volley: "🏐",
  futsal: "🎱",
  badminton: "🏸",
  velo: "🚴",
  trail: "🏃",
  randonnee: "🥾",
};

const SPORT_LABEL: Record<string, string> = {
  soccer_five: "Soccer Five",
  padel: "Padel",
  basket: "Basket 3x3",
  volley: "Volley",
  futsal: "Futsal",
  badminton: "Badminton",
  velo: "Vélo de route",
  trail: "Trail running",
  randonnee: "Randonnée",
};

function Badge({ variant = "sport", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-3 py-1 rounded-pill text-xs font-dm font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

function SportBadge({ sport }: { sport: string }) {
  return (
    <Badge variant="sport">
      {SPORT_EMOJI[sport]} {SPORT_LABEL[sport] ?? sport}
    </Badge>
  );
}

function LevelBadge({ level }: { level: string }) {
  const labels: Record<string, string> = {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    confirme: "Confirmé",
    tous: "Tous niveaux",
  };
  return <Badge variant="level">{labels[level] ?? level}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: "Places dispo", className: "bg-green-alpine/10 text-green-dark" },
    full: { label: "Complet", className: "bg-orange-100 text-orange-700" },
    cancelled: { label: "Annulé", className: "bg-red-100 text-red-600" },
    completed: { label: "Terminé", className: "bg-[#f0f0f0] text-text-secondary" },
  };
  const { label, className } = config[status] ?? config.open;
  return (
    <Badge variant="status" className={className}>
      {label}
    </Badge>
  );
}

export { Badge, SportBadge, LevelBadge, StatusBadge, SPORT_EMOJI, SPORT_LABEL };
