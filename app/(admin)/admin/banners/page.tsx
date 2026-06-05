"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, ToggleLeft, ToggleRight,
  Upload, X, Loader2, Image,
} from "lucide-react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const POSITIONS = ["hero", "promo", "category"];

export default function AdminBannersPage() {
  const [banners,  setBanners]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    title:     "",
    link:      "",
    position:  "hero",
    sortOrder: "0",
    isActive:  true,
  });
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    getDocs(query(collection(db, "banners"), orderBy("sortOrder", "asc")))
      .then((snap) => setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.title) { toast.error("Title is required"); return; }
    if (!imageFile && !imagePreview) { toast.error("Image is required"); return; }
    setSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        const r = ref(storage, `banners/${Date.now()}-${imageFile.name}`);
        await uploadBytes(r, imageFile);
        imageUrl = await getDownloadURL(r);
      }
      const newBanner = {
        title:     form.title,
        imageUrl,
        link:      form.link,
        position:  form.position,
        sortOrder: Number(form.sortOrder),
        isActive:  form.isActive,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "banners"), newBanner);
      setBanners((b) => [...b, { id: docRef.id, ...newBanner, imageUrl }]);
      toast.success("Banner added!");
      resetForm();
    } catch {
      toast.error("Failed to add banner");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await updateDoc(doc(db, "banners", id), { isActive: !current });
    setBanners((b) => b.map((x) => x.id === id ? { ...x, isActive: !current } : x));
    toast.success(`Banner ${!current ? "activated" : "deactivated"}`);
  }

  async function deleteBanner(id: string) {
    if (!confirm("Delete this banner?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "banners", id));
      setBanners((b) => b.filter((x) => x.id !== id));
      toast.success("Banner deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function resetForm() {
    setForm({ title: "", link: "", position: "hero", sortOrder: "0", isActive: true });
    setImageFile(null);
    setImagePreview("");
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark-900">Banners</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={17} /> Add Banner
        </button>
      </div>

      {/* Banner list by position */}
      {POSITIONS.map((pos) => {
        const posBanners = banners.filter((b) => b.position === pos);
        if (!loading && posBanners.length === 0) return null;
        return (
          <div key={pos} className="card overflow-hidden">
            <div className="px-5 py-3 bg-dark-50 border-b border-dark-100">
              <p className="font-semibold text-dark-700 text-sm capitalize">
                {pos} Banners
                <span className="ml-2 badge-gray badge text-2xs">{posBanners.length}</span>
              </p>
            </div>
            <div className="divide-y divide-dark-100">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="skeleton w-32 h-16 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-48 rounded" />
                      <div className="skeleton h-3 w-32 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                posBanners.map((banner) => (
                  <div key={banner.id}
                    className="flex items-center gap-4 p-4 hover:bg-dark-50 transition-colors">
                    {/* Preview */}
                    <div className="w-32 h-16 rounded-xl overflow-hidden bg-dark-100 flex-shrink-0">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.title}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image size={20} className="text-dark-300" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-800 text-sm truncate">
                        {banner.title}
                      </p>
                      {banner.link && (
                        <p className="text-xs text-dark-400 truncate mt-0.5">
                          {banner.link}
                        </p>
                      )}
                      <p className="text-xs text-dark-400 mt-0.5">
                        Sort order: {banner.sortOrder}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(banner.id, banner.isActive)}
                        className={cn(
                          "flex items-center gap-1 text-xs font-medium transition-colors",
                          banner.isActive ? "text-green-600" : "text-dark-400"
                        )}
                      >
                        {banner.isActive
                          ? <ToggleRight size={20} className="text-green-500" />
                          : <ToggleLeft size={20} />}
                        {banner.isActive ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        disabled={deleting === banner.id}
                        className="btn-icon btn-ghost text-red-400 hover:text-red-600
                                   hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Add Banner Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg p-6
                           animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-dark-900">Add Banner</h2>
              <button onClick={resetForm} className="btn-icon btn-ghost">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="label">Banner Image</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="preview"
                      className="w-full h-40 object-cover rounded-xl border border-dark-200" />
                    <button
                      onClick={() => { setImageFile(null); setImagePreview(""); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full
                                 text-white flex items-center justify-center">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-40 border-2 border-dashed border-dark-200
                                     rounded-xl flex flex-col items-center justify-center
                                     cursor-pointer hover:border-primary-300 hover:bg-primary-50
                                     transition-all text-dark-400">
                    <Upload size={28} className="mb-2" />
                    <span className="text-sm">Click to upload banner image</span>
                    <span className="text-xs mt-1">Recommended: 1400×500px, Max 5MB</span>
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="label">Title</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="input" placeholder="Banner title" />
              </div>

              <div>
                <label className="label">
                  Link URL
                  <span className="text-dark-400 font-normal ml-1">(optional)</span>
                </label>
                <input type="text" value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  className="input" placeholder="/products or /services" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Position</label>
                  <select value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    className="input">
                    {POSITIONS.map((p) => (
                      <option key={p} value={p} className="capitalize">{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Sort Order</label>
                  <input type="number" value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    className="input" min="0" />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-dark-700">Active (visible on website)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex-1 justify-center">
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    "Add Banner"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
