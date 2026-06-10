"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Heart, GitCompare, CheckCircle2, XCircle } from "lucide-react";
import { getDocument } from "@/lib/firestore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import toast from "react-hot-toast";

export default function ComparePage() {
  const searchParams  = useSearchParams();
  const ids           = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  const [products, setProducts] = useState<(Product | null)[]>([]);
  const [loading,  setLoading]  = useState(true);
  const addItem    = useCartStore((s) => s.addItem);
  const toggle     = useWishlistStore((s) => s.toggle);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => getDocument("products", id)))
      .then((results) => setProducts(results as Product[]))
      .finally(() => setLoading(false));
  }, [ids.join(",")]);

  const validProducts = products.filter(Boolean) as Product[];

  // All unique spec keys
  const allSpecKeys = Array.from(
    new Set(
      validProducts.flatMap((p) => Object.keys(p.specifications || {}))
    )
  );

  function handleAddToCart(product: Product) {
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

  if (loading) {
    return (
      <div className="container-main py-10">
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton aspect-square rounded-xl" />
              <div className="skeleton h-5 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (validProducts.length === 0) {
    return (
      <div className="container-main py-16 text-center">
        <GitCompare size={56} className="text-dark-200 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-dark-900 mb-2">
          No Products to Compare
        </h1>
        <p className="text-dark-400 text-sm mb-6">
          Add products to compare by clicking the compare button on product cards.
        </p>
        <Link href="/products" className="btn-primary inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container-main py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-dark-900 mb-1">
            Product Comparison
          </h1>
          <p className="text-dark-400 text-sm">
            Comparing {validProducts.length} products
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">

            {/* Product Images & Basic Info */}
            <thead>
              <tr>
                <th className="w-36 py-4 px-4 text-left text-xs font-semibold
                                text-dark-500 uppercase tracking-wider align-top">
                  Product
                </th>
                {validProducts.map((p) => (
                  <th key={p.id} className="py-4 px-4 align-top">
                    <div className="flex flex-col items-center gap-3">
                      {/* Image */}
                      <div className="w-full aspect-square max-w-[180px] rounded-2xl
                                       overflow-hidden bg-dark-50">
                        <img src={p.primaryImage || "/images/placeholder.png"}
                          alt={p.name}
                          className="w-full h-full object-cover" />
                      </div>
                      {/* Name */}
                      <div className="text-center">
                        {p.brand && (
                          <p className="text-xs text-dark-400 mb-0.5">{p.brand.name}</p>
                        )}
                        <Link href={`/products/${p.slug}`}
                          className="font-display font-bold text-dark-900 text-sm
                                     hover:text-primary-700 transition-colors line-clamp-2">
                          {p.name}
                        </Link>
                      </div>
                      {/* Price */}
                      <div className="text-center">
                        <p className="font-bold text-primary-700 text-xl">
                          {formatPrice(p.discountPrice ?? p.price)}
                        </p>
                        <p className="text-xs text-dark-400">/{p.unit}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={p.stockQuantity <= 0}
                          className="flex-1 btn-primary btn-sm justify-center text-xs
                                     disabled:opacity-50"
                        >
                          <ShoppingCart size={13} /> Add
                        </button>
                        <button
                          onClick={() => toggle({
                            productId: p.id, name: p.name,
                            image: p.primaryImage, price: p.discountPrice ?? p.price,
                            brand: p.brand?.name, slug: p.slug,
                          })}
                          className="btn-icon btn-secondary p-2"
                        >
                          <Heart size={14} />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-dark-100">
              {/* Stock */}
              <CompareRow label="Stock Status">
                {validProducts.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center">
                    <span className={cn(
                      "badge text-xs",
                      p.stockQuantity > 0 ? "badge-green" : "badge-red"
                    )}>
                      {p.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                ))}
              </CompareRow>

              {/* Category */}
              <CompareRow label="Category">
                {validProducts.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center text-sm text-dark-600">
                    {p.category?.name || "—"}
                  </td>
                ))}
              </CompareRow>

              {/* Product Type */}
              <CompareRow label="Type">
                {validProducts.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center">
                    <span className="badge-gray badge text-xs capitalize">
                      {p.productType}
                    </span>
                  </td>
                ))}
              </CompareRow>

              {/* Rating */}
              <CompareRow label="Rating">
                {validProducts.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center text-sm">
                    {p.reviewCount > 0 ? (
                      <span className="text-yellow-600 font-medium">
                        ★ {p.avgRating?.toFixed(1)}
                        <span className="text-dark-400 font-normal ml-1">
                          ({p.reviewCount})
                        </span>
                      </span>
                    ) : (
                      <span className="text-dark-400 text-xs">No reviews</span>
                    )}
                  </td>
                ))}
              </CompareRow>

              {/* Dynamic Specifications */}
              {allSpecKeys.map((key) => (
                <CompareRow key={key} label={key}>
                  {validProducts.map((p) => {
                    const val = p.specifications?.[key];
                    return (
                      <td key={p.id} className="py-3 px-4 text-center text-sm">
                        {val ? (
                          <span className="text-dark-700 font-medium">{val}</span>
                        ) : (
                          <span className="text-dark-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </CompareRow>
              ))}

              {/* Featured Flags */}
              <CompareRow label="Featured">
                {validProducts.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center">
                    {p.isFeatured
                      ? <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                      : <XCircle     size={16} className="text-dark-300 mx-auto" />}
                  </td>
                ))}
              </CompareRow>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label, children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="hover:bg-dark-50 transition-colors">
      <td className="py-3 px-4 text-xs font-semibold text-dark-500
                     uppercase tracking-wider w-36 align-middle">
        {label}
      </td>
      {children}
    </tr>
  );
}
