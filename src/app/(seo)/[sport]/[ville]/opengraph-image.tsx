import { ImageResponse } from "next/og";
import { getSeoCity, getSeoSport } from "@/lib/seo-data";

// Image générée à la demande en edge puis mise en cache par le CDN
// (la pré-génération via @vercel/og plante sous Windows avec Next 14).
export const runtime = "edge";

export const alt = "Trouver un partenaire de sport près de chez soi — SportVoisin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage({ params }: { params: { sport: string; ville: string } }) {
  const sport = getSeoSport(params.sport);
  const city = getSeoCity(params.ville);
  const sportName = sport?.name ?? "sport";
  const cityLabel = city?.a ?? "près de chez toi";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #e8f5ec 0%, #ffffff 55%, #d4ecdb 100%)",
          color: "#1a2e1a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700 }}>
          <span style={{ color: "#2d9e4e" }}>Sport</span>
          <span style={{ color: "#1a5c2e" }}>Voisin</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 34, color: "#2d9e4e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>
            {`${sport?.label ?? "Sport"} · ${city?.name ?? ""}`}
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>
            {`Trouver un partenaire de ${sportName} ${cityLabel}`}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#666666" }}>
          <span>Gratuit · Autour du Léman et des Alpes</span>
          <span
            style={{
              background: "#2d9e4e",
              color: "#ffffff",
              padding: "14px 28px",
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            sportvoisin.fr
          </span>
        </div>
      </div>
    ),
    size
  );
}
