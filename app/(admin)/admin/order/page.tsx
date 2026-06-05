"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, Clock, Filter,
} from "lucide-react";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, serverTimestamp, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice, formatDateShort, orderStatusColor, paymentLabel, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_TABS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_ACTIONS: Record<string, string[]> = {
  pending:    ["processing", "cancelled"],
  processing: ["shipped",    "cancelled"],
  shipped:    ["delivered",  "cancelled"],
  delivered:  [],
  cancelled:  [],
};

export default function AdminOrdersPage() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("all");
  const [search,   setSearch]   = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")))
      .then((snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchTab    = tab === "all" || o.status === tab;
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.userName?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus, updatedAt: serverTimestamp(),
      });
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      toast.success(`Order marked as ${newStatus}`);
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Orders</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {filtered.length} orders found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or customer..."
            className="input pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((s) => (
            <button key={s} onClick={() => setTab(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                tab === s
                  ? "bg-primary-600 text-white"
                  : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              )}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-dark-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="skeleton h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-dark-400 text-sm">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-dark-50 transition-colors">
                    {/* Order # */}
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs font-medium text-dark-700">
                        {order.orderNumber}
                      </p>
                    </td>
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-dark-800 text-xs">{order.userName}</p>
                      <p className="text-dark-400 text-xs truncate max-w-[120px]">
                        {order.address?.phone}
                      </p>
                    </td>
                    {/* Items */}
                    <td className="py-3 px-4">
                      <span className="badge-gray badge text-xs">
                        {order.items?.length || 0} items
                      </span>
                    </td>
                    {/* Total */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-primary-700 text-sm">
                        {formatPrice(order.total)}
                      </p>
                    </td>
                    {/* Payment */}
                    <td className="py-3 px-4">
                      <p className="text-xs text-dark-600 capitalize">
                        {paymentLabel(order.paymentMethod)}
                      </p>
                      <span className={cn(
                        "badge text-2xs mt-0.5",
                        order.paymentStatus === "paid" ? "badge-green" : "badge-yellow"
                      )}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={cn(
                        "badge text-xs capitalize",
                        orderStatusColor(order.status) === "yellow"  && "badge-yellow",
                        orderStatusColor(order.status) === "blue"    && "badge-blue",
                        orderStatusColor(order.status) === "green"   && "badge-green",
                        orderStatusColor(order.status) === "red"     && "badge-red",
                        orderStatusColor(order.status) === "gray"    && "badge-gray",
                      )}>
                        {order.status}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="py-3 px-4">
                      <p className="text-xs text-dark-400">
                        {order.createdAt?.toDate
                          ? formatDateShort(order.createdAt.toDate())
                          : "—"}
                      </p>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_ACTIONS[order.status]?.map((action) => (
                          <button
                            key={action}
                            onClick={() => updateStatus(order.id, action)}
                            disabled={updating === order.id}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-2xs font-medium transition-all",
                              "disabled:opacity-50",
                              action === "cancelled"
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                            )}
                          >
                            {action}
                          </button>
                        ))}
                        <Link href={`/admin/orders/${order.id}`}
                          className="btn-icon btn-ghost text-dark-500">
                          <ChevronRight size={15} />
                        </Link>
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
