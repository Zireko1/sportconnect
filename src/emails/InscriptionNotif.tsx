import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

const GREEN = "#2d9e4e";
const DARK = "#1a2e1a";
const LIGHT_GREEN = "#e8f5ec";
const BORDER = "#e0ebe2";
const GRAY = "#666666";
const BG = "#f8faf6";

export interface InscriptionNotifEmailProps {
  organizerName: string;
  participantName: string;
  annonceTitle: string;
  sportLabel: string;
  dateLabel: string;
  place: string;
  spotsLeft: number;
  totalSpots: number;
  contactUrl: string;
}

export function InscriptionNotifEmail({
  organizerName,
  participantName,
  annonceTitle,
  sportLabel,
  dateLabel,
  place,
  spotsLeft,
  totalSpots,
  contactUrl,
}: InscriptionNotifEmailProps) {
  const spotsText =
    spotsLeft <= 0
      ? `Ton match est complet (${totalSpots}/${totalSpots}) 🎉`
      : `Il reste ${spotsLeft} place${spotsLeft > 1 ? "s" : ""} sur ${totalSpots}`;

  return (
    <Html lang="fr">
      <Head />
      <Preview>{participantName} rejoint ton match — {annonceTitle}</Preview>
      <Body style={{ backgroundColor: BG, fontFamily: "'DM Sans', Arial, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container
          style={{
            maxWidth: 500,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            overflow: "hidden",
          }}
        >
          <Section style={{ backgroundColor: GREEN, padding: "24px 32px" }}>
            <Text style={{ color: "#ffffff", fontFamily: "'Syne', Arial, sans-serif", fontWeight: 700, fontSize: 20, margin: 0 }}>
              SportVoisin
            </Text>
          </Section>

          <Section style={{ padding: "32px" }}>
            <Text style={{ color: DARK, fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>
              Bonjour {organizerName},
            </Text>
            <Text style={{ color: DARK, fontSize: 14, lineHeight: "1.7", margin: "0 0 20px" }}>
              <strong>{participantName}</strong> vient de s&apos;inscrire à ton match.
            </Text>

            <Section
              style={{
                backgroundColor: LIGHT_GREEN,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: DARK, fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>{annonceTitle}</Text>
              <Text style={{ color: DARK, fontSize: 13, margin: 0, lineHeight: "1.7" }}>
                {sportLabel}
                <br />
                📅 {dateLabel}
                <br />
                📍 {place}
              </Text>
            </Section>

            <Text style={{ color: GREEN, fontSize: 14, fontWeight: 600, margin: "0 0 24px" }}>{spotsText}</Text>

            <Button
              href={contactUrl}
              style={{
                backgroundColor: GREEN,
                color: "#ffffff",
                borderRadius: 24,
                padding: "13px 28px",
                fontWeight: 600,
                fontSize: 14,
                display: "block",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Contacter {participantName} →
            </Button>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: 0 }} />

          <Section style={{ padding: "20px 32px" }}>
            <Text style={{ color: GRAY, fontSize: 12, margin: 0, lineHeight: "1.6" }}>
              SportVoisin · Autour du Léman et des Alpes · Tu reçois cet email car tu organises ce match.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default InscriptionNotifEmail;
