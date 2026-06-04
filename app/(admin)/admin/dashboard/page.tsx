"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, Users, FileText,
  TrendingUp, Clock, ChevronRight, AlertTriangle,
} from "lucide-react";
import {
  collection, query, orderBy, limit,
  getDocs, where, getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice, formatDateShort, orderStatusColor, cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats,        setStats]        = useState<any>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingQuotes,setPendingQuotes]= useState<any[]>([]);
  const [lowStock,     setLowStock]     = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, orders, customers, quotations, pendingOrders] =
          await Promise.all([
            getCountFromServer(query(collection(db, "products"), where("isActive", "==", true))),
            getCountFromServer(collection(db, "orders")),
            getCountFromServer(query(collection(db, "users"), where("role", "==", "customer"))),
            getCountFromServer(collection(db, "quotations")),
            getCountFromServer(query(collection(db, "orders"), where("status", "==", "pending"))),
          ]);

        setStats({
          totalProducts:  products.data().count,
          totalOrders:    orders.data().count,
          totalCustomers: customers.data().count,
          totalQuotations:quotations.data().count,
          pendingOrders:  pendingOrders.data().count,
        });

        // Recent orders
        const ordersSnap = await getDocs(
          query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(8))
        );
        setRecentOrders(ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Pending quotations
        const quotesSnap = await getDocs(
          query(collection(db, "quotations"), where("status", "==", "pending"),
            orderBy("createdAt", "desc"), limit(5))
        );
        setPendingQuotes(quotesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Low stock products
        const lowStockSnap = await getDocs(
          query(collection(db, "products"), where("stockQuantity", "<=", 10),
            where("isActive", "==", true), limit(5))
        );
        setLowStock(lowStockSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STAT_CARDS = [
    { label: "Total Products",   value: stats.totalProducts,   icon: Package,    color: "bg-blue-50   text-blue-600",   href: "/admin/products"   },
    { label: "Total Orders",     value: stats.totalOrders,     icon: ShoppingBag,color: "bg-purple-50 text-purple-600", href: "/admin/orders"     },
    { label: "Total Customers",  value: stats.totalCustomers,  icon: Users,      color: "bg-green-50  text-green-600",  href: "/admin/customers"  },
    { label: "Quotation Requests",value: stats.totalQuotations,icon: FileText,   color: "bg-orange-50 text-orange-600", href: "/admin/quotations" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-0.5">Welcome back, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="card p-5 hover:shadow-card-hover transition-shadow">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-3", color)}>
              <Icon size={22} />
            </div>
            <p className="font-display text-3xl font-bold text-dark-900">
              {loading ? "—" : (value || 0).toLocaleString()}
            </p>
            <p className="text-sm text-dark-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pendingOrders > 0 || pendingQuotes.length > 0 || lowStock.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.pendingOrders > 0 && (
            <Link href="/admin/orders?status=pending"
              className="card p-4 border-yellow-300 bg-yellow-50 flex items-center gap-3">
              <Clock size={20} className="text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800 text-sm">
                  {stats.pendingOrders} Pending Orders
                </p>
                <p className="text-xs text-yellow-600">Needs processing</p>
              </div>
            </Link>
          )}
          {pendingQuotes.length > 0 && (
            <Link href="/admin/quotations"
              className="card p-4 border-blue-300 bg-blue-50 flex items-center gap-3">
              <FileText size={20} className="text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800 text-sm">
                  {pendingQuotes.length} Pending Quotations
                </p>
                <p className="text-xs text-blue-600">Awaiting response</p>
              </div>
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link href="/admin/products?filter=lowstock"
              className="card p-4 border-red-300 bg-red-50 flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-600" />
              <div>
                <p className="font-semibold text-red-800 text-sm">
                  {lowStock.length} Low Stock Items
                </p>
                <p className="text-xs text-red-600">Restock needed</p>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-dark-100">
            <h2 className="font-display font-bold text-dark-900">Recent Orders</h2>
            <Link href="/admin/orders"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center text-dark-400 text-sm">No orders yet</div>
          ) : (
            <div className="divide-y divide-dark-100">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-dark-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-dark-800">{order.orderNumber}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-dark-400">{order.userName}</p>
                      <span className="text-dark-300">·</span>
                      <p className="text-xs font-medium text-dark-600">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "badge text-xs capitalize",
                    orderStatusColor(order.status) === "yellow"  && "badge-yellow",
                    orderStatusColor(order.status) === "blue"    && "badge-blue",
                    orderStatusColor(order.status) === "green"   && "badge-green",
                    orderStatusColor(order.status) === "red"     && "badge-red",
                  )}>
                    {order.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending Quotations */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-dark-100">
            <h2 className="font-display font-bold text-dark-900">Pending Quotations</h2>
            <Link href="/admin/quotations"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : pendingQuotes.length === 0 ? (
            <div className="p-10 text-center text-dark-400 text-sm">No pending quotations</div>
          ) : (
            <div className="divide-y divide-dark-100">
              {pendingQuotes.map((q) => (
                <Link key={q.id} href={`/admin/quotations/${q.id}`}
                  className="flex items-center justify-between p-4 hover:bg-dark-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-dark-800">{q.projectName}</p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {q.userName} · {q.quotationNumber}
                    </p>
                  </div>
                  <span className="badge-yellow badge text-xs">Pending</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-dark-100">
            <h2 className="font-display font-bold text-dark-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Low Stock Products
            </h2>
            <Link href="/admin/products"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Manage <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-dark-100">
            {lowStock.map((p) => (
              <Link key={p.id} href={`/admin/products/${p.id}`}
                className="flex items-center justify-between p-4 hover:bg-dark-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-50">
                    <img src={p.primaryImage || "/images/placeholder.png"}
                      alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-800">{p.name}</p>
                    <p className="text-xs text-dark-400">{p.brand?.name || "—"}</p>
                  </div>
                </div>
                <span className={cn(
                  "badge text-xs",
                  p.stockQuantity === 0 ? "badge-red" : "badge-yellow"
                )}>
                  {p.stockQuantity === 0 ? "Out of Stock" : `${p.stockQuantity} left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
