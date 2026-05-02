import {
  Html, Head, Preview, Body, Container,
  Section, Row, Column, Heading, Text, Button, Hr, Link,
} from "@react-email/components";

const GREEN = "#2d9e4e";
const DARK = "#1a2e1a";
const LIGHT_GREEN = "#e8f5ec";
const BORDER = "#e0ebe2";
const GRAY = "#666666";
const BG = "#f8faf6";

const SPORT_EMOJI: Record<string, string> = {
  soccer_five: "⚽", padel: "🎾", basket: "🏀", volley: "🏐",
  futsal: "🎱", badminton: "🏸", velo: "🚴", trail: "🏃", randonnee: "🥾",
};
const SPORT_LABEL: Record<string, string> = {
  soccer_five: "Soccer Five", padel: "Padel", basket: "Basket 3x3",
  volley: "Volley", futsal: "Futsal", badminton: "Badminton",
  velo: "Vélo de route", trail: "Trail running", randonnee: "Randonnée",
};
const LEVEL_LABEL: Record<string, string> = {
  debutant: "Débutant", intermediaire: "Intermédiaire", confirme: "Confirmé", tous: "Tous niveaux",
};
const FREQ_LABEL: Record<string, string> = {
  realtime: "Temps réel", daily: "Récap quotidien", weekly: "Récap hebdo",
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export interface AlerteMatchEmailProps {
  userName: string;
  annonce: {
    id: string;
    sport: string;
    title: string;
    date_time: string;
    location_name: string;
    city: string;
    level: string | null;
    price_per_player: number;
    filled_spots: number;
    total_spots: number;
    distance_km?: number | null;
    elevation_m?: number | null;
  };
  matchedCriteria: {
    sport: boolean;
    distanceKm: number | null;
    dayLabel: string;
    slotLabel: string;
  };
  otherAnnonces: Array<{
    id: string;
    sport: string;
    title: string;
    date_time: string;
    city: string;
    filled_spots: number;
    total_spots: number;
  }>;
  alertConfig: {
    sports: string[];
    radius_km: number;
    frequency: string;
  };
  appUrl: string;
}

export function AlerteMatchEmail({
  userName,
  annonce,
  matchedCriteria,
  otherAnnonces,
  alertConfig,
  appUrl,
}: AlerteMatchEmailProps) {
  const annonceUrl = `${appUrl}/annonce/${annonce.id}`;
  const alertesUrl = `${appUrl}/mes-alertes`;
  const spotsLeft = annonce.total_spots - annonce.filled_spots;
  const emoji = SPORT_EMOJI[annonce.sport] ?? "🏅";
  const sportLabel = SPORT_LABEL[annonce.sport] ?? annonce.sport;

  return (
    <Html lang="fr">
      <Head />
      <Preview>
        {`${emoji} ${spotsLeft} place${spotsLeft > 1 ? "s" : ""} dispo — ${annonce.title}`}
      </Preview>
      <Body style={{ backgroundColor: BG, margin: 0, padding: "40px 0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>

          {/* ── HEADER ── */}
          <Section style={{ backgroundColor: DARK, borderRadius: "16px 16px 0 0", padding: "32px 36px 28px" }}>
            {/* Logo */}
            <Text style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
              Sport<span style={{ color: GREEN }}>Voisin</span>
            </Text>
            {/* Badge alerte */}
            <Text style={{
              display: "inline-block", margin: "0 0 14px",
              backgroundColor: "rgba(45,158,78,0.15)", border: "1px solid rgba(45,158,78,0.4)",
              color: "#52ff8e", fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
              textTransform: "uppercase", padding: "5px 12px", borderRadius: 99,
            }}>
              🔔 Nouvelle alerte match
            </Text>
            <Heading as="h1" style={{ color: "#ffffff", fontSize: 24, fontWeight: 800, lineHeight: 1.25, margin: "0 0 6px" }}>
              {emoji} Un match correspond à tes critères !
            </Heading>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>
              Bonjour {userName} — voici ce qu&apos;on a trouvé pour toi.
            </Text>
          </Section>

          {/* ── MATCH CARD ── */}
          <Section style={{ backgroundColor: "#ffffff", border: `1px solid ${BORDER}`, borderTop: "none", padding: "24px 36px" }}>

            {/* Top row: sport badge + urgency */}
            <Row style={{ marginBottom: 14 }}>
              <Column>
                <Text style={{
                  display: "inline-block", margin: 0,
                  backgroundColor: DARK, color: "#52ff8e",
                  fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
                }}>
                  {emoji} {sportLabel}
                </Text>
              </Column>
              <Column align="right">
                {spotsLeft <= 3 && (
                  <Text style={{
                    display: "inline-block", margin: 0,
                    backgroundColor: "#fff3f0", border: "1px solid #ffd4c8",
                    color: "#d06030", fontSize: 11, fontWeight: 600,
                    padding: "4px 10px", borderRadius: 6,
                  }}>
                    🔥 Plus que {spotsLeft} place{spotsLeft > 1 ? "s" : ""}
                  </Text>
                )}
              </Column>
            </Row>

            {/* Title */}
            <Heading as="h2" style={{ color: DARK, fontSize: 18, fontWeight: 700, lineHeight: 1.35, margin: "0 0 16px" }}>
              {annonce.title}
            </Heading>

            {/* Info grid */}
            <Section style={{ backgroundColor: BG, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <Row style={{ marginBottom: 10 }}>
                <Column style={{ width: "50%" }}>
                  <Text style={{ margin: 0, fontSize: 10, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>DATE</Text>
                  <Text style={{ margin: "3px 0 0", fontSize: 13, color: DARK, fontWeight: 500 }}>
                    📅 {formatDate(annonce.date_time)}
                  </Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={{ margin: 0, fontSize: 10, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>HEURE</Text>
                  <Text style={{ margin: "3px 0 0", fontSize: 13, color: DARK, fontWeight: 500 }}>
                    🕐 {formatTime(annonce.date_time)}
                  </Text>
                </Column>
              </Row>
              <Row style={{ marginBottom: 10 }}>
                <Column style={{ width: "50%" }}>
                  <Text style={{ margin: 0, fontSize: 10, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>LIEU</Text>
                  <Text style={{ margin: "3px 0 0", fontSize: 13, color: DARK, fontWeight: 500 }}>
                    📍 {annonce.location_name}, {annonce.city}
                  </Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={{ margin: 0, fontSize: 10, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>NIVEAU</Text>
                  <Text style={{ margin: "3px 0 0", fontSize: 13, color: DARK, fontWeight: 500 }}>
                    🎯 {annonce.level ? LEVEL_LABEL[annonce.level] : "Tous niveaux"}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={{ margin: 0, fontSize: 10, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>PRIX / JOUEUR</Text>
                  <Text style={{ margin: "3px 0 0", fontSize: 13, color: DARK, fontWeight: 500 }}>
                    {annonce.price_per_player === 0 ? "💚 Gratuit" : `💶 ${annonce.price_per_player}€`}
                  </Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={{ margin: 0, fontSize: 10, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>JOUEURS</Text>
                  <Text style={{ margin: "3px 0 0", fontSize: 13, color: DARK, fontWeight: 500 }}>
                    👥 {annonce.filled_spots}/{annonce.total_spots} inscrits
                  </Text>
                </Column>
              </Row>
              {(annonce.distance_km || annonce.elevation_m) && (
                <Row style={{ marginTop: 10, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
                  <Column>
                    <Text style={{ margin: 0, fontSize: 13, color: GREEN, fontWeight: 500 }}>
                      {annonce.distance_km && `🗺 ${annonce.distance_km} km`}
                      {annonce.distance_km && annonce.elevation_m && "  "}
                      {annonce.elevation_m && `⛰ D+${annonce.elevation_m}m`}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* CTA */}
            <Button
              href={annonceUrl}
              style={{
                display: "block", width: "100%", textAlign: "center",
                backgroundColor: GREEN, color: "#ffffff",
                fontSize: 15, fontWeight: 700, borderRadius: 99,
                padding: "14px 0", textDecoration: "none",
              }}
            >
              Je rejoins ce match →
            </Button>
          </Section>

          {/* ── POURQUOI CETTE ALERTE ── */}
          <Section style={{ backgroundColor: LIGHT_GREEN, border: `1px solid #c8e8d0`, borderTop: "none", padding: "18px 36px" }}>
            <Text style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: GREEN, textTransform: "uppercase", letterSpacing: 1 }}>
              Pourquoi cette alerte ?
            </Text>
            <Row>
              {matchedCriteria.sport && (
                <Column style={{ paddingRight: 6 }}>
                  <Text style={{ display: "inline-block", margin: 0, backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: DARK }}>
                    {emoji} {sportLabel}
                  </Text>
                </Column>
              )}
              {matchedCriteria.distanceKm !== null && (
                <Column style={{ paddingRight: 6 }}>
                  <Text style={{ display: "inline-block", margin: 0, backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: DARK }}>
                    📍 {matchedCriteria.distanceKm} km de toi
                  </Text>
                </Column>
              )}
              <Column style={{ paddingRight: 6 }}>
                <Text style={{ display: "inline-block", margin: 0, backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: DARK }}>
                  📅 {matchedCriteria.dayLabel}
                </Text>
              </Column>
              <Column>
                <Text style={{ display: "inline-block", margin: 0, backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: DARK }}>
                  🕐 {matchedCriteria.slotLabel}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ── AUTRES ANNONCES ── */}
          {otherAnnonces.length > 0 && (
            <Section style={{ backgroundColor: "#ffffff", border: `1px solid ${BORDER}`, borderTop: "none", padding: "20px 36px" }}>
              <Text style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 600, color: GRAY, textTransform: "uppercase", letterSpacing: 1 }}>
                Autres annonces disponibles
              </Text>
              {otherAnnonces.slice(0, 3).map((a) => (
                <Row key={a.id} style={{ marginBottom: 10, padding: "10px 12px", backgroundColor: BG, borderRadius: 10 }}>
                  <Column style={{ width: 30 }}>
                    <Text style={{ margin: 0, fontSize: 16 }}>{SPORT_EMOJI[a.sport] ?? "🏅"}</Text>
                  </Column>
                  <Column>
                    <Text style={{ margin: 0, fontSize: 12, color: DARK, fontWeight: 500, lineHeight: 1.4 }}>{a.title}</Text>
                    <Text style={{ margin: "2px 0 0", fontSize: 11, color: GRAY }}>
                      {formatDate(a.date_time)} · {a.city} · {a.filled_spots}/{a.total_spots} joueurs
                    </Text>
                  </Column>
                  <Column align="right" style={{ width: 60 }}>
                    <Link href={`${appUrl}/annonce/${a.id}`} style={{ fontSize: 11, color: GREEN, fontWeight: 600, textDecoration: "none" }}>
                      Voir →
                    </Link>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* ── FOOTER ── */}
          <Section style={{ backgroundColor: "#ffffff", border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "20px 36px 28px" }}>
            <Hr style={{ borderColor: BORDER, margin: "0 0 18px" }} />
            <Text style={{ margin: "0 0 6px", fontSize: 11, color: GRAY, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Tes critères d&apos;alerte actifs
            </Text>
            <Text style={{ margin: "0 0 14px", fontSize: 12, color: DARK }}>
              {alertConfig.sports.map((s) => `${SPORT_EMOJI[s] ?? ""} ${SPORT_LABEL[s] ?? s}`).join(", ")}
              {" · "}📍 {alertConfig.radius_km} km
              {" · "}📧 {FREQ_LABEL[alertConfig.frequency] ?? alertConfig.frequency}
            </Text>
            <Link href={alertesUrl} style={{ fontSize: 12, color: GREEN, fontWeight: 600, textDecoration: "underline" }}>
              Modifier mes alertes
            </Link>
            <Text style={{ margin: "14px 0 0", fontSize: 11, color: "#aaa" }}>
              SportVoisin · Sillon alpin · Tu reçois cet email car tu as activé les alertes match.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
