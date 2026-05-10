"use client";

import { useState, useTransition } from "react";

/* ---- Display mode ---- */
interface DisplayProps {
  mode: "display";
  average: number;
  count: number;
}

/* ---- Interactive mode ---- */
interface InteractiveProps {
  mode: "interactive";
  action: (fd: FormData) => Promise<void>;
  existing?: number;
}

export function StarRating(props: DisplayProps | InteractiveProps) {
  if (props.mode === "display") return <StarDisplay {...props} />;
  return <StarInteractive {...props} />;
}

function StarDisplay({ average, count }: DisplayProps) {
  const rounded = Math.round(average * 10) / 10;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarSvg key={i} filled={i <= Math.round(average)} size={16} />
        ))}
      </div>
      <span className="font-dm text-sm font-medium text-text-primary">{rounded}</span>
      <span className="font-dm text-sm text-text-secondary">
        ({count} avis{count > 1 ? "" : ""})
      </span>
    </div>
  );
}

function StarInteractive({ action, existing }: InteractiveProps) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(existing ?? 0);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const alreadyRated = existing !== undefined || submitted;

  if (alreadyRated) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarSvg key={i} filled={i <= selected} size={18} />
          ))}
        </div>
        <span className="font-dm text-sm text-text-secondary">Votre note</span>
      </div>
    );
  }

  return (
    <form
      action={(fd) => {
        if (!selected) return;
        startTransition(async () => {
          await action(fd);
          setSubmitted(true);
        });
      }}
    >
      <input type="hidden" name="note" value={selected} />
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110 active:scale-95"
            aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
          >
            <StarSvg filled={i <= (hover || selected)} size={28} />
          </button>
        ))}
      </div>
      {selected > 0 && (
        <button
          type="submit"
          disabled={isPending}
          className="font-dm text-sm font-medium bg-green-alpine text-white px-4 py-2 rounded-pill hover:bg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Envoi…" : "Envoyer ma note"}
        </button>
      )}
    </form>
  );
}

function StarSvg({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#d1d5db"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
