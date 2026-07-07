"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFeaturedProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import type { Product } from "@/lib/types";
import Reveal from "@/components/motion/Reveal";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";

export default function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts();

  return (
    <section className="py-10 bg-dark-50">
      <div className="container-main">
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">Featured Products</h2>
            <Link
              href="/products?filter=featured"
              className="flex items-center gap-1.5 text-sm text-primary-600
                         hover:text-primary-700 font-medium transition-colors"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (products?.length ?? 0) > 0 ? (
          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as Product[]).map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        ) : (
          <div className="text-center py-16 text-dark-400">
            No featured products yet.
          </div>
        )}
      </div>
    </section>
  );
}
