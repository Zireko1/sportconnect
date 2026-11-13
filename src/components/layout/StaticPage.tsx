export const CONTACT_EMAIL = "contact@sportvoisin.fr";

export function MailLink({ email = CONTACT_EMAIL }: { email?: string }) {
  return (
    <a href={`mailto:${email}`} className="text-green-alpine hover:text-green-dark underline-offset-2 hover:underline">
      {email}
    </a>
  );
}

export interface StaticSection {
  title?: string;
  content: React.ReactNode;
}

/** Mise en page commune des pages statiques (mentions légales, CGU, etc.) */
export function StaticPage({
  title,
  intro,
  sections,
  updatedAt,
}: {
  title: string;
  intro?: React.ReactNode;
  sections: StaticSection[];
  updatedAt?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <article className="bg-surface rounded-card shadow-card p-6 sm:p-8">
        <h1 className="font-syne font-bold text-2xl text-text-primary">{title}</h1>
        {updatedAt && (
          <p className="font-dm text-xs text-text-secondary mt-1">Dernière mise à jour : {updatedAt}</p>
        )}
        {intro && <div className="font-dm text-sm text-text-secondary leading-relaxed mt-4">{intro}</div>}

        <div className="mt-6 space-y-5">
          {sections.map((s, i) => (
            <section key={i}>
              {s.title && (
                <h2 className="font-syne font-bold text-base text-text-primary mb-1.5">{s.title}</h2>
              )}
              <div className="font-dm text-sm text-text-primary/85 leading-relaxed">{s.content}</div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
