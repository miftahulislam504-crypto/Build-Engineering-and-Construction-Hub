// hooks/useProducts.ts
// SWR দিয়ে data cache করা হয়েছে — বারবার load হবে না

import useSWR from "swr";
import { getProducts, getBanners, getServices, getBlogPosts, getFeaturedBrands } from "@/lib/firestore";

const SWR_CONFIG = {
  revalidateOnFocus:     false,
  revalidateOnReconnect: false,
  dedupingInterval:      60000, // 1 মিনিট cache
};

// ── Products ──
export function useFeaturedProducts() {
  return useSWR(
    "featured-products",
    () => getProducts({ isFeatured: true, limitCount: 8 }),
    SWR_CONFIG
  );
}

export function useTrendingProducts() {
  return useSWR(
    "trending-products",
    () => getProducts({ isTrending: true, limitCount: 4 }),
    SWR_CONFIG
  );
}

export function useBestSellingProducts() {
  return useSWR(
    "bestselling-products",
    () => getProducts({ isBestSelling: true, limitCount: 8 }),
    SWR_CONFIG
  );
}

export function useNewArrivals() {
  return useSWR(
    "new-arrivals",
    () => getProducts({ isNewArrival: true, limitCount: 8 }),
    SWR_CONFIG
  );
}

// ── Banners ──
export function useHeroBanners() {
  return useSWR(
    "hero-banners",
    () => getBanners("hero"),
    SWR_CONFIG
  );
}

// ── Brands ──
export function useFeaturedBrands() {
  return useSWR(
    "featured-brands",
    () => getFeaturedBrands(),
    SWR_CONFIG
  );
}

// ── Services ──
export function useFeaturedServices() {
  return useSWR(
    "featured-services",
    () => getServices(),
    SWR_CONFIG
  );
}

// ── Blog ──
export function useLatestBlogPosts() {
  return useSWR(
    "latest-blog-posts",
    () => getBlogPosts(),
    { ...SWR_CONFIG, dedupingInterval: 300000 } // 5 মিনিট cache
  );
}
