"use client";

import { useEffect, useState } from "react";
import { Search, Users, Mail, Phone, Ban, CheckCircle2 } from "lucide-react";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDateShort, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    getDocs(query(
      collection(db, "users"),
      where("role", "==", "customer"),
      orderBy("createdAt", "desc")
    ))
      .then((snap) => setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  async function toggleActive(id: string, current: boolean) {
    await updateDoc(doc(db, "users", id), {
      isActive: !current, updatedAt: serverTimestamp(),
    });
    setCustomers((c) => c.map((x) => x.id === id ? { ...x, isActive: !current } : x));
    toast.success(`Customer ${!current ? "activated" : "blocked"}`);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Customers</h1>
        <p className="text-dark-400 text-sm mt-0.5">
          {filtered.length} customers found
        </p>
      </div>

      {/* Search */}
      <div className="card p-4 max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="input pl-10" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {["Customer", "Contact", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-dark-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map((j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="skeleton h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-dark-400 text-sm">
                    <Users size={36} className="mx-auto mb-2 text-dark-200" />
                    No customers found
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-dark-50 transition-colors">
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt={customer.name}
                            className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-primary-100
                                           flex items-center justify-center">
                            <span className="text-primary-700 font-bold text-sm">
                              {customer.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-dark-800 text-sm">
                            {customer.name}
                          </p>
                          <p className="text-xs text-dark-400 truncate max-w-[140px]">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="text-xs text-dark-600 flex items-center gap-1">
                          <Mail size={11} className="text-dark-400" />
                          {customer.email}
                        </p>
                        {customer.phone && (
                          <p className="text-xs text-dark-500 flex items-center gap-1">
                            <Phone size={11} className="text-dark-400" />
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    {/* Joined */}
                    <td className="py-3 px-4">
                      <p className="text-xs text-dark-500">
                        {customer.createdAt?.toDate
                          ? formatDateShort(customer.createdAt.toDate())
                          : "—"}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={cn(
                        "badge text-xs",
                        customer.isActive !== false ? "badge-green" : "badge-red"
                      )}>
                        {customer.isActive !== false ? "Active" : "Blocked"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleActive(customer.id, customer.isActive !== false)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          customer.isActive !== false
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        )}
                      >
                        {customer.isActive !== false
                          ? <><Ban size={13} /> Block</>
                          : <><CheckCircle2 size={13} /> Unblock</>
                        }
                      </button>
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
