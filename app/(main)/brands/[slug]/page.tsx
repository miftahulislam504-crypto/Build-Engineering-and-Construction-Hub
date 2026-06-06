"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  collection, query, where, getDocs,
  orderBy, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { queryCollection } from "@/lib/firestore";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import type { Product } from "@/lib/types";

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();

  const [brand,    setBrand]    = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    // Get brand by slug
    queryCollection("brands", where("slug", "==", slug as string), limit(1))
      .then(async (brands) => {
        if (brands.length === 0) { setLoading(false); return; }
        const brand = brands[0];
        setBrand(brand);

        // Get products
        const snap = await getDocs(
          query(
            collection(db, "products"),
            where("brandId", "==", brand.id),
            where("isActive", "==", true),
            orderBy("createdAt", "desc"),
            limit(24)
          )
        );
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-10">
        <div className="container-main">
          <nav className="flex items-center gap-1.5 text-xs text-dark-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight size={12} />
            <span className="text-white">{brand?.name || slug}</span>
          </nav>

          <div className="flex items-center gap-4">
            {/* Brand logo/initial */}
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center
                             justify-center text-2xl font-bold border border-white/20">
              {brand?.logo ? (
                <img src={brand.logo} alt={brand.name}
                  className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <span>{brand?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">
                {loading ? "Loading..." : brand?.name}
              </h1>
              {brand?.description && (
                <p className="text-dark-300 text-sm">{brand.description}</p>
              )}
              {!loading && (
                <p className="text-dark-400 text-xs mt-1">
                  {products.length} products available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark-400 text-sm mb-4">
              No products found for this brand yet.
            </p>
            <Link href="/products" className="btn-primary inline-flex">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
