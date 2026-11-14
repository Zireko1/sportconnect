import { StaticPage, MailLink } from "@/components/layout/StaticPage";

export const metadata = {
  title: "À propos — SportVoisin",
};

export default function AProposPage() {
  return (
    <StaticPage
      title="À propos de SportVoisin"
      sections={[
        {
          content: (
            <p>
              SportVoisin est né d&apos;un constat simple : trouver des partenaires sportifs dans sa ville
              est compliqué.
            </p>
          ),
        },
        {
          content: (
            <p>
              L&apos;application permet de publier ou rejoindre des activités sportives (trail, padel,
              foot, vélo, rando…) autour du Léman et des Alpes.
            </p>
          ),
        },
        {
          content: (
            <p>
              Projet créé et développé par Ottman Zirek, ingénieur et sportif passionné basé à
              Thonon-les-Bains.
            </p>
          ),
        },
        {
          title: "Contact",
          content: <MailLink />,
        },
      ]}
    />
  );
}
