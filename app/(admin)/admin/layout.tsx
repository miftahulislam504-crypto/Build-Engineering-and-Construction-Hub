"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard, Package, Wrench, FolderOpen,
  Tag, ShoppingBag, FileText, Users, Star,
  Image, BookOpen, Menu, X, LogOut,
  ChevronRight, Settings, Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { href: "/admin/products",    label: "Products",        icon: Package         },
  { href: "/admin/services",    label: "Services",        icon: Wrench          },
  { href: "/admin/categories",  label: "Categories",      icon: FolderOpen      },
  { href: "/admin/brands",      label: "Brands",          icon: Tag             },
  { href: "/admin/orders",      label: "Orders",          icon: ShoppingBag     },
  { href: "/admin/quotations",  label: "Quotations",      icon: FileText        },
  { href: "/admin/service-requests", label: "Service Requests", icon: Wrench   },
  { href: "/admin/customers",   label: "Customers",       icon: Users           },
  { href: "/admin/reviews",     label: "Reviews",         icon: Star            },
  { href: "/admin/banners",     label: "Banners",         icon: Image           },
  { href: "/admin/blog",        label: "Blog & Content",  icon: BookOpen        },
  { href: "/admin/rates",       label: "Material Rates",  icon: Calculator      },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, isAdmin, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !isAdmin()) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, isAdmin, router]);

  async function handleLogout() {
    await signOut(auth);
    logout();
    router.push("/");
  }

  if (isLoading || !user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent
                           rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-dark-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-50">

      {/* ── Sidebar ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-64 bg-dark-900",
          "flex flex-col transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-dark-800">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">BuildMart</p>
                <p className="text-dark-400 text-2xs">Admin Panel</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-dark-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5",
                    "transition-all duration-150",
                    active
                      ? "bg-primary-600 text-white"
                      : "text-dark-400 hover:bg-dark-800 hover:text-white"
                  )}>
                  <Icon size={16} />
                  {label}
                  {active && <ChevronRight size={13} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-dark-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-dark-400 text-xs truncate">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-dark-400 hover:text-red-400
                         transition-colors text-sm w-full">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </aside>
      </>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-dark-100 px-4 sm:px-6 h-14
                            flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-icon btn-ghost">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-dark-700 capitalize">
              {NAV.find((n) => pathname.startsWith(n.href))?.label || "Admin Panel"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank"
              className="text-xs text-dark-400 hover:text-primary-600 transition-colors">
              View Site
            </Link>
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
