"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import type { Product } from "@/lib/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [results,  setResults]  = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);

    // Firestore-এ full-text search নেই, তাই name-এর শুরু দিয়ে search করি
    // Production-এ Algolia বা Typesense ব্যবহার করবে
    const searchLower = q.toLowerCase();

    getDocs(
      query(
        collection(db, "products"),
        where("isActive", "==", true),
        orderBy("name"),
        limit(50)
      )
    ).then((snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
      // Client-side filter
      const filtered = all.filter((p) =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.brand?.name?.toLowerCase().includes(searchLower) ||
        p.shortDescription?.toLowerCase().includes(searchLower)
      );
      setResults(filtered);
    }).finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container-main py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-dark-900 mb-1">
          Search Results
        </h1>
        {q && !loading && (
          <p className="text-dark-400 text-sm">
            {results.length} results for &quot;<span className="text-dark-700 font-medium">{q}</span>&quot;
          </p>
        )}
      </div>

      {/* Results */}
      {!q ? (
        <div className="card p-16 text-center">
          <Search size={48} className="text-dark-200 mx-auto mb-4" />
          <p className="text-dark-400">Enter a search term to find products</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <div className="card p-16 text-center">
          <Search size={48} className="text-dark-200 mx-auto mb-4" />
          <p className="font-medium text-dark-500 mb-2">No results found</p>
          <p className="text-sm text-dark-400">
            Try different keywords or browse our categories
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
