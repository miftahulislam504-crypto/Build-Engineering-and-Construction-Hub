"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatPrice, discountPercent, getStockStatus, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import toast from "react-hot-toast";

interface Props {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: Props) {
  const addItem    = useCartStore((s) => s.addItem);
  const toggle     = useWishlistStore((s) => s.toggle);
  const isInList   = useWishlistStore((s) => s.isInList);
  const inWishlist = isInList(product.id);
  const stock      = getStockStatus(product.stockQuantity);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (product.stockQuantity <= 0) {
      toast.error("Product is out of stock");
      return;
    }
    addItem({
      id:        product.id,
      productId: product.id,
      name:      product.name,
      image:     product.primaryImage,
      brand:     product.brand?.name,
      price:     product.discountPrice ?? product.price,
      unit:      product.unit,
      quantity:  1,
    });
    toast.success("Added to cart");
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle({
      productId: product.id,
      name:      product.name,
      image:     product.primaryImage,
      price:     product.discountPrice ?? product.price,
      brand:     product.brand?.name,
      slug:      product.slug,
    });
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  }

  const discountPct = product.discountPrice
    ? discountPercent(product.price, product.discountPrice)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="product-card block">
      {/* Image — next/image দিয়ে optimized */}
      <div className="product-card-img">
        <div className="relative w-full h-full">
          <Image
            src={product.primaryImage || "/images/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPct > 0 && (
            <span className="badge bg-red-500 text-white text-2xs px-2 py-0.5">
              -{discountPct}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="badge bg-green-500 text-white text-2xs px-2 py-0.5">
              New
            </span>
          )}
          {product.isTrending && (
            <span className="badge bg-orange-500 text-white text-2xs px-2 py-0.5">
              Trending
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="badge-red text-xs font-semibold px-3 py-1">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5
                        opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors",
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-white text-dark-600 hover:bg-red-50 hover:text-red-500"
            )}
          >
            <Heart size={15} fill={inWishlist ? "currentColor" : "none"} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              aria-label="Quick view"
              className="w-8 h-8 rounded-xl bg-white text-dark-600
                         hover:bg-primary-50 hover:text-primary-600
                         flex items-center justify-center shadow-md transition-colors"
            >
              <Eye size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-dark-400 mb-1">{product.brand.name}</p>
        )}
        <p className="text-sm font-medium text-dark-800 line-clamp-2 leading-snug mb-2">
          {product.name}
        </p>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-dark-500">
              {product.avgRating.toFixed(1)}
              <span className="text-dark-400"> ({product.reviewCount})</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-primary-700 text-base">
            {formatPrice(product.discountPrice ?? product.price)}
          </span>
          <span className="text-xs text-dark-400">/{product.unit}</span>
          {product.discountPrice && (
            <span className="text-xs text-dark-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-xs font-medium",
            stock.color === "green"  && "text-green-600",
            stock.color === "yellow" && "text-yellow-600",
            stock.color === "red"    && "text-red-500"
          )}>
            {stock.label}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              product.stockQuantity > 0
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-dark-100 text-dark-400 cursor-not-allowed"
            )}
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
