"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Loader2, Star } from "lucide-react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateSlug, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminBrandsPage() {
  const [brands,     setBrands]     = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<any>(null);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");

  const [form, setForm] = useState({
    name: "", slug: "", categoryId: "",
    description: "", isFeatured: false, isActive: true,
  });

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, "brands"), orderBy("name"))),
      getDocs(query(collection(db, "categories"), orderBy("name"))),
    ]).then(([brandsSnap, catsSnap]) => {
      setBrands(brandsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCategories(catsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = brands.filter((b) =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!form.name) { toast.error("Brand name required"); return; }
    setSaving(true);
    try {
      const data = {
        name:        form.name,
        slug:        form.slug || generateSlug(form.name),
        categoryId:  form.categoryId || null,
        description: form.description,
        isFeatured:  form.isFeatured,
        isActive:    form.isActive,
        sortOrder:   0,
      };
      if (editing) {
        await updateDoc(doc(db, "brands", editing.id),
          { ...data, updatedAt: serverTimestamp() });
        setBrands((b) => b.map((x) => x.id === editing.id ? { ...x, ...data } : x));
        toast.success("Brand updated!");
      } else {
        const ref = await addDoc(collection(db, "brands"),
          { ...data, createdAt: serverTimestamp() });
        setBrands((b) => [...b, { id: ref.id, ...data }]);
        toast.success("Brand added!");
      }
      resetForm();
    } catch {
      toast.error("Failed to save brand");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBrand(id: string) {
    if (!confirm("Delete this brand?")) return;
    await deleteDoc(doc(db, "brands", id));
    setBrands((b) => b.filter((x) => x.id !== id));
    toast.success("Brand deleted");
  }

  async function toggleFeatured(id: string, current: boolean) {
    await updateDoc(doc(db, "brands", id), { isFeatured: !current });
    setBrands((b) => b.map((x) => x.id === id ? { ...x, isFeatured: !current } : x));
  }

  function startEdit(brand: any) {
    setEditing(brand);
    setForm({
      name: brand.name, slug: brand.slug,
      categoryId: brand.categoryId || "",
      description: brand.description || "",
      isFeatured: brand.isFeatured, isActive: brand.isActive,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ name: "", slug: "", categoryId: "", description: "", isFeatured: false, isActive: true });
    setEditing(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark-900">Brands</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={17} /> Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 max-w-sm">
        <input type="text" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="input" />
      </div>

      {/* Brands grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((brand) => (
            <div key={brand.id} className="card p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center
                                 justify-center text-primary-700 font-bold text-lg">
                  {brand.name?.[0]}
                </div>
                <button
                  onClick={() => toggleFeatured(brand.id, brand.isFeatured)}
                  className={cn(
                    "transition-colors",
                    brand.isFeatured ? "text-yellow-400" : "text-dark-200 hover:text-yellow-400"
                  )}
                >
                  <Star size={16} fill={brand.isFeatured ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="font-semibold text-dark-800 text-sm mb-0.5">{brand.name}</p>
              <p className="text-xs text-dark-400 mb-3">
                {categories.find((c) => c.id === brand.categoryId)?.name || "No category"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "badge text-2xs flex-1 justify-center",
                  brand.isActive ? "badge-green" : "badge-gray"
                )}>
                  {brand.isActive ? "Active" : "Inactive"}
                </span>
                <button onClick={() => startEdit(brand)}
                  className="btn-icon btn-ghost text-primary-600 hover:bg-primary-50 p-1.5">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteBrand(brand.id)}
                  className="btn-icon btn-ghost text-red-400 hover:bg-red-50 p-1.5">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-dark-900">
                {editing ? "Edit Brand" : "Add Brand"}
              </h2>
              <button onClick={resetForm} className="btn-icon btn-ghost"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Brand Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm((f) => ({
                    ...f, name: e.target.value, slug: generateSlug(e.target.value),
                  }))}
                  className="input" placeholder="e.g. Holcim" />
              </div>
              <div>
                <label className="label">Slug</label>
                <input type="text" value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="input" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="input">
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  Description
                  <span className="text-dark-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea value={form.description} rows={2}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="input resize-none" placeholder="Brand description..." />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                    className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm text-dark-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm text-dark-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex-1 justify-center">
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : editing ? "Update" : "Add Brand"
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
