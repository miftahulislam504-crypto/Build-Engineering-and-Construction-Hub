"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Wrench, FileText, Heart, ArrowRight, Clock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserOrders, getUserServiceRequests, getUserQuotations } from "@/lib/firestore";
import { formatPrice, formatDateShort, orderStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [orders,     setOrders]     = useState<any[]>([]);
  const [services,   setServices]   = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      getUserOrders(user.id),
      getUserServiceRequests(user.id),
      getUserQuotations(user.id),
    ]).then(([o, s, q]) => {
      setOrders(o);
      setServices(s);
      setQuotations(q);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const stats = [
    { label: "Total Orders",   value: orders.length,     icon: Package,  color: "bg-blue-50   text-blue-600",   href: "/dashboard/orders"     },
    { label: "Service Requests",value: services.length,  icon: Wrench,   color: "bg-purple-50 text-purple-600", href: "/dashboard/services"   },
    { label: "Quotations",     value: quotations.length, icon: FileText, color: "bg-green-50  text-green-600",  href: "/dashboard/quotations" },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-br from-primary-700 to-primary-600 text-white">
        <h1 className="font-display text-2xl font-bold mb-1">
          Welcome, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-primary-100 text-sm">
          Manage your orders, service requests, and quotations from here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="card p-5 hover:shadow-card-hover transition-shadow group">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
              <Icon size={20} />
            </div>
            <p className="font-display font-bold text-2xl text-dark-900">
              {loading ? "—" : value}
            </p>
            <p className="text-xs text-dark-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-dark-100">
          <h2 className="font-display font-bold text-dark-900">Recent Orders</h2>
          <Link href="/dashboard/orders"
            className="flex items-center gap-1 text-sm text-primary-600
                       hover:text-primary-700 font-medium transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="skeleton h-4 w-36 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <Package size={40} className="text-dark-200 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No orders yet</p>
            <Link href="/products" className="btn-primary btn-sm mt-4 inline-flex">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dark-100">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-dark-50
                           transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-dark-800">
                    {order.orderNumber}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-dark-400" />
                    <p className="text-xs text-dark-400">
                      {order.createdAt?.toDate
                        ? formatDateShort(order.createdAt.toDate())
                        : "—"}
                    </p>
                    <span className="text-dark-300">·</span>
                    <p className="text-xs font-medium text-dark-600">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
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
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Quotations */}
      {quotations.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-dark-100">
            <h2 className="font-display font-bold text-dark-900">Recent Quotations</h2>
            <Link href="/dashboard/quotations"
              className="flex items-center gap-1 text-sm text-primary-600
                         hover:text-primary-700 font-medium transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-dark-100">
            {quotations.slice(0, 3).map((q) => (
              <div key={q.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-dark-800">{q.projectName}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{q.quotationNumber}</p>
                </div>
                <span className={cn(
                  "badge capitalize text-xs",
                  q.status === "pending"  && "badge-yellow",
                  q.status === "sent"     && "badge-blue",
                  q.status === "approved" && "badge-green",
                  q.status === "rejected" && "badge-red",
                )}>
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
