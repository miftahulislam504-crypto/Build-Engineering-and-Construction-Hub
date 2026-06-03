"use client";
// components/home/BlogSection.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getBlogPosts } from "@/lib/firestore";
import { formatDateShort } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

const FALLBACK: Partial<BlogPost>[] = [
  {
    id:        "1",
    title:     "How to Choose the Right Grade of Cement for Your Project",
    excerpt:   "Understanding cement grades and their applications is crucial for structural integrity.",
    category:  "article",
    thumbnail: "",
    publishedAt: new Date("2024-05-01"),
  },
  {
    id:        "2",
    title:     "Steel Rod Price Update — June 2024",
    excerpt:   "Latest BSRM and GPH Ispat steel rod prices in the Bangladesh market.",
    category:  "news",
    thumbnail: "",
    publishedAt: new Date("2024-06-10"),
  },
  {
    id:        "3",
    title:     "Complete Guide to Waterproofing Your Roof",
    excerpt:   "Step-by-step guide using Sika and Dr Fixit waterproofing products.",
    category:  "blog",
    thumbnail: "",
    publishedAt: new Date("2024-06-12"),
  },
];

const CAT_COLORS: Record<string, string> = {
  blog:    "badge-blue",
  news:    "badge-green",
  article: "badge-yellow",
};

export default function BlogSection() {
  const [posts,   setPosts]   = useState<Partial<BlogPost>[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then((d) => { if (d.length > 0) setPosts(d as BlogPost[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-10 bg-dark-50">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <BookOpen size={18} className="text-primary-700" />
            </div>
            <h2 className="section-title mb-0">Latest Articles</h2>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-sm text-primary-600
                       hover:text-primary-700 font-medium transition-colors"
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug || post.id}`}
              className="card-hover overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-50
                               overflow-hidden relative">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105
                               transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={40} className="text-primary-200" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`badge text-xs ${CAT_COLORS[post.category || "blog"]}`}>
                    {post.category?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-dark-800 mb-2
                               line-clamp-2 text-sm leading-snug
                               group-hover:text-primary-700 transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-dark-500 line-clamp-2 mb-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <p className="text-xs text-dark-400">
                  {post.publishedAt && formatDateShort(post.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
