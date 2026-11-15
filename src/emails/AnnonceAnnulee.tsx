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
const BORDER = "#e0ebe2";
const GRAY = "#666666";
const BG = "#f8faf6";
const RED_LIGHT = "#fdecec";
const RED_BORDER = "#f5c2c2";

export interface AnnonceAnnuleeEmailProps {
  participantName: string;
  organizerName: string;
  annonceTitle: string;
  sportLabel: string;
  dateLabel: string;
  place: string;
  /** Mot facultatif de l'organisateur, saisi au moment de la suppression */
  organizerMessage?: string | null;
  explorerUrl: string;
}

export function AnnonceAnnuleeEmail({
  participantName,
  organizerName,
  annonceTitle,
  sportLabel,
  dateLabel,
  place,
  organizerMessage,
  explorerUrl,
}: AnnonceAnnuleeEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Match annulé : {annonceTitle}</Preview>
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
              Bonjour {participantName},
            </Text>
            <Text style={{ color: DARK, fontSize: 14, lineHeight: "1.7", margin: "0 0 20px" }}>
              <strong>{organizerName}</strong> a annulé le match auquel tu étais inscrit.
              {organizerMessage ? "" : " Toutes ses excuses pour le contretemps !"}
            </Text>

            {organizerMessage && (
              <Section style={{ borderLeft: `3px solid ${GREEN}`, padding: "4px 0 4px 14px", marginBottom: 20 }}>
                <Text style={{ color: DARK, fontSize: 14, fontStyle: "italic", lineHeight: "1.6", margin: "0 0 4px", whiteSpace: "pre-line" }}>
                  « {organizerMessage} »
                </Text>
                <Text style={{ color: GRAY, fontSize: 12, margin: 0 }}>— {organizerName}</Text>
              </Section>
            )}

            <Section
              style={{
                backgroundColor: RED_LIGHT,
                border: `1px solid ${RED_BORDER}`,
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 28,
              }}
            >
              <Text style={{ color: DARK, fontSize: 14, fontWeight: 600, margin: "0 0 6px", textDecoration: "line-through" }}>
                {annonceTitle}
              </Text>
              <Text style={{ color: DARK, fontSize: 13, margin: 0, lineHeight: "1.7" }}>
                {sportLabel}
                <br />
                📅 {dateLabel}
                <br />
                📍 {place}
              </Text>
            </Section>

            <Text style={{ color: DARK, fontSize: 14, lineHeight: "1.7", margin: "0 0 20px" }}>
              D&apos;autres sportifs cherchent peut-être des joueurs près de chez toi :
            </Text>

            <Button
              href={explorerUrl}
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
              Trouver un autre match →
            </Button>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: 0 }} />

          <Section style={{ padding: "20px 32px" }}>
            <Text style={{ color: GRAY, fontSize: 12, margin: 0, lineHeight: "1.6" }}>
              SportVoisin · Autour du Léman et des Alpes · Tu reçois cet email car tu étais inscrit à ce match.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default AnnonceAnnuleeEmail;
