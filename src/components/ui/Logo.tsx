import Link from "next/link";

interface LogoProps {
  size?: "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const iconPx = size === "lg" ? 38 : 30;
  const textCls = size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 flex-shrink-0 ${className}`}
    >
      {/* Icône SVG — inline styles pour éviter tout override CSS (fill, transitions) */}
      <svg
        width={iconPx}
        height={iconPx}
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", flexShrink: 0, transition: "none" }}
      >
        {/* Carré arrondi vert */}
        <rect
          width="36"
          height="36"
          rx="8"
          style={{ fill: "#3aaa5c", transition: "none" }}
        />
        {/* Pin blanc */}
        <path
          d="M18 5C22.97 5 27 9.03 27 14C27 18.6 24.1 22.5 20.1 24.1L18 30.5L15.9 24.1C11.9 22.5 9 18.6 9 14C9 9.03 13.03 5 18 5Z"
          style={{ fill: "#ffffff", transition: "none" }}
        />
        {/* SV cursif vert dans le pin */}
        <text
          x="18"
          y="14"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8.5"
          fontWeight="700"
          style={{
            fill: "#3aaa5c",
            fontFamily: "var(--font-dancing, cursive)",
            transition: "none",
          }}
        >
          SV
        </text>
      </svg>

      {/* Sport (normal) + Voisin (bold) — Plus Jakarta Sans */}
      <span
        className={`${textCls} leading-none`}
        style={{ fontFamily: "var(--font-jakarta, sans-serif)", color: "#3aaa5c" }}
      >
        Sport<span style={{ fontWeight: 700 }}>Voisin</span>
      </span>
    </Link>
  );
}
