import { StaticPage, MailLink } from "@/components/layout/StaticPage";

export const metadata = {
  title: "Mentions légales — SportVoisin",
};

export default function MentionsLegalesPage() {
  return (
    <StaticPage
      title="Mentions légales"
      updatedAt="14 novembre 2026"
      sections={[
        {
          title: "Éditeur",
          content: (
            <p>
              Ottman Zirek, Thonon-les-Bains (74200), France — <MailLink />
            </p>
          ),
        },
        {
          title: "Hébergeur",
          content: (
            <p>
              Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, USA —{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-alpine hover:text-green-dark hover:underline underline-offset-2"
              >
                vercel.com
              </a>
            </p>
          ),
        },
        {
          title: "Directeur de publication",
          content: <p>Ottman Zirek</p>,
        },
        {
          title: "Statut",
          content: (
            <p>Ce site est un projet personnel en phase de lancement, sans numéro SIRET à ce jour.</p>
          ),
        },
      ]}
    />
  );
}
