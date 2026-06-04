"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserOrders } from "@/lib/firestore";
import { formatPrice, formatDateShort, orderStatusColor, paymentLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_TABS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");

  useEffect(() => {
    if (!user?.id) return;
    getUserOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = tab === "all"
    ? orders
    : orders.filter((o) => o.status === tab);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-dark-900">My Orders</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium capitalize",
              "whitespace-nowrap transition-all duration-150",
              tab === s
                ? "bg-primary-600 text-white"
                : "bg-white border border-dark-200 text-dark-600 hover:border-primary-300"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-36 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <Package size={48} className="text-dark-200 mx-auto mb-4" />
          <p className="font-medium text-dark-500 mb-1">No orders found</p>
          <p className="text-sm text-dark-400 mb-6">
            {tab === "all" ? "You haven't placed any orders yet." : `No ${tab} orders.`}
          </p>
          <Link href="/products" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="card p-5 block hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Order number & date */}
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-dark-800 text-sm">
                      {order.orderNumber}
                    </p>
                    <span className={cn(
                      "badge capitalize text-xs",
                      orderStatusColor(order.status) === "yellow"  && "badge-yellow",
                      orderStatusColor(order.status) === "blue"    && "badge-blue",
                      orderStatusColor(order.status) === "green"   && "badge-green",
                      orderStatusColor(order.status) === "red"     && "badge-red",
                      orderStatusColor(order.status) === "gray"    && "badge-gray",
                    )}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items preview */}
                  <p className="text-xs text-dark-500 mb-2 line-clamp-1">
                    {order.items?.map((i: any) => i.name).join(", ")}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-dark-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {order.createdAt?.toDate
                        ? formatDateShort(order.createdAt.toDate())
                        : "—"}
                    </span>
                    <span className="text-dark-300">·</span>
                    <span>{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
                    <span className="text-dark-300">·</span>
                    <span>{paymentLabel(order.paymentMethod)}</span>
                  </div>
                </div>

                {/* Total + arrow */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary-700 text-base">
                    {formatPrice(order.total)}
                  </p>
                  <ChevronRight size={16} className="text-dark-300 ml-auto mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
