"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart, Trash2, Plus, Minus,
  ArrowRight, ArrowLeft, Tag,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice, cn } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCartStore();
  const [coupon,      setCoupon]      = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal      = totalPrice();
  const deliveryCharge = subtotal > 10000 ? 0 : 150;
  const total          = subtotal + deliveryCharge;

  function applyCoupon() {
    if (!coupon.trim()) return;
    setCouponError("Invalid or expired coupon code.");
  }

  if (items.length === 0) {
    return (
      <div className="container-main py-16 text-center">
        <ShoppingCart size={64} className="text-dark-200 mx-auto mb-5" />
        <h1 className="font-display text-2xl font-bold text-dark-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-dark-400 text-sm mb-8">
          Add products to your cart to get started
        </p>
        <Link href="/products" className="btn-primary btn-lg inline-flex gap-2">
          <ArrowLeft size={18} /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <h1 className="font-display text-2xl font-bold text-dark-900 mb-6">
        Shopping Cart
        <span className="ml-2 text-base font-normal text-dark-400">
          ({items.length} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-3">
          {/* Clear all */}
          <div className="flex justify-end">
            <button
              onClick={() => clearCart()}
              className="text-xs text-red-400 hover:text-red-600 transition-colors
                         flex items-center gap-1"
            >
              <Trash2 size={13} /> Clear All
            </button>
          </div>

          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantName}`}
              className="card p-4 flex gap-4"
            >
              {/* Image */}
              <Link
                href={`/products/${item.productId}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden
                           bg-dark-50 flex-shrink-0"
              >
                <img
                  src={item.image || "/images/placeholder.png"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {item.brand && (
                      <p className="text-xs text-dark-400 mb-0.5">{item.brand}</p>
                    )}
                    <Link href={`/products/${item.productId}`}>
                      <p className="text-sm font-medium text-dark-800 line-clamp-2
                                    hover:text-primary-700 transition-colors">
                        {item.name}
                      </p>
                    </Link>
                    {item.variantName && (
                      <p className="text-xs text-dark-400 mt-0.5">
                        Variant: {item.variantName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantName)}
                    className="text-dark-300 hover:text-red-500 transition-colors
                               flex-shrink-0 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Price & Qty */}
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border border-dark-200
                                   rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.quantity - 1, item.variantName)
                      }
                      className="px-3 py-1.5 hover:bg-dark-50 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-medium text-dark-800
                                     min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.quantity + 1, item.variantName)
                      }
                      className="px-3 py-1.5 hover:bg-dark-50 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary-700 text-base">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-dark-400">
                      {formatPrice(item.price)}/{item.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-primary-600
                       hover:text-primary-700 font-medium transition-colors mt-2"
          >
            <ArrowLeft size={15} /> Continue Shopping
          </Link>
        </div>

        {/* ── Order Summary ── */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5">
            <p className="font-semibold text-dark-800 text-sm mb-3 flex items-center gap-2">
              <Tag size={16} className="text-primary-600" />
              Coupon Code
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                placeholder="Enter code"
                className="input flex-1 text-sm py-2"
              />
              <button
                onClick={applyCoupon}
                className="btn-secondary btn-sm px-4"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
            )}
          </div>

          {/* Summary */}
          <div className="card p-5 space-y-3">
            <p className="font-display font-bold text-dark-900 mb-1">Order Summary</p>

            <div className="flex justify-between text-sm">
              <span className="text-dark-500">
                Subtotal ({items.length} items)
              </span>
              <span className="font-medium text-dark-800">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-dark-500">Delivery Charge</span>
              <span className={cn(
                "font-medium",
                deliveryCharge === 0 ? "text-green-600" : "text-dark-800"
              )}>
                {deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)}
              </span>
            </div>

            {deliveryCharge > 0 && (
              <p className="text-xs text-dark-400 bg-dark-50 rounded-lg px-3 py-2">
                Add {formatPrice(10000 - subtotal)} more for free delivery
              </p>
            )}

            <div className="border-t border-dark-100 pt-3">
              <div className="flex justify-between">
                <span className="font-bold text-dark-900">Total</span>
                <span className="font-bold text-primary-700 text-xl">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full justify-center btn-lg mt-2"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            {/* Trust */}
            <div className="text-center pt-1">
              <p className="text-xs text-dark-400">
                Secure checkout · bKash · Nagad · Card
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
