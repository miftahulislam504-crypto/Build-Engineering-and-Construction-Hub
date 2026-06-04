"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart, Heart, Star, Plus, Minus,
  ChevronRight, Share2, FileText, Truck,
  Shield, RotateCcw, Phone,
} from "lucide-react";
import { getProductBySlug, getProducts, incrementProductView, getProductReviews } from "@/lib/firestore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import ProductCard from "@/components/product/ProductCard";
import { formatPrice, discountPercent, getStockStatus, cn } from "@/lib/utils";
import type { Product, Review } from "@/lib/types";
import toast from "react-hot-toast";

const TABS = ["Description", "Specifications", "Reviews"];

export default function ProductDetailsPage() {
  const { slug }  = useParams<{ slug: string }>();
  const router    = useRouter();
  const addItem   = useCartStore((s) => s.addItem);
  const toggle    = useWishlistStore((s) => s.toggle);
  const isInList  = useWishlistStore((s) => s.isInList);
  const user      = useAuthStore((s) => s.user);

  const [product,   setProduct]   = useState<Product | null>(null);
  const [related,   setRelated]   = useState<Product[]>([]);
  const [reviews,   setReviews]   = useState<Review[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty,       setQty]       = useState(1);
  const [selVariant,setSelVariant]= useState<string>("");
  const [tab,       setTab]       = useState("Description");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug as string).then(async (p) => {
      if (!p) { router.push("/products"); return; }
      setProduct(p as Product);
      if (p.variants?.length > 0) setSelVariant(p.variants[0].name);
      // Increment view
      incrementProductView(p.id);
      // Related products
      getProducts({ categoryId: p.categoryId, limitCount: 4 })
        .then((r) => setRelated((r as Product[]).filter((x) => x.id !== p.id).slice(0, 4)));
      // Reviews
      getProductReviews(p.id).then((rv) => setReviews(rv as Review[]));
    }).finally(() => setLoading(false));
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
    if (product.stockQuantity <= 0) { toast.error("Out of stock"); return; }
    const variant = product.variants?.find((v) => v.name === selVariant);
    addItem({
      id:          product.id,
      productId:   product.id,
      name:        product.name,
      image:       product.primaryImage,
      brand:       product.brand?.name,
      price:       variant?.price ?? product.discountPrice ?? product.price,
      unit:        product.unit,
      quantity:    qty,
      variantName: selVariant || undefined,
    });
    toast.success("Added to cart");
  }

  if (loading) {
    return (
      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-5 w-1/2 rounded" />
            <div className="skeleton h-10 w-1/3 rounded" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const stock       = getStockStatus(product.stockQuantity);
  const inWishlist  = isInList(product.id);
  const discountPct = product.discountPrice
    ? discountPercent(product.price, product.discountPrice) : 0;
  const currentVariant = product.variants?.find((v) => v.name === selVariant);
  const currentPrice   = currentVariant?.price ?? product.discountPrice ?? product.price;

  return (
    <div className="bg-white">
      <div className="container-main py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-dark-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          <ChevronRight size={12} />
          {product.category && (
            <>
              <Link href={`/category/${product.category.slug}`}
                className="hover:text-primary-600 transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-dark-600 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          {/* ── Images ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-50">
              <img
                src={product.images?.[activeImg] || product.primaryImage || "/images/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discountPct > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge bg-red-500 text-white px-3 py-1 text-sm font-bold">
                    -{discountPct}%
                  </span>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all",
                      i === activeImg ? "border-primary-500" : "border-dark-100 hover:border-dark-300"
                    )}
                  >
                    <img src={img} alt={`${product.name} ${i+1}`}
                      className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-5">
            {/* Brand */}
            {product.brand && (
              <Link href={`/brand/${product.brand.slug}`}
                className="inline-block text-sm text-primary-600 hover:text-primary-700
                           font-medium transition-colors">
                {product.brand.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="font-display text-2xl font-bold text-dark-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15}
                      className={cn(
                        i < Math.round(product.avgRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-dark-200"
                      )} />
                  ))}
                </div>
                <span className="text-sm text-dark-500">
                  {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-primary-700">
                {formatPrice(currentPrice)}
              </span>
              <span className="text-dark-400 text-sm mb-1">/{product.unit}</span>
              {product.discountPrice && !currentVariant && (
                <span className="text-dark-400 line-through text-lg mb-0.5">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                stock.color === "green"  && "bg-green-500",
                stock.color === "yellow" && "bg-yellow-500",
                stock.color === "red"    && "bg-red-500",
              )} />
              <span className={cn(
                "text-sm font-medium",
                stock.color === "green"  && "text-green-600",
                stock.color === "yellow" && "text-yellow-600",
                stock.color === "red"    && "text-red-500",
              )}>
                {stock.label}
                {product.stockQuantity > 0 && (
                  <span className="text-dark-400 font-normal ml-1">
                    ({product.stockQuantity} {product.unit} available)
                  </span>
                )}
              </span>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => setSelVariant(v.name)}
                      className={cn(
                        "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all",
                        selVariant === v.name
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-dark-200 text-dark-600 hover:border-dark-300"
                      )}
                    >
                      {v.name}
                      <span className="ml-1.5 text-xs text-dark-400">
                        {formatPrice(v.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-dark-700 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-dark-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2.5 hover:bg-dark-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-2.5 font-medium text-dark-800 min-w-[50px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2.5 hover:bg-dark-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-dark-400">{product.unit}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0}
                className="flex-1 btn-primary btn-lg justify-center"
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>
              <button
                onClick={() => toggle({
                  productId: product.id, name: product.name,
                  image: product.primaryImage, price: currentPrice,
                  brand: product.brand?.name, slug: product.slug,
                })}
                className={cn(
                  "btn-icon border-2 rounded-xl w-12 h-12 flex items-center justify-center transition-all",
                  inWishlist
                    ? "border-red-500 bg-red-50 text-red-500"
                    : "border-dark-200 hover:border-red-300 text-dark-500"
                )}
              >
                <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Bulk Quote */}
            <Link href={`/quotation/new?product=${product.id}`}
              className="btn-secondary w-full justify-center">
              <FileText size={17} />
              Request Bulk Quotation
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck,    label: "Fast Delivery"   },
                { icon: Shield,   label: "Quality Assured" },
                { icon: RotateCcw,label: "Easy Return"     },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5
                                             p-3 rounded-xl bg-dark-50 text-center">
                  <Icon size={18} className="text-primary-600" />
                  <span className="text-2xs text-dark-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-12">
          <div className="flex gap-1 border-b border-dark-100 mb-6">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px",
                  tab === t
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-dark-500 hover:text-dark-700"
                )}
              >
                {t}
                {t === "Reviews" && reviews.length > 0 && (
                  <span className="ml-1.5 badge-blue badge text-2xs">
                    {reviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Description */}
          {tab === "Description" && (
            <div className="prose prose-sm max-w-none text-dark-600 leading-relaxed">
              {product.description
                ? <p>{product.description}</p>
                : <p className="text-dark-400">No description available.</p>
              }
            </div>
          )}

          {/* Specifications */}
          {tab === "Specifications" && (
            <div>
              {Object.keys(product.specifications || {}).length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val], i) => (
                      <tr key={key} className={cn(i % 2 === 0 ? "bg-dark-50" : "bg-white")}>
                        <td className="py-2.5 px-4 font-medium text-dark-700 w-1/3">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 text-dark-600">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-dark-400 text-sm">No specifications available.</p>
              )}
            </div>
          )}

          {/* Reviews */}
          {tab === "Reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-dark-400 text-sm">
                  No reviews yet. {user ? "Be the first to review!" : ""}
                </p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="card p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-dark-800 text-sm">{r.userName}</p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12}
                              className={cn(
                                i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-dark-200"
                              )} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-dark-600">{r.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div>
            <h2 className="section-title">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
