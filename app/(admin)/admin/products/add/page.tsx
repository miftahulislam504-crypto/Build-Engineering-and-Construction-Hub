"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Upload,
  Loader2, Save, X,
} from "lucide-react";
import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { generateSlug, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const UNITS = ["bag", "ton", "pcs", "sqft", "rft", "cft", "bundle", "liter", "kg", "set", "roll"];

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [brands,     setBrands]     = useState<any[]>([]);

  const [form, setForm] = useState({
    name:             "",
    slug:             "",
    shortDescription: "",
    description:      "",
    categoryId:       "",
    brandId:          "",
    productType:      "dealership",
    price:            "",
    discountPrice:    "",
    stockQuantity:    "",
    unit:             "bag",
    isFeatured:       false,
    isTrending:       false,
    isBestSelling:    false,
    isNewArrival:     false,
    isActive:         true,
  });

  const [specs,     setSpecs]     = useState([{ key: "", value: "" }]);
  const [variants,  setVariants]  = useState<any[]>([]);
  const [images,    setImages]    = useState<File[]>([]);
  const [previews,  setPreviews]  = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, "categories"), orderBy("name")))
      .then((s) => setCategories(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    getDocs(query(collection(db, "brands"), orderBy("name")))
      .then((s) => setBrands(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, []);

  function updateForm(k: string, v: any) {
    setForm((f) => ({
      ...f, [k]: v,
      ...(k === "name" ? { slug: generateSlug(v) } : {}),
    }));
  }

  // Images
  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("Max 5 images"); return;
    }
    setImages((i) => [...i, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((p) => [...p, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removeImage(idx: number) {
    setImages((i) => i.filter((_, j) => j !== idx));
    setPreviews((p) => p.filter((_, j) => j !== idx));
  }

  // Specs
  function addSpec()    { setSpecs((s) => [...s, { key: "", value: "" }]); }
  function removeSpec(i: number) { setSpecs((s) => s.filter((_, j) => j !== i)); }
  function updateSpec(i: number, k: "key"|"value", v: string) {
    setSpecs((s) => s.map((x, j) => j === i ? { ...x, [k]: v } : x));
  }

  // Variants
  function addVariant() { setVariants((v) => [...v, { name: "", price: "", stock: "" }]); }
  function removeVariant(i: number) { setVariants((v) => v.filter((_, j) => j !== i)); }
  function updateVariant(i: number, k: string, v: string) {
    setVariants((vv) => vv.map((x, j) => j === i ? { ...x, [k]: v } : x));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Fill required fields (name, price, category)"); return;
    }

    setSaving(true);
    setUploading(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of images) {
        const r = ref(storage, `products/${Date.now()}-${file.name}`);
        await uploadBytes(r, file);
        imageUrls.push(await getDownloadURL(r));
      }
      setUploading(false);

      // Build specifications object
      const specifications: Record<string, string> = {};
      specs.filter((s) => s.key && s.value)
        .forEach((s) => { specifications[s.key] = s.value; });

      // Build variants array
      const variantData = variants
        .filter((v) => v.name && v.price)
        .map((v) => ({
          name:  v.name,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
        }));

      await addDoc(collection(db, "products"), {
        name:             form.name,
        slug:             form.slug || generateSlug(form.name),
        shortDescription: form.shortDescription,
        description:      form.description,
        categoryId:       form.categoryId,
        brandId:          form.brandId || null,
        productType:      form.productType,
        price:            Number(form.price),
        discountPrice:    form.discountPrice ? Number(form.discountPrice) : null,
        stockQuantity:    Number(form.stockQuantity) || 0,
        unit:             form.unit,
        images:           imageUrls,
        primaryImage:     imageUrls[0] || "",
        specifications,
        variants:         variantData,
        isFeatured:       form.isFeatured,
        isTrending:       form.isTrending,
        isBestSelling:    form.isBestSelling,
        isNewArrival:     form.isNewArrival,
        isActive:         form.isActive,
        viewCount:        0,
        avgRating:        0,
        reviewCount:      0,
        createdAt:        serverTimestamp(),
        updatedAt:        serverTimestamp(),
      });

      toast.success("Product added successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="btn-icon btn-ghost">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Add Product</h1>
          <p className="text-dark-400 text-sm">Fill in the product details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-dark-800">Basic Information</h2>

          <div>
            <label className="label">Product Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              className="input" placeholder="e.g. Holcim OPC Cement 50kg" required />
          </div>

          <div>
            <label className="label">URL Slug</label>
            <input type="text" value={form.slug}
              onChange={(e) => updateForm("slug", e.target.value)}
              className="input" placeholder="auto-generated" />
          </div>

          <div>
            <label className="label">Short Description</label>
            <input type="text" value={form.shortDescription}
              onChange={(e) => updateForm("shortDescription", e.target.value)}
              className="input" placeholder="One-line description" />
          </div>

          <div>
            <label className="label">Full Description</label>
            <textarea value={form.description} rows={4}
              onChange={(e) => updateForm("description", e.target.value)}
              className="input resize-none" placeholder="Detailed product description..." />
          </div>
        </div>

        {/* Category & Brand */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-dark-800">Category & Brand</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select value={form.categoryId}
                onChange={(e) => updateForm("categoryId", e.target.value)}
                className="input" required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <select value={form.brandId}
                onChange={(e) => updateForm("brandId", e.target.value)}
                className="input">
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Product Type</label>
              <select value={form.productType}
                onChange={(e) => updateForm("productType", e.target.value)}
                className="input">
                <option value="dealership">Dealership</option>
                <option value="contract">Contract Material</option>
                <option value="essential">Construction Essential</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-dark-800">Pricing & Stock</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Price (৳) <span className="text-red-500">*</span></label>
              <input type="number" value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                className="input" placeholder="0" min="0" required />
            </div>
            <div>
              <label className="label">Discount Price (৳)</label>
              <input type="number" value={form.discountPrice}
                onChange={(e) => updateForm("discountPrice", e.target.value)}
                className="input" placeholder="0" min="0" />
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input type="number" value={form.stockQuantity}
                onChange={(e) => updateForm("stockQuantity", e.target.value)}
                className="input" placeholder="0" min="0" />
            </div>
            <div>
              <label className="label">Unit</label>
              <select value={form.unit}
                onChange={(e) => updateForm("unit", e.target.value)}
                className="input">
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-dark-800">Product Images (Max 5)</h2>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={src} alt={`preview-${i}`}
                  className="w-full h-full object-cover rounded-xl border border-dark-200" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full
                             text-white flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="w-24 h-24 border-2 border-dashed border-dark-200
                                 rounded-xl flex flex-col items-center justify-center
                                 cursor-pointer hover:border-primary-300 hover:bg-primary-50
                                 transition-all text-dark-400">
                <Upload size={20} />
                <span className="text-2xs mt-1">Add Image</span>
                <input type="file" accept="image/*" multiple onChange={handleImages}
                  className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-800">Specifications</h2>
            <button type="button" onClick={addSpec} className="btn-secondary btn-sm">
              <Plus size={14} /> Add
            </button>
          </div>
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={spec.key}
                onChange={(e) => updateSpec(i, "key", e.target.value)}
                className="input flex-1" placeholder="e.g. Weight" />
              <input type="text" value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className="input flex-1" placeholder="e.g. 50kg" />
              {specs.length > 1 && (
                <button type="button" onClick={() => removeSpec(i)}
                  className="text-red-400 hover:text-red-600 transition-colors px-2">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Variants */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-800">Variants (Optional)</h2>
            <button type="button" onClick={addVariant} className="btn-secondary btn-sm">
              <Plus size={14} /> Add Variant
            </button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input type="text" value={v.name}
                onChange={(e) => updateVariant(i, "name", e.target.value)}
                className="input" placeholder="Name (e.g. 20mm)" />
              <input type="number" value={v.price}
                onChange={(e) => updateVariant(i, "price", e.target.value)}
                className="input" placeholder="Price" />
              <div className="flex gap-2">
                <input type="number" value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  className="input flex-1" placeholder="Stock" />
                <button type="button" onClick={() => removeVariant(i)}
                  className="text-red-400 hover:text-red-600 px-2">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Visibility Flags */}
        <div className="card p-6">
          <h2 className="font-semibold text-dark-800 mb-4">Visibility</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: "isActive",      label: "Active"       },
              { key: "isFeatured",    label: "Featured"     },
              { key: "isTrending",    label: "Trending"     },
              { key: "isBestSelling", label: "Best Selling" },
              { key: "isNewArrival",  label: "New Arrival"  },
            ].map(({ key, label }) => (
              <label key={key}
                className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl
                           border border-dark-100 hover:border-primary-300 transition-all">
                <input type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => updateForm(key, e.target.checked)}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-dark-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link href="/admin/products" className="btn-secondary flex-1 justify-center">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="btn-primary flex-1 justify-center btn-lg">
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {uploading ? "Uploading Images..." : "Saving..."}
              </>
            ) : (
              <><Save size={18} /> Add Product</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
