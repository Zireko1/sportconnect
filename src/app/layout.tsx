import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SportVoisin — Trouve ton match dans le Sillon alpin",
  description:
    "Publie une annonce, trouve des joueurs ou des compagnons de sortie. Soccer Five, Padel, Trail, Vélo et plus — Annecy, Chambéry, Aix-les-Bains.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SportVoisin",
  },
};

export const viewport: Viewport = {
  themeColor: "#2d9e4e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
