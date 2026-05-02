import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8faf6",
        surface: "#ffffff",
        "green-alpine": "#2d9e4e",
        "green-dark": "#1a5c2e",
        "green-light": "#e8f5ec",
        "text-primary": "#1a2e1a",
        "text-secondary": "#666666",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        dm: ["var(--font-dm-sans)", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        pill: "99px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.05)",
      },
      transitionTimingFunction: {
        DEFAULT: "ease",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};
export default config;
