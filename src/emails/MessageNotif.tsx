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
  Link,
} from "@react-email/components";

const GREEN = "#2d9e4e";
const DARK = "#1a2e1a";
const LIGHT_GREEN = "#e8f5ec";
const BORDER = "#e0ebe2";
const GRAY = "#666666";
const BG = "#f8faf6";

export interface MessageNotifEmailProps {
  receiverName: string;
  senderName: string;
  messagePreview: string;
  annonceTitle: string;
  annonceUrl: string;
}

export function MessageNotifEmail({
  receiverName,
  senderName,
  messagePreview,
  annonceTitle,
  annonceUrl,
}: MessageNotifEmailProps) {
  const preview = messagePreview.length === 50 ? `${messagePreview}…` : messagePreview;

  return (
    <Html lang="fr">
      <Head />
      <Preview>
        {senderName} vous a envoyé un message sur SportVoisin
      </Preview>
      <Body
        style={{
          backgroundColor: BG,
          fontFamily: "'DM Sans', Arial, sans-serif",
          margin: 0,
          padding: "24px 0",
        }}
      >
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
          {/* Header */}
          <Section style={{ backgroundColor: GREEN, padding: "24px 32px" }}>
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "'Syne', Arial, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                margin: 0,
              }}
            >
              💬 SportVoisin
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: "32px" }}>
            <Text
              style={{
                color: DARK,
                fontSize: 15,
                fontWeight: 600,
                margin: "0 0 8px",
              }}
            >
              Bonjour {receiverName},
            </Text>

            <Text
              style={{
                color: DARK,
                fontSize: 14,
                lineHeight: "1.7",
                margin: "0 0 20px",
              }}
            >
              <strong>{senderName}</strong> vous a envoyé un message à propos de l'annonce{" "}
              <strong>« {annonceTitle} »</strong> :
            </Text>

            {/* Message preview bubble */}
            <Section
              style={{
                backgroundColor: LIGHT_GREEN,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 28,
              }}
            >
              <Text
                style={{
                  color: DARK,
                  fontSize: 14,
                  margin: 0,
                  fontStyle: "italic",
                  lineHeight: "1.6",
                }}
              >
                « {preview} »
              </Text>
            </Section>

            <Button
              href={annonceUrl}
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
              Voir et répondre →
            </Button>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: 0 }} />

          {/* Footer */}
          <Section style={{ padding: "20px 32px" }}>
            <Text
              style={{
                color: GRAY,
                fontSize: 12,
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              Vous recevez cet email car vous avez une annonce active sur{" "}
              <Link href={annonceUrl} style={{ color: GREEN }}>
                SportVoisin
              </Link>
              . Pour éviter les emails répétés, nous n&apos;envoyons qu&apos;une notification toutes les 2&nbsp;h par conversation.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default MessageNotifEmail;
