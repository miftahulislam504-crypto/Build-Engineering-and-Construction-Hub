"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Edit2, Trash2, ToggleLeft,
  ToggleRight, ChevronUp, ChevronDown, Package,
} from "lucide-react";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState("createdAt");
  const [sortDir,  setSortDir]  = useState<"asc"|"desc">("desc");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...products];
    if (search) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    result.sort((a, b) => {
      const va = a[sortKey] || 0;
      const vb = b[sortKey] || 0;
      return sortDir === "asc"
        ? (va > vb ? 1 : -1)
        : (va < vb ? 1 : -1);
    });
    setFiltered(result);
  }, [search, products, sortKey, sortDir]);

  async function toggleActive(id: string, current: boolean) {
    await updateDoc(doc(db, "products", id), {
      isActive: !current, updatedAt: serverTimestamp(),
    });
    setProducts((p) =>
      p.map((x) => x.id === id ? { ...x, isActive: !current } : x)
    );
    toast.success(`Product ${!current ? "activated" : "deactivated"}`);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((p) => p.filter((x) => x.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function SortButton({ k, label }: { k: string; label: string }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => { setSortKey(k); setSortDir(active && sortDir === "asc" ? "desc" : "asc"); }}
        className="flex items-center gap-1 hover:text-primary-600 transition-colors"
      >
        {label}
        {active
          ? sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
          : <ChevronDown size={13} className="opacity-30" />}
      </button>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Products</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <Link href="/admin/products/add" className="btn-primary">
          <Plus size={17} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-dark-600 text-xs">
                  Product
                </th>
                <th className="text-left py-3 px-4 font-semibold text-dark-600 text-xs hidden md:table-cell">
                  <SortButton k="price" label="Price" />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-dark-600 text-xs hidden sm:table-cell">
                  <SortButton k="stockQuantity" label="Stock" />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-dark-600 text-xs hidden lg:table-cell">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-dark-600 text-xs">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-dark-600 text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5,6].map((j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="skeleton h-4 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-dark-400">
                    <Package size={36} className="mx-auto mb-2 text-dark-200" />
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-50 transition-colors">
                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-100 flex-shrink-0">
                          <img src={p.primaryImage || "/images/placeholder.png"}
                            alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dark-800 truncate max-w-[180px]">
                            {p.name}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {p.brand?.name || "No brand"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Price */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="font-semibold text-dark-800">
                        {formatPrice(p.discountPrice || p.price)}
                      </p>
                      {p.discountPrice && (
                        <p className="text-xs text-dark-400 line-through">
                          {formatPrice(p.price)}
                        </p>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={cn(
                        "badge text-xs",
                        p.stockQuantity === 0  ? "badge-red"    :
                        p.stockQuantity <= 10  ? "badge-yellow" : "badge-green"
                      )}>
                        {p.stockQuantity} {p.unit}
                      </span>
                    </td>
                    {/* Type */}
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="badge-gray badge text-xs capitalize">
                        {p.productType}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleActive(p.id, p.isActive)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium transition-colors",
                          p.isActive ? "text-green-600" : "text-dark-400"
                        )}
                      >
                        {p.isActive
                          ? <ToggleRight size={18} className="text-green-500" />
                          : <ToggleLeft size={18} />
                        }
                        {p.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${p.id}`}
                          className="btn-icon btn-ghost text-primary-600 hover:bg-primary-50">
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={deleting === p.id}
                          className="btn-icon btn-ghost text-red-400 hover:bg-red-50
                                     hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
