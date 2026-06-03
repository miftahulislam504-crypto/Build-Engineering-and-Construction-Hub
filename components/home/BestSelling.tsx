"use client";
// components/home/BestSelling.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { getProducts } from "@/lib/firestore";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import type { Product } from "@/lib/types";

export default function BestSelling() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getProducts({ isBestSelling: true, limitCount: 8 })
      .then((d) => setProducts(d as Product[]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 bg-dark-50">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Award size={18} className="text-yellow-600" />
            </div>
            <h2 className="section-title mb-0">Best Selling</h2>
          </div>
          <Link href="/products?filter=bestselling"
            className="flex items-center gap-1.5 text-sm text-primary-600
                       hover:text-primary-700 font-medium transition-colors">
            View All <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>
    </section>
  );
}
