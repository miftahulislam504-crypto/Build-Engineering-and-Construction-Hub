"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard, Package, Wrench, FileText,
  Heart, Bell, User, LogOut, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",                label: "Dashboard",       icon: LayoutDashboard },
  { href: "/dashboard/orders",         label: "My Orders",       icon: Package         },
  { href: "/dashboard/services",       label: "Service Requests",icon: Wrench          },
  { href: "/dashboard/quotations",     label: "Quotations",      icon: FileText        },
  { href: "/dashboard/wishlist",       label: "Wishlist",        icon: Heart           },
  { href: "/dashboard/notifications",  label: "Notifications",   icon: Bell            },
  { href: "/dashboard/profile",        label: "Profile",         icon: User            },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await signOut(auth);
    logout();
    router.push("/");
  }

  return (
    <div className="card overflow-hidden">
      {/* User info */}
      <div className="p-5 bg-gradient-to-br from-primary-700 to-primary-600 text-white">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/30" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="font-display font-bold text-xl">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-primary-200 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="p-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm",
                "transition-all duration-150 group",
                active
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-dark-600 hover:bg-dark-50 hover:text-dark-800"
              )}
            >
              <Icon size={17} className={cn(
                active ? "text-primary-600" : "text-dark-400 group-hover:text-dark-600"
              )} />
              {label}
              {active && (
                <ChevronRight size={14} className="ml-auto text-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-dark-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                     text-red-500 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}
