import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// En sandbox (pas de domaine vérifié), Resend n'accepte que l'email
// du compte Resend en destinataire. RESEND_TO_OVERRIDE permet de forcer
// l'adresse de test pendant le développement.
// Garde-fou : l'override est toujours ignoré en production Vercel,
// sinon tous les emails partiraient vers une seule adresse.
export function resolveRecipient(email: string): string {
  const override = process.env.RESEND_TO_OVERRIDE;
  if (!override) return email;
  if (process.env.VERCEL_ENV === "production") {
    console.warn("[resend] RESEND_TO_OVERRIDE défini en production — ignoré");
    return email;
  }
  return override;
}
