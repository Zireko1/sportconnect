import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo-data";

export const metadata: Metadata = {
  title: "Blog | SportVoisin",
  description: "Conseils pour trouver des partenaires de sport, bons plans et actus sportives autour du Léman et des Alpes.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogIndexPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="font-syne font-bold text-3xl text-text-primary">Le blog SportVoisin</h1>
        <p className="font-dm text-text-secondary">Conseils et idées pour faire du sport à plusieurs, près de chez soi.</p>
      </header>
      <ul className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="block bg-surface rounded-card shadow-card p-5 hover:bg-green-light transition-colors">
              <p className="font-dm text-xs text-text-secondary">
                {new Date(post.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {post.readingMinutes} min de lecture
              </p>
              <h2 className="font-syne font-bold text-lg text-text-primary mt-1">{post.title}</h2>
              <p className="font-dm text-sm text-text-secondary mt-1">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
