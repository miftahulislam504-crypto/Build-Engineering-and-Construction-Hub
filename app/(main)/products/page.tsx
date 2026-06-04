"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs, QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCategories, getBrands } from "@/lib/firestore";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { cn, formatPrice } from "@/lib/utils";
import type { Product, Category, Brand } from "@/lib/types";

const SORT_OPTIONS = [
  { label: "Newest",        value: "newest"     },
  { label: "Price: Low",    value: "price_asc"  },
  { label: "Price: High",   value: "price_desc" },
  { label: "Popularity",    value: "popularity" },
];

// ── Inner component that uses useSearchParams ──
function ProductsContent() {
  const searchParams = useSearchParams();
  const filterParam  = searchParams.get("filter");
  const catParam     = searchParams.get("category");
  const brandParam   = searchParams.get("brand");

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands,     setBrands]     = useState<Brand[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  // Active filters
  const [selCategory, setSelCategory] = useState(catParam   || "");
  const [selBrand,    setSelBrand]    = useState(brandParam || "");
  const [selType,     setSelType]     = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [sortBy,      setSortBy]      = useState("newest");

  // Fetch filter options
  useEffect(() => {
    getCategories(null).then((c) => setCategories(c as Category[]));
    getBrands().then((b) => setBrands(b as Brand[]));
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const constraints: QueryConstraint[] = [
        where("isActive", "==", true),
      ];

      if (filterParam === "featured")    constraints.push(where("isFeatured",    "==", true));
      if (filterParam === "trending")    constraints.push(where("isTrending",    "==", true));
      if (filterParam === "bestselling") constraints.push(where("isBestSelling", "==", true));
      if (filterParam === "new")         constraints.push(where("isNewArrival",  "==", true));
      if (selCategory) constraints.push(where("categoryId", "==", selCategory));
      if (selBrand)    constraints.push(where("brandId",    "==", selBrand));
      if (selType)     constraints.push(where("productType","==", selType));

      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(limit(24));

      const snap = await getDocs(query(collection(db, "products"), ...constraints));
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];

      // Client-side price filter
      if (minPrice) data = data.filter((p) => (p.discountPrice ?? p.price) >= Number(minPrice));
      if (maxPrice) data = data.filter((p) => (p.discountPrice ?? p.price) <= Number(maxPrice));

      // Sort
      if (sortBy === "price_asc")  data.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      if (sortBy === "price_desc") data.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      if (sortBy === "popularity") data.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterParam, selCategory, selBrand, selType, minPrice, maxPrice, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function clearFilters() {
    setSelCategory(""); setSelBrand(""); setSelType("");
    setMinPrice(""); setMaxPrice(""); setSortBy("newest");
  }

  const hasFilters = selCategory || selBrand || selType || minPrice || maxPrice;

  return (
    <div className="container-main py-8">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Filter Sidebar ── */}
        <aside className={cn(
          "w-full lg:w-60 flex-shrink-0",
          "lg:block",
          showFilter ? "block" : "hidden lg:block"
        )}>
          <div className="card p-5 sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-dark-900">Filters</p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Category */}
            <FilterSection title="Category">
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" value=""
                    checked={selCategory === ""}
                    onChange={() => setSelCategory("")}
                    className="accent-primary-600" />
                  <span className="text-sm text-dark-600">All Categories</span>
                </label>
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" value={c.id}
                      checked={selCategory === c.id}
                      onChange={() => setSelCategory(c.id)}
                      className="accent-primary-600" />
                    <span className="text-sm text-dark-600">{c.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Brand */}
            <FilterSection title="Brand">
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="brand" value=""
                    checked={selBrand === ""}
                    onChange={() => setSelBrand("")}
                    className="accent-primary-600" />
                  <span className="text-sm text-dark-600">All Brands</span>
                </label>
                {brands.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="brand" value={b.id}
                      checked={selBrand === b.id}
                      onChange={() => setSelBrand(b.id)}
                      className="accent-primary-600" />
                    <span className="text-sm text-dark-600">{b.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Product Type */}
            <FilterSection title="Product Type">
              <div className="space-y-1.5">
                {[
                  { label: "All Types",    value: ""            },
                  { label: "Dealership",   value: "dealership"  },
                  { label: "Contract",     value: "contract"    },
                  { label: "Essential",    value: "essential"   },
                ].map(({ label, value }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value={value}
                      checked={selType === value}
                      onChange={() => setSelType(value)}
                      className="accent-primary-600" />
                    <span className="text-sm text-dark-600">{label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range (৳)">
              <div className="flex gap-2">
                <input type="number" placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input text-sm py-1.5 px-2" />
                <input type="number" placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input text-sm py-1.5 px-2" />
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* ── Product Area ── */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div>
              <h1 className="font-display font-bold text-dark-900 text-xl">
                {filterParam === "featured"    ? "Featured Products"  :
                 filterParam === "trending"    ? "Trending Products"  :
                 filterParam === "bestselling" ? "Best Selling"       :
                 filterParam === "new"         ? "New Arrivals"       :
                 "All Products"}
              </h1>
              {!loading && (
                <p className="text-sm text-dark-400 mt-0.5">
                  {products.length} products found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="lg:hidden btn-secondary btn-sm flex items-center gap-2"
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input py-2 text-sm w-40"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length > 0
                ? products.map((p) => <ProductCard key={p.id} product={p} />)
                : (
                  <div className="col-span-4 card p-14 text-center">
                    <p className="text-dark-400">No products found with these filters.</p>
                    <button onClick={clearFilters} className="btn-primary btn-sm mt-4 inline-flex">
                      Clear Filters
                    </button>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading fallback ──
function ProductsLoading() {
  return (
    <div className="container-main py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Default export with Suspense boundary ──
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-dark-100 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <p className="text-sm font-semibold text-dark-700">{title}</p>
        {open ? <ChevronUp size={15} className="text-dark-400" /> : <ChevronDown size={15} className="text-dark-400" />}
      </button>
      {open && children}
    </div>
  );
}
