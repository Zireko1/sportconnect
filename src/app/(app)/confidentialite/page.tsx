import { StaticPage, MailLink } from "@/components/layout/StaticPage";

export const metadata = {
  title: "Politique de confidentialité — SportVoisin",
};

export default function ConfidentialitePage() {
  return (
    <StaticPage
      title="Politique de confidentialité"
      updatedAt="14 novembre 2026"
      sections={[
        {
          title: "Responsable du traitement",
          content: (
            <p>
              Ottman Zirek — <MailLink />
            </p>
          ),
        },
        {
          title: "Données collectées",
          content: (
            <p>Nom, email, ville, sports pratiqués, annonces créées, messages échangés.</p>
          ),
        },
        {
          title: "Finalité",
          content: (
            <p>
              Permettre la mise en relation entre sportifs et l&apos;envoi d&apos;alertes email
              personnalisées.
            </p>
          ),
        },
        {
          title: "Base légale",
          content: <p>Consentement de l&apos;utilisateur lors de l&apos;inscription.</p>,
        },
        {
          title: "Conservation",
          content: (
            <p>Les données sont conservées tant que le compte est actif et supprimées sur demande.</p>
          ),
        },
        {
          title: "Vos droits",
          content: (
            <p>
              Accès, rectification et suppression sur demande à <MailLink /> (réponse sous 30 jours).
            </p>
          ),
        },
        {
          title: "Sous-traitants",
          content: (
            <>
              <p>Vos données sont traitées par les prestataires techniques suivants :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Vercel Inc.</strong> — hébergement du site — États-Unis
                </li>
                <li>
                  <strong>Supabase Inc.</strong> — base de données et authentification — données
                  hébergées dans l&apos;Union européenne (Paris, France)
                </li>
                <li>
                  <strong>Resend</strong> — envoi des emails (alertes, notifications) — États-Unis
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Transferts hors UE",
          content: (
            <p>
              Les données hébergées par Supabase restent dans l&apos;Union européenne. Les traitements
              réalisés par Vercel (hébergement) et Resend (envoi d&apos;emails) impliquent un transfert
              vers les États-Unis, encadré par les clauses contractuelles types de la Commission
              européenne (Standard Contractual Clauses).
            </p>
          ),
        },
        {
          title: "Cookies",
          content: (
            <p>Uniquement des cookies techniques (session). Aucun cookie publicitaire.</p>
          ),
        },
      ]}
    />
  );
}
