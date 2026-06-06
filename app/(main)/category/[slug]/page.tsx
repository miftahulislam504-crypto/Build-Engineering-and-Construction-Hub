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
import { getCategoryBySlug, getCategories } from "@/lib/firestore";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import type { Product, Category } from "@/lib/types";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const [category,    setCategory]    = useState<any>(null);
  const [subCategories, setSubCats]   = useState<Category[]>([]);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    getCategoryBySlug(slug as string).then(async (cat) => {
      if (!cat) { setLoading(false); return; }
      setCategory(cat);

      // Sub categories
      const subs = await getCategories(cat.id);
      setSubCats(subs as Category[]);

      // Products in this category
      const snap = await getDocs(
        query(
          collection(db, "products"),
          where("categoryId", "==", cat.id),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(24)
        )
      );
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
    }).finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-10">
        <div className="container-main">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-primary-200 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight size={12} />
            <span className="text-white">{category?.name || slug}</span>
          </nav>
          <h1 className="font-display text-3xl font-bold mb-2">
            {loading ? "Loading..." : category?.name || "Category"}
          </h1>
          {!loading && products.length > 0 && (
            <p className="text-primary-200 text-sm">
              {products.length} products found
            </p>
          )}
        </div>
      </div>

      <div className="container-main py-8">
        {/* Sub Categories */}
        {subCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display font-bold text-dark-900 text-lg mb-4">
              Sub Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="px-4 py-2 rounded-xl border border-dark-200
                             hover:border-primary-400 hover:bg-primary-50
                             text-sm font-medium text-dark-600
                             hover:text-primary-700 transition-all"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark-400 text-sm mb-4">
              No products found in this category yet.
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
