"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Heart, Bell, User,
  Phone, Menu, X, ChevronDown, LogOut,
  Package, ClipboardList, Settings,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { cn, whatsappLink } from "@/lib/utils";
import MegaMenu from "./MegaMenu";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const wishCount  = useWishlistStore((s) => s.count);

  const [search,       setSearch]       = useState("");
  const [suggestions,  setSuggestions]  = useState<string[]>([]);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userOpen,     setUserOpen]     = useState(false);
  const [megaOpen,     setMegaOpen]     = useState(false);
  const searchRef    = useRef<HTMLDivElement>(null);
  const userDropRef  = useRef<HTMLDivElement>(null);

  // Search suggestions (demo — Firestore দিয়ে replace করবে)
  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return; }
    const demo = [
      "Holcim Cement", "Shah Cement", "BSRM Steel",
      "Berger Paint", "BRB Cable", "RAK Ceramics",
      "Sika Waterproofing", "Safety Helmet",
    ].filter((s) => s.toLowerCase().includes(search.toLowerCase()));
    setSuggestions(demo.slice(0, 5));
  }, [search]);

  // Outside click → close dropdowns
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSuggestions([]);
      if (userDropRef.current && !userDropRef.current.contains(e.target as Node))
        setUserOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    await signOut(auth);
    logout();
    router.push("/");
    setUserOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSuggestions([]);
    }
  }

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="bg-primary-800 text-white text-xs py-1.5 hidden md:block">
        <div className="container-main flex justify-between items-center">
          <p>Bangladesh&apos;s Leading Construction Materials Marketplace</p>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${process.env.NEXT_PUBLIC_CALL_NUMBER}`}
              className="flex items-center gap-1 hover:text-primary-200 transition-colors"
            >
              <Phone size={12} />
              {process.env.NEXT_PUBLIC_CALL_NUMBER}
            </a>
            <a
              href={whatsappLink(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "")}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-200 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className="bg-white shadow-header sticky top-0 z-50">
        <div className="container-main">

          {/* Row 1: Logo + Icons (mobile) | Logo + Search + Icons (desktop) */}
          <div className="flex items-center gap-4 h-16">

            {/* Mobile menu button */}
            <button
              className="lg:hidden btn-icon btn-ghost"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 min-w-0">
              <div className="flex items-center gap-2">
                <img
                  src="/images/logo.png"
                  alt="EngineX Mart"
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                />
                <p className="font-display font-bold text-primary-800 text-sm sm:text-lg leading-tight truncate max-w-[110px] sm:max-w-none">
                  EngineX Mart
                </p>
              </div>
            </Link>

            {/* Category button (desktop only) */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="hidden lg:flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700
                         text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors
                         flex-shrink-0"
              onClick={() => setMegaOpen(!megaOpen)}
            >
              <Menu size={16} />
              All Categories
              <motion.span animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} />
              </motion.span>
            </motion.button>

            {/* Search Bar — desktop only (lg+) */}
            <div ref={searchRef} className="hidden lg:block flex-1 relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search cement, steel, paint, services..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-primary-500
                               focus:border-transparent bg-dark-50"
                  />
                </div>
              </form>
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl
                                    shadow-modal border border-dark-100 z-50 overflow-hidden
                                    origin-top"
                  >
                    {suggestions.map((s) => (
                      <motion.button
                        key={s}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                        onClick={() => {
                          setSearch(s);
                          setSuggestions([]);
                          router.push(`/search?q=${encodeURIComponent(s)}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5
                                   text-sm text-dark-700 text-left"
                      >
                        <Search size={14} className="text-dark-400 flex-shrink-0" />
                        {s}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">

              {/* Wishlist */}
              <motion.div whileTap={{ scale: 0.85 }}>
                <Link href="/wishlist" className="relative btn-icon btn-ghost">
                  <Heart size={20} />
                  <AnimatePresence>
                    {wishCount() > 0 && (
                      <motion.span
                        key={wishCount()}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500
                                       text-white text-2xs rounded-full flex items-center
                                       justify-center font-medium"
                      >
                        {wishCount()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.button
                onClick={toggleCart}
                whileTap={{ scale: 0.85 }}
                className="relative btn-icon btn-ghost"
              >
                <ShoppingCart size={20} />
                <AnimatePresence>
                  {totalItems() > 0 && (
                    <motion.span
                      key={totalItems()}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600
                                       text-white text-2xs rounded-full flex items-center
                                       justify-center font-medium"
                    >
                      {totalItems() > 9 ? "9+" : totalItems()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications (logged in) */}
              {user && (
                <Link href="/dashboard/notifications" className="relative btn-icon btn-ghost">
                  <Bell size={20} />
                </Link>
              )}

              {/* User Account */}
              <div className="relative" ref={userDropRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserOpen(!userOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl
                                 hover:bg-dark-50 transition-colors"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary-100
                                        flex items-center justify-center">
                          <span className="text-primary-700 text-xs font-bold">
                            {user.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="hidden md:block text-sm font-medium text-dark-700 max-w-[80px] truncate">
                        {user.name?.split(" ")[0]}
                      </span>
                      <ChevronDown size={14} className="text-dark-400 hidden md:block" />
                    </button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                    {userOpen && (() => {
                      const rect = userDropRef.current?.getBoundingClientRect();
                      const dropWidth = 208; // w-52 = 13rem = 208px
                      const rightEdge = rect ? Math.min(window.innerWidth - 8, rect.right) : 0;
                      const leftPos = Math.max(8, rightEdge - dropWidth);
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="fixed top-auto bg-white rounded-xl shadow-modal border border-dark-100 z-50 overflow-hidden w-52 origin-top-right"
                          style={{ left: leftPos, top: rect ? rect.bottom + 4 : 64 }}
                        >
                        <div className="px-4 py-3 border-b border-dark-100">
                          <p className="font-medium text-dark-800 text-sm truncate">{user.name}</p>
                          <p className="text-dark-400 text-xs truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { href: "/dashboard",           icon: User,          label: "My Dashboard"    },
                            { href: "/dashboard/orders",    icon: Package,       label: "My Orders"       },
                            { href: "/dashboard/quotations",icon: ClipboardList, label: "My Quotations"   },
                            { href: "/dashboard/profile",   icon: Settings,      label: "Profile Settings"},
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setUserOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm
                                         text-dark-600 hover:bg-dark-50 transition-colors"
                            >
                              <Icon size={15} className="text-dark-400" />
                              {label}
                            </Link>
                          ))}
                          {useAuthStore.getState().isAdmin() && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setUserOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm
                                         text-primary-600 hover:bg-primary-50 transition-colors"
                            >
                              <Settings size={15} />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-dark-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm
                                       text-red-500 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut size={15} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                      );
                    })()}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="btn-secondary btn-sm hidden sm:flex"
                    >
                      Login
                    </Link>
                    <Link href="/auth/login" className="sm:hidden btn-icon btn-ghost">
                      <User size={20} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Search Bar — mobile only (below lg) */}
          <div ref={searchRef} className="lg:hidden px-2 pb-3 relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cement, steel, paint..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-primary-500
                             focus:border-transparent bg-dark-50"
                />
              </div>
            </form>
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-full left-2 right-2 mt-0 bg-white rounded-xl
                                  shadow-modal border border-dark-100 z-50 overflow-hidden"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSearch(s);
                        setSuggestions([]);
                        router.push(`/search?q=${encodeURIComponent(s)}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                                 hover:bg-dark-50 text-sm text-dark-700 text-left
                                 transition-colors"
                    >
                      <Search size={14} className="text-dark-400 flex-shrink-0" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Mega Menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="hidden lg:block border-t border-dark-100 overflow-hidden"
            >
              <MegaMenu onClose={() => setMegaOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl
                              overflow-y-auto"
            >
              <div className="p-4 border-b border-dark-100 flex items-center justify-between">
                <p className="font-display font-bold text-primary-800">Menu</p>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setMenuOpen(false)}
                  className="btn-icon btn-ghost"
                >
                  <X size={20} />
                </motion.button>
              </div>
              <MegaMenu onClose={() => setMenuOpen(false)} mobile />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
