"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getBlogPosts } from "@/lib/firestore";
import { formatDateShort, cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

const CAT_TABS = [
  { id: "all",     label: "All"              },
  { id: "blog",    label: "Blog"             },
  { id: "news",    label: "News"             },
  { id: "article", label: "Engineering Tips" },
];

const CAT_COLOR: Record<string, string> = {
  blog:    "badge-blue",
  news:    "badge-green",
  article: "badge-yellow",
};

export default function BlogPage() {
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");

  useEffect(() => {
    getBlogPosts()
      .then((data) => setPosts(data as BlogPost[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all"
    ? posts
    : posts.filter((p) => p.category === tab);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-14">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl font-bold mb-3">Blog & News</h1>
          <p className="text-primary-200 text-sm max-w-md mx-auto">
            Engineering tips, construction news, and industry updates
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {CAT_TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                tab === id
                  ? "bg-primary-600 text-white"
                  : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-44 w-full" />
                <div className="p-5 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="text-dark-200 mx-auto mb-4" />
            <p className="text-dark-400 text-sm">No posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="card-hover overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-50
                                 overflow-hidden relative">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105
                                 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={40} className="text-primary-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={cn("badge text-xs capitalize",
                      CAT_COLOR[post.category] || "badge-gray")}>
                      {post.category}
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
    </div>
  );
}
