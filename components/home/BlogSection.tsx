"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useLatestBlogPosts } from "@/hooks/useProducts";
import { formatDateShort, cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

const CAT_COLORS: Record<string, string> = {
  blog:    "badge-blue",
  news:    "badge-green",
  article: "badge-yellow",
};

export default function BlogSection() {
  const { data: posts, isLoading } = useLatestBlogPosts();

  if (!isLoading && (!posts || posts.length === 0)) return null;

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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-44 w-full" />
                <div className="p-5 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(posts as BlogPost[]).slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="card-hover overflow-hidden group"
              >
                <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-50
                                overflow-hidden relative">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105
                                 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={40} className="text-primary-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={cn("badge text-xs capitalize",
                      CAT_COLORS[post.category] || "badge-gray")}>
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-dark-800 mb-2
                                 line-clamp-2 text-sm leading-snug
                                 group-hover:text-primary-700 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-dark-500 line-clamp-2 mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-dark-400">
                    {post.publishedAt
                      ? formatDateShort(
                          (post.publishedAt as any)?.toDate?.()
                            ? (post.publishedAt as any).toDate()
                            : post.publishedAt
                        )
                      : "—"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
