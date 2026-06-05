"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Edit2, Eye, EyeOff,
  X, Loader2, BookOpen,
} from "lucide-react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateSlug, formatDateShort, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = ["blog", "news", "article"];

export default function AdminBlogPage() {
  const [posts,    setPosts]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState("all");

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "",
    category: "blog", thumbnail: "", isPublished: false,
  });

  useEffect(() => {
    getDocs(query(collection(db, "blogPosts"), orderBy("createdAt", "desc")))
      .then((snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? posts : posts.filter((p) => p.category === tab);

  async function handleSave() {
    if (!form.title || !form.content) {
      toast.error("Title and content are required"); return;
    }
    setSaving(true);
    try {
      const data = {
        title:       form.title,
        slug:        form.slug || generateSlug(form.title),
        excerpt:     form.excerpt,
        content:     form.content,
        category:    form.category,
        thumbnail:   form.thumbnail,
        isPublished: form.isPublished,
        publishedAt: form.isPublished ? new Date() : null,
      };
      if (editing) {
        await updateDoc(doc(db, "blogPosts", editing.id),
          { ...data, updatedAt: serverTimestamp() });
        setPosts((p) => p.map((x) => x.id === editing.id ? { ...x, ...data } : x));
        toast.success("Post updated!");
      } else {
        const ref = await addDoc(collection(db, "blogPosts"),
          { ...data, authorId: "admin", createdAt: serverTimestamp() });
        setPosts((p) => [{ id: ref.id, ...data }, ...p]);
        toast.success("Post created!");
      }
      resetForm();
    } catch {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await updateDoc(doc(db, "blogPosts", id), {
      isPublished: !current,
      publishedAt: !current ? new Date() : null,
      updatedAt:   serverTimestamp(),
    });
    setPosts((p) => p.map((x) => x.id === id ? { ...x, isPublished: !current } : x));
    toast.success(`Post ${!current ? "published" : "unpublished"}`);
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "blogPosts", id));
    setPosts((p) => p.filter((x) => x.id !== id));
    toast.success("Post deleted");
  }

  function startEdit(post: any) {
    setEditing(post);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || "",
      content: post.content, category: post.category,
      thumbnail: post.thumbnail || "", isPublished: post.isPublished,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ title: "", slug: "", excerpt: "", content: "", category: "blog", thumbnail: "", isPublished: false });
    setEditing(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark-900">Blog & Content</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={17} /> New Post
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {["all", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setTab(c)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
              tab === c
                ? "bg-primary-600 text-white"
                : "bg-dark-100 text-dark-600 hover:bg-dark-200"
            )}>
            {c}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="card p-14 text-center">
            <BookOpen size={40} className="text-dark-200 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No posts yet</p>
          </div>
        ) : (
          filtered.map((post) => (
            <div key={post.id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={cn(
                      "badge text-2xs capitalize",
                      post.category === "blog"    ? "badge-blue"   :
                      post.category === "news"    ? "badge-green"  : "badge-yellow"
                    )}>
                      {post.category}
                    </span>
                    <span className={cn(
                      "badge text-2xs",
                      post.isPublished ? "badge-green" : "badge-gray"
                    )}>
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-dark-800 text-sm mb-1">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-dark-500 line-clamp-1 mb-1">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-dark-400">
                    {post.createdAt?.toDate
                      ? formatDateShort(post.createdAt.toDate())
                      : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(post.id, post.isPublished)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                      post.isPublished
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    )}
                  >
                    {post.isPublished
                      ? <><EyeOff size={13} /> Unpublish</>
                      : <><Eye size={13} /> Publish</>
                    }
                  </button>
                  <button onClick={() => startEdit(post)}
                    className="btn-icon btn-ghost text-primary-600 hover:bg-primary-50">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => deletePost(post.id)}
                    className="btn-icon btn-ghost text-red-400 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl p-6
                           animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-dark-900">
                {editing ? "Edit Post" : "New Post"}
              </h2>
              <button onClick={resetForm} className="btn-icon btn-ghost"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm((f) => ({
                    ...f, title: e.target.value, slug: generateSlug(e.target.value),
                  }))}
                  className="input" placeholder="Post title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Slug</label>
                  <input type="text" value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="input" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="input">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Excerpt (short summary)</label>
                <input type="text" value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="input" placeholder="One-line summary..." />
              </div>
              <div>
                <label className="label">Thumbnail URL</label>
                <input type="text" value={form.thumbnail}
                  onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                  className="input" placeholder="https://..." />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea value={form.content} rows={8}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="input resize-none font-mono text-xs"
                  placeholder="Write your post content here..." />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-dark-700">Publish immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex-1 justify-center">
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : editing ? "Update Post" : "Create Post"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
