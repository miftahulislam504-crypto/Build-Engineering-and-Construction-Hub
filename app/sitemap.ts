// app/sitemap.ts
import { MetadataRoute } from "next";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://buildenginex.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:              APP_URL,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         1.0,
    },
    {
      url:              `${APP_URL}/products`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.9,
    },
    {
      url:              `${APP_URL}/services`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.9,
    },
    {
      url:              `${APP_URL}/calculator`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.8,
    },
    {
      url:              `${APP_URL}/blog`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.7,
    },
    {
      url:              `${APP_URL}/contact`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.6,
    },
    {
      url:              `${APP_URL}/about`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.5,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const productsSnap = await getDocs(
      query(
        collection(db, "products"),
        where("isActive", "==", true)
      )
    );
    productPages = productsSnap.docs.map((d) => ({
      url:             `${APP_URL}/products/${d.data().slug}`,
      lastModified:    d.data().updatedAt?.toDate?.() || new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));
  } catch { /* Firestore unavailable at build time */ }

  // Dynamic service pages
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const servicesSnap = await getDocs(
      query(
        collection(db, "services"),
        where("isActive", "==", true)
      )
    );
    servicePages = servicesSnap.docs.map((d) => ({
      url:             `${APP_URL}/services/${d.data().slug}`,
      lastModified:    d.data().updatedAt?.toDate?.() || new Date(),
      changeFrequency: "monthly" as const,
      priority:        0.7,
    }));
  } catch { /* skip */ }

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogSnap = await getDocs(
      query(
        collection(db, "blogPosts"),
        where("isPublished", "==", true)
      )
    );
    blogPages = blogSnap.docs.map((d) => ({
      url:             `${APP_URL}/blog/${d.data().slug}`,
      lastModified:    d.data().publishedAt?.toDate?.() || new Date(),
      changeFrequency: "monthly" as const,
      priority:        0.6,
    }));
  } catch { /* skip */ }

  return [...staticPages, ...productPages, ...servicePages, ...blogPages];
}
