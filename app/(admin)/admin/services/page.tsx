"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Edit2, Trash2, ToggleLeft,
  ToggleRight, Wrench,
} from "lucide-react";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const SERVICE_CATEGORY_COLOR: Record<string, string> = {
  design:       "badge-blue",
  construction: "badge-yellow",
  consultancy:  "badge-green",
  survey:       "badge-gray",
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, "services"), orderBy("createdAt", "desc")))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setServices(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(services); return; }
    setFiltered(services.filter((s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.serviceCategory?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, services]);

  async function toggleActive(id: string, current: boolean) {
    await updateDoc(doc(db, "services", id), {
      isActive: !current, updatedAt: serverTimestamp(),
    });
    setServices((s) => s.map((x) => x.id === id ? { ...x, isActive: !current } : x));
    toast.success(`Service ${!current ? "activated" : "deactivated"}`);
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "services", id));
      setServices((s) => s.filter((x) => x.id !== id));
      toast.success("Service deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Services</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {filtered.length} of {services.length} services
          </p>
        </div>
        <Link href="/admin/services/add" className="btn-primary">
          <Plus size={17} /> Add Service
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4 max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="input pl-10" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {["Service", "Category", "Starting Price", "Packages", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-dark-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5,6].map((j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="skeleton h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-dark-400">
                    <Wrench size={36} className="mx-auto mb-2 text-dark-200" />
                    No services found
                  </td>
                </tr>
              ) : (
                filtered.map((svc) => (
                  <tr key={svc.id} className="hover:bg-dark-50 transition-colors">
                    {/* Service */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center
                                         justify-center flex-shrink-0 text-lg">
                          {svc.serviceCategory === "design"       ? "✏️" :
                           svc.serviceCategory === "construction" ? "🏗️" :
                           svc.serviceCategory === "consultancy"  ? "📋" : "🗺️"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dark-800 truncate max-w-[180px]">
                            {svc.name}
                          </p>
                          <p className="text-xs text-dark-400 truncate max-w-[180px]">
                            {svc.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className={cn(
                        "badge text-xs capitalize",
                        SERVICE_CATEGORY_COLOR[svc.serviceCategory] || "badge-gray"
                      )}>
                        {svc.serviceCategory}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-primary-700 text-sm">
                        {formatPrice(svc.startingPrice)}
                      </p>
                    </td>
                    {/* Packages */}
                    <td className="py-3 px-4">
                      <span className="badge-gray badge text-xs">
                        {svc.packages?.length || 0} packages
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleActive(svc.id, svc.isActive)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium transition-colors",
                          svc.isActive ? "text-green-600" : "text-dark-400"
                        )}
                      >
                        {svc.isActive
                          ? <ToggleRight size={18} className="text-green-500" />
                          : <ToggleLeft size={18} />}
                        {svc.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/services/${svc.id}`}
                          className="btn-icon btn-ghost text-primary-600 hover:bg-primary-50">
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => deleteService(svc.id)}
                          disabled={deleting === svc.id}
                          className="btn-icon btn-ghost text-red-400 hover:bg-red-50
                                     disabled:opacity-50"
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
