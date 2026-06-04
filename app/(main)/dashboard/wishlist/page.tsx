"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  function handleMoveToCart(item: any) {
    addItem({
      id:        item.productId,
      productId: item.productId,
      name:      item.name,
      image:     item.image,
      brand:     item.brand,
      price:     item.price,
      unit:      "pcs",
      quantity:  1,
    });
    removeItem(item.productId);
    toast.success("Moved to cart");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark-900">
          My Wishlist
          {items.length > 0 && (
            <span className="ml-2 text-base font-normal text-dark-400">
              ({items.length} items)
            </span>
          )}
        </h1>
        {items.length > 0 && (
          <Link href="/products" className="flex items-center gap-1.5 text-sm
                text-primary-600 hover:text-primary-700 font-medium transition-colors">
            Continue Shopping <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-14 text-center">
          <Heart size={48} className="text-dark-200 mx-auto mb-4" />
          <p className="font-medium text-dark-500 mb-1">Your wishlist is empty</p>
          <p className="text-sm text-dark-400 mb-6">
            Save products you love for later
          </p>
          <Link href="/products" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.productId}
              className="card p-4 flex gap-4 hover:shadow-card-hover transition-shadow">
              {/* Image */}
              <Link href={`/products/${item.slug}`}
                className="w-20 h-20 rounded-xl overflow-hidden bg-dark-50 flex-shrink-0">
                <img
                  src={imgErrors[item.productId] ? "/images/placeholder.png" : item.image}
                  alt={item.name}
                  onError={() => setImgErrors((e) => ({ ...e, [item.productId]: true }))}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {item.brand && (
                  <p className="text-xs text-dark-400 mb-0.5">{item.brand}</p>
                )}
                <Link href={`/products/${item.slug}`}>
                  <p className="text-sm font-medium text-dark-800 line-clamp-2
                                hover:text-primary-700 transition-colors leading-snug">
                    {item.name}
                  </p>
                </Link>
                <p className="font-bold text-primary-700 mt-1.5 text-base">
                  {formatPrice(item.price)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="flex-1 btn-primary btn-sm justify-center text-xs"
                  >
                    <ShoppingCart size={13} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => { removeItem(item.productId); toast.success("Removed"); }}
                    className="btn-icon btn-ghost text-red-400 hover:text-red-600
                               hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
