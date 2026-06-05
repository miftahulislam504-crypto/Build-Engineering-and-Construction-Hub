"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Edit2, ChevronRight,
  ChevronDown, X, Loader2, FolderOpen,
} from "lucide-react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateSlug, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<any>(null);
  const [saving,     setSaving]     = useState(false);
  const [expanded,   setExpanded]   = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", slug: "", parentId: "", level: 1, sortOrder: "0", isActive: true,
  });

  useEffect(() => {
    getDocs(query(collection(db, "categories"), orderBy("level"), orderBy("sortOrder")))
      .then((snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  // Build tree structure
  const tree = categories
    .filter((c) => !c.parentId)
    .map((parent) => ({
      ...parent,
      children: categories
        .filter((c) => c.parentId === parent.id)
        .map((sub) => ({
          ...sub,
          children: categories.filter((c) => c.parentId === sub.id),
        })),
    }));

  function toggleExpand(id: string) {
    setExpanded((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id]);
  }

  async function handleSave() {
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const data = {
        name:      form.name,
        slug:      form.slug || generateSlug(form.name),
        parentId:  form.parentId || null,
        level:     form.parentId
          ? (categories.find((c) => c.id === form.parentId)?.level || 1) + 1
          : 1,
        sortOrder: Number(form.sortOrder),
        isActive:  form.isActive,
      };

      if (editing) {
        await updateDoc(doc(db, "categories", editing.id), { ...data, updatedAt: serverTimestamp() });
        setCategories((c) => c.map((x) => x.id === editing.id ? { ...x, ...data } : x));
        toast.success("Category updated!");
      } else {
        const ref = await addDoc(collection(db, "categories"),
          { ...data, createdAt: serverTimestamp() });
        setCategories((c) => [...c, { id: ref.id, ...data }]);
        toast.success("Category added!");
      }
      resetForm();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    const hasChildren = categories.some((c) => c.parentId === id);
    if (hasChildren) { toast.error("Remove child categories first"); return; }
    if (!confirm("Delete this category?")) return;
    await deleteDoc(doc(db, "categories", id));
    setCategories((c) => c.filter((x) => x.id !== id));
    toast.success("Category deleted");
  }

  function startEdit(cat: any) {
    setEditing(cat);
    setForm({
      name: cat.name, slug: cat.slug,
      parentId: cat.parentId || "",
      level: cat.level, sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ name: "", slug: "", parentId: "", level: 1, sortOrder: "0", isActive: true });
    setEditing(null);
    setShowForm(false);
  }

  // Recursive category row
  function CategoryRow({ cat, depth = 0 }: { cat: any; depth?: number }) {
    const hasChildren = cat.children?.length > 0;
    const isExpanded  = expanded.includes(cat.id);

    return (
      <>
        <tr className="hover:bg-dark-50 transition-colors">
          <td className="py-3 px-4">
            <div className="flex items-center gap-2"
              style={{ paddingLeft: `${depth * 20}px` }}>
              {hasChildren && (
                <button onClick={() => toggleExpand(cat.id)}
                  className="text-dark-400 hover:text-dark-600 transition-colors">
                  {isExpanded
                    ? <ChevronDown size={15} />
                    : <ChevronRight size={15} />}
                </button>
              )}
              {!hasChildren && <div className="w-4" />}
              <FolderOpen size={15} className={cn(
                depth === 0 ? "text-primary-500" :
                depth === 1 ? "text-orange-400" : "text-green-400"
              )} />
              <span className="text-sm font-medium text-dark-800">{cat.name}</span>
            </div>
          </td>
          <td className="py-3 px-4">
            <span className="text-xs text-dark-400 font-mono">{cat.slug}</span>
          </td>
          <td className="py-3 px-4">
            <span className={cn("badge text-2xs",
              depth === 0 ? "badge-blue" : depth === 1 ? "badge-yellow" : "badge-green"
            )}>
              Level {cat.level}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className={cn("badge text-2xs",
              cat.isActive ? "badge-green" : "badge-gray"
            )}>
              {cat.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(cat)}
                className="btn-icon btn-ghost text-primary-600 hover:bg-primary-50">
                <Edit2 size={15} />
              </button>
              <button onClick={() => deleteCategory(cat.id)}
                className="btn-icon btn-ghost text-red-400 hover:bg-red-50">
                <Trash2 size={15} />
              </button>
            </div>
          </td>
        </tr>
        {/* Children */}
        {isExpanded && cat.children?.map((child: any) => (
          <CategoryRow key={child.id} cat={child} depth={depth + 1} />
        ))}
      </>
    );
  }

  const parentOptions = categories.filter((c) => c.level < 3);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark-900">Categories</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={17} /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {["Name", "Slug", "Level", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-dark-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map((j) => (
                      <td key={j} className="py-3 px-4"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : tree.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-dark-400 text-sm">
                    No categories yet. Add your first category.
                  </td>
                </tr>
              ) : (
                tree.map((cat) => <CategoryRow key={cat.id} cat={cat} depth={0} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-dark-900">
                {editing ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={resetForm} className="btn-icon btn-ghost">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Category Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm((f) => ({
                    ...f, name: e.target.value,
                    slug: generateSlug(e.target.value),
                  }))}
                  className="input" placeholder="e.g. Cement" />
              </div>
              <div>
                <label className="label">Slug</label>
                <input type="text" value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="input" placeholder="auto-generated" />
              </div>
              <div>
                <label className="label">
                  Parent Category
                  <span className="text-dark-400 font-normal ml-1">(leave empty for top-level)</span>
                </label>
                <select value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="input">
                  <option value="">No parent (Top Level)</option>
                  {parentOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {"—".repeat(c.level - 1)} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input type="number" value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="input" min="0" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-dark-700">Active</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex-1 justify-center">
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : editing ? "Update" : "Add Category"
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
