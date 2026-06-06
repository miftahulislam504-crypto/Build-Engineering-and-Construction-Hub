"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, BookOpen } from "lucide-react";
import { queryCollection, getBlogPosts } from "@/lib/firestore";
import { formatDate, cn } from "@/lib/utils";
import { where, limit } from "firebase/firestore";
import type { BlogPost } from "@/lib/types";

const CAT_COLOR: Record<string, string> = {
  blog:    "badge-blue",
  news:    "badge-green",
  article: "badge-yellow",
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post,    setPost]    = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    queryCollection("blogPosts",
      where("slug", "==", slug as string),
      where("isPublished", "==", true),
      limit(1)
    ).then(async (posts) => {
      if (posts.length === 0) { setLoading(false); return; }
      const p = posts[0] as BlogPost;
      setPost(p);
      // Related posts
      const rel = await getBlogPosts(p.category);
      setRelated((rel as BlogPost[]).filter((r) => r.id !== p.id).slice(0, 3));
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-main py-10 max-w-3xl">
        <div className="skeleton h-8 w-3/4 rounded mb-4" />
        <div className="skeleton h-64 rounded-2xl mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-4 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-main py-16 text-center">
        <BookOpen size={48} className="text-dark-200 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">Post not found.</p>
        <Link href="/blog" className="btn-primary inline-flex">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container-main py-8">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-dark-400 mb-6">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-primary-600">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-dark-600 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Category & date */}
          <div className="flex items-center gap-3 mb-4">
            <span className={cn("badge text-xs capitalize",
              CAT_COLOR[post.category] || "badge-gray")}>
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-dark-400">
              <Calendar size={12} />
              {post.publishedAt
                ? formatDate(
                    (post.publishedAt as any)?.toDate?.()
                      ? (post.publishedAt as any).toDate()
                      : post.publishedAt
                  )
                : "—"}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl font-bold text-dark-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-dark-500 text-base leading-relaxed mb-6 border-l-4
                           border-primary-500 pl-4 italic">
              {post.excerpt}
            </p>
          )}

          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="rounded-2xl overflow-hidden mb-8">
              <img src={post.thumbnail} alt={post.title}
                className="w-full h-64 object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none text-dark-600 leading-relaxed space-y-4">
            {post.content?.split("\n").map((para, i) => (
              para.trim() ? (
                <p key={i} className="text-sm leading-relaxed text-dark-600">
                  {para}
                </p>
              ) : <br key={i} />
            ))}
          </div>

          {/* Tags / back link */}
          <div className="mt-10 pt-6 border-t border-dark-100">
            <Link href="/blog"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium
                         transition-colors flex items-center gap-1.5">
              <ChevronRight size={14} className="rotate-180" />
              Back to Blog
            </Link>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl font-bold text-dark-900 mb-5">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.id} href={`/blog/${r.slug}`}
                    className="card-hover overflow-hidden group">
                    <div className="h-28 bg-primary-50 overflow-hidden">
                      {r.thumbnail ? (
                        <img src={r.thumbnail} alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105
                                     transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={24} className="text-primary-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-dark-700 line-clamp-2
                                     group-hover:text-primary-700 transition-colors">
                        {r.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
