import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// En sandbox (pas de domaine vérifié), Resend n'accepte que l'email
// du compte Resend en destinataire. RESEND_TO_OVERRIDE permet de forcer
// l'adresse de test pendant le développement.
export function resolveRecipient(email: string): string {
  return process.env.RESEND_TO_OVERRIDE ?? email;
}
