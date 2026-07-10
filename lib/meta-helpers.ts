// Dynamic metadata helper
// এই code টা products/[slug]/page.tsx এবং services/[slug]/page.tsx তে add করো

// ─────────────────────────────────────────
// products/[slug]/page.tsx এর top-এ add করো:
// ─────────────────────────────────────────

/*
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/firestore";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://buildenginex.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | EngineX Mart",
    };
  }

  return {
    title:       `${product.name} | EngineX Mart`,
    description: product.shortDescription || product.description?.slice(0, 160),
    keywords: [
      product.name,
      product.brand?.name,
      product.category?.name,
      "construction materials Bangladesh",
      "building materials price BD",
    ].filter(Boolean),
    openGraph: {
      title:       `${product.name} — ${product.brand?.name || "EngineX Mart"}`,
      description: product.shortDescription || "",
      images:      product.primaryImage ? [{ url: product.primaryImage }] : [],
      url:         `${APP_URL}/products/${product.slug}`,
      type:        "website",
    },
    twitter: {
      card:        "summary_large_image",
      title:       product.name,
      description: product.shortDescription || "",
      images:      product.primaryImage ? [product.primaryImage] : [],
    },
  };
}
*/

// ─────────────────────────────────────────
// services/[slug]/page.tsx এর top-এ add করো:
// ─────────────────────────────────────────

/*
import type { Metadata } from "next";
import { getServiceBySlug } from "@/lib/firestore";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    return { title: "Service Not Found | EngineX Mart" };
  }

  return {
    title:       `${service.name} | EngineX Mart`,
    description: service.shortDescription || service.description?.slice(0, 160),
    keywords: [
      service.name,
      "engineering services Bangladesh",
      "construction services BD",
      service.serviceCategory,
    ],
    openGraph: {
      title:       `${service.name} | EngineX Mart`,
      description: service.shortDescription || "",
      images:      service.images?.[0] ? [{ url: service.images[0] }] : [],
    },
  };
}
*/

// ─────────────────────────────────────────
// blog/[slug]/page.tsx এর top-এ add করো:
// ─────────────────────────────────────────

/*
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const posts = await queryCollection(
    "blogPosts",
    where("slug", "==", params.slug),
    limit(1)
  );
  const post = posts[0];

  if (!post) return { title: "Post Not Found | EngineX Mart" };

  return {
    title:       `${post.title} | EngineX Mart`,
    description: post.excerpt || post.content?.slice(0, 160),
    openGraph: {
      title:       post.title,
      description: post.excerpt || "",
      images:      post.thumbnail ? [{ url: post.thumbnail }] : [],
      type:        "article",
    },
  };
}
*/

export {};
