"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBanners } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import type { Banner } from "@/lib/types";

// Default banners যদি Firestore-এ কিছু না থাকে
const DEFAULT_BANNERS: Omit<Banner, "id">[] = [
  {
    title:     "Building Construction Materials",
    imageUrl:  "",
    link:      "/products",
    position:  "hero",
    isActive:  true,
    sortOrder: 1,
  },
  {
    title:     "Engineering Consultancy Services",
    imageUrl:  "",
    link:      "/services",
    position:  "hero",
    isActive:  true,
    sortOrder: 2,
  },
  {
    title:     "Bulk Material Supply",
    imageUrl:  "",
    link:      "/quotation/new",
    position:  "hero",
    isActive:  true,
    sortOrder: 3,
  },
];

const GRADIENT_BG = [
  "from-primary-900 via-primary-800 to-primary-700",
  "from-dark-900 via-dark-800 to-primary-900",
  "from-primary-800 via-dark-900 to-dark-800",
];

export default function HeroBanner() {
  const [banners,  setBanners]  = useState<any[]>([]);
  const [current,  setCurrent]  = useState(0);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getBanners("hero")
      .then((data) => {
        setBanners(data.length > 0 ? data : DEFAULT_BANNERS);
      })
      .catch(() => setBanners(DEFAULT_BANNERS))
      .finally(() => setLoading(false));
  }, []);

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  if (loading) {
    return <div className="w-full h-[400px] md:h-[500px] skeleton" />;
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] overflow-hidden">

      {/* Slides */}
      {banners.map((banner, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Placeholder gradient when no image */
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br flex items-center justify-center",
                GRADIENT_BG[i % GRADIENT_BG.length]
              )}
            >
              <div className="text-center text-white px-8 max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-widest
                               text-primary-200 mb-4">
                  BuildMart BD
                </p>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl
                               font-bold mb-4 leading-tight">
                  {banner.title}
                </h1>
                <p className="text-primary-100 text-sm sm:text-base mb-8 max-w-md mx-auto">
                  Bangladesh-এর সেরা Construction Materials ও Engineering Services Marketplace
                </p>
                {banner.link && (
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 bg-white text-primary-800
                               font-semibold px-7 py-3 rounded-xl hover:bg-primary-50
                               transition-colors text-sm"
                  >
                    Explore Now
                    <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Dark overlay for image banners */}
          {banner.imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent
                            flex items-center">
              <div className="container-main text-white">
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl
                               font-bold mb-4 leading-tight max-w-xl">
                  {banner.title}
                </h1>
                {banner.link && (
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 bg-primary-600
                               hover:bg-primary-700 text-white font-medium
                               px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Shop Now
                    <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Prev / Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 rounded-full bg-white/20 hover:bg-white/40
                       backdrop-blur-sm text-white flex items-center justify-center
                       transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 rounded-full bg-white/20 hover:bg-white/40
                       backdrop-blur-sm text-white flex items-center justify-center
                       transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20
                        flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 bg-white",
                i === current ? "w-6 opacity-100" : "w-2 opacity-50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
