import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import { SEO_CITIES, SEO_SPORTS, SITE_URL } from "@/lib/seo-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} | SportVoisin`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.description, url, type: "article", publishedTime: post.date, locale: "fr_FR" },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "SportVoisin" },
    publisher: { "@type": "Organization", name: "SportVoisin", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="bg-surface rounded-card shadow-card p-6 sm:p-8 space-y-6">
        <header className="space-y-2">
          <Link href="/blog" className="font-dm text-xs text-green-alpine hover:text-green-dark">← Blog</Link>
          <h1 className="font-syne font-bold text-2xl sm:text-3xl text-text-primary leading-tight">{post.title}</h1>
          <p className="font-dm text-xs text-text-secondary">
            {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {post.readingMinutes} min de lecture
          </p>
        </header>

        {post.sections.map((section, i) => (
          <section key={i} className="space-y-3">
            {section.heading && <h2 className="font-syne font-bold text-xl text-text-primary">{section.heading}</h2>}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="font-dm text-text-primary leading-relaxed">{p}</p>
            ))}
            {section.list && (
              <ul className="list-disc pl-5 space-y-1.5 font-dm text-text-primary">
                {section.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}

        {/* CTA inscription */}
        <div className="bg-green-light rounded-card p-5 text-center space-y-3">
          <p className="font-syne font-bold text-lg text-text-primary">Trouve tes partenaires dès aujourd&apos;hui</p>
          <p className="font-dm text-sm text-text-secondary">Gratuit, inscription en 1 minute.</p>
          <Link href="/inscription" className="inline-block bg-green-alpine hover:bg-green-dark text-white font-dm font-medium px-5 py-3 rounded-card transition-colors">
            S&apos;inscrire gratuitement
          </Link>
        </div>

        {/* Maillage vers les pages locales */}
        <nav aria-label="Trouver un partenaire par ville" className="space-y-2 border-t border-[#e0ebe2] pt-5">
          <p className="font-syne font-bold text-sm text-text-primary">Trouver un partenaire près de chez vous</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {SEO_CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${SEO_SPORTS[0].slug}/${c.slug}`} className="font-dm text-sm text-green-alpine hover:text-green-dark">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </main>
  );
}
