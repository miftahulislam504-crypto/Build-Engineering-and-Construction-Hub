"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNewArrivals } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import type { Product } from "@/lib/types";

export default function NewArrivals() {
  const { data: products, isLoading } = useNewArrivals();

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="py-10 bg-white">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <Sparkles size={18} className="text-green-600" />
            </div>
            <h2 className="section-title mb-0">New Arrivals</h2>
          </div>
          <Link
            href="/products?filter=new"
            className="flex items-center gap-1.5 text-sm text-primary-600
                       hover:text-primary-700 font-medium transition-colors"
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (products as Product[]).map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>
    </section>
  );
}
