import Image from "next/image";
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
      <Image
        src="/logo-sportvoisin.png"
        alt="SportVoisin"
        width={iconPx}
        height={iconPx}
        style={{ display: "block", flexShrink: 0 }}
        priority
      />

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
