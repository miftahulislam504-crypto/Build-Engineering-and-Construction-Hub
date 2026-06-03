import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "BuildMart BD — Construction Materials & Engineering Services",
    template: "%s | BuildMart BD",
  },
  description:
    "Bangladesh-এর সেরা Construction Materials ও Engineering Services Marketplace। Cement, Steel, Paint, Electrical, Sanitary সহ সব ধরনের নির্মাণ সামগ্রী।",
  keywords: [
    "construction materials Bangladesh",
    "cement price Bangladesh",
    "steel rod price BD",
    "Holcim cement",
    "BSRM steel",
    "engineering services BD",
    "building materials online",
    "নির্মাণ সামগ্রী",
  ],
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "BuildMart BD",
    title: "BuildMart BD — Construction Materials & Engineering Services",
    description:
      "Bangladesh-এর সেরা Construction Materials ও Engineering Services Marketplace।",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildMart BD",
    description: "Construction Materials & Engineering Services Marketplace",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="font-sans bg-white text-dark-900 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1e293b",
                color: "#f8fafc",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
"use client";

import Link from "next/link";
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice } =
    useCartStore();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50
                    shadow-2xl flex flex-col transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary-600" />
            <h2 className="font-display font-bold text-dark-900">
              Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-dark-400">
                  ({items.length} items)
                </span>
              )}
            </h2>
          </div>
          <button onClick={closeCart} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full
                            text-center py-16">
              <ShoppingCart size={52} className="text-dark-200 mb-4" />
              <p className="font-medium text-dark-500 mb-1">Cart is empty</p>
              <p className="text-sm text-dark-400 mb-6">
                Add products to get started
              </p>
              <button onClick={closeCart} className="btn-primary btn-sm">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variantName}`}
                className="flex gap-3 p-3 rounded-xl border border-dark-100
                           hover:border-dark-200 transition-colors"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-50 flex-shrink-0">
                  <img
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-800 line-clamp-1">
                    {item.name}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-dark-400 mt-0.5">{item.variantName}</p>
                  )}
                  <p className="text-sm font-bold text-primary-600 mt-1">
                    {formatPrice(item.price)}
                    <span className="text-xs font-normal text-dark-400">
                      /{item.unit}
                    </span>
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQty(item.productId, item.quantity - 1, item.variantName)
                        }
                        className="w-6 h-6 rounded-lg border border-dark-200
                                   flex items-center justify-center hover:bg-dark-50
                                   transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(item.productId, item.quantity + 1, item.variantName)
                        }
                        className="w-6 h-6 rounded-lg border border-dark-200
                                   flex items-center justify-center hover:bg-dark-50
                                   transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantName)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-dark-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-500 text-sm">Subtotal</span>
              <span className="font-bold text-dark-900 text-lg">
                {formatPrice(totalPrice())}
              </span>
            </div>
            <p className="text-xs text-dark-400 text-center">
              Delivery charge calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full justify-center btn-lg"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-secondary w-full justify-center"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
