import Link from "next/link";
import { StaticPage, MailLink } from "@/components/layout/StaticPage";

export const metadata = {
  title: "Conditions générales d'utilisation — SportVoisin",
};

export default function CguPage() {
  return (
    <StaticPage
      title="Conditions générales d'utilisation"
      updatedAt="14 novembre 2026"
      sections={[
        {
          title: "Objet",
          content: (
            <p>SportVoisin met en relation des sportifs amateurs pour organiser des activités sportives.</p>
          ),
        },
        {
          title: "Accès",
          content: <p>L&apos;accès au service est gratuit et réservé aux personnes majeures.</p>,
        },
        {
          title: "Responsabilité",
          content: (
            <p>
              SportVoisin est une plateforme de mise en relation. L&apos;organisateur est seul responsable
              de l&apos;activité publiée. SportVoisin ne peut être tenu responsable des incidents survenus
              lors des rencontres.
            </p>
          ),
        },
        {
          title: "Contenu",
          content: (
            <p>
              Les utilisateurs s&apos;engagent à ne pas publier de contenu illégal, offensant ou trompeur.
            </p>
          ),
        },
        {
          title: "Données personnelles",
          content: (
            <p>
              Voir la{" "}
              <Link
                href="/confidentialite"
                className="text-green-alpine hover:text-green-dark hover:underline underline-offset-2"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          ),
        },
        {
          title: "Résiliation",
          content: (
            <p>
              Tout compte peut être supprimé sur simple demande à <MailLink />.
            </p>
          ),
        },
        {
          title: "Droit applicable",
          content: <p>Droit français, tribunal compétent de Thonon-les-Bains.</p>,
        },
      ]}
    />
  );
}
