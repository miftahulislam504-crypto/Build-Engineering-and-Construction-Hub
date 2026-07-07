"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useTrendingProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import type { Product } from "@/lib/types";
import Reveal from "@/components/motion/Reveal";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";

export default function TrendingProducts() {
  const { data: products, isLoading } = useTrendingProducts();

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="py-10 bg-white">
      <div className="container-main">
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp size={18} className="text-orange-600" />
              </div>
              <h2 className="section-title mb-0">Trending Now</h2>
            </div>
            <Link
              href="/products?filter=trending"
              className="flex items-center gap-1.5 text-sm text-primary-600
                         hover:text-primary-700 font-medium transition-colors"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as Product[]).map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </section>
  );
}
