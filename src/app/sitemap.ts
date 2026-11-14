import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL, allSeoParams } from "@/lib/seo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/explorer`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/inscription`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/cgu`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/confidentialite`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const seoPages: MetadataRoute.Sitemap = allSeoParams().map(({ sport, ville }) => ({
    url: `${SITE_URL}/${sport}/${ville}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...seoPages, ...blogPages];
}
