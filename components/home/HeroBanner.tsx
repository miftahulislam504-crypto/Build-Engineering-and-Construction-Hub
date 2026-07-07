"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroBanners } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const GRADIENT_BG = [
  "from-primary-900 via-primary-800 to-primary-700",
  "from-dark-900 via-dark-800 to-primary-900",
  "from-primary-800 via-dark-900 to-dark-800",
];

const DEFAULT_BANNERS = [
  { title: "Building Construction Materials",   link: "/products",      imageUrl: "" },
  { title: "Engineering Consultancy Services",  link: "/services",      imageUrl: "" },
  { title: "Bulk Material Supply",              link: "/quotation/new", imageUrl: "" },
];

export default function HeroBanner() {
  const { data, isLoading }  = useHeroBanners();
  const banners = (data && data.length > 0 ? data : DEFAULT_BANNERS) as any[];
  const [current, setCurrent] = useState(0);

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

  if (isLoading) {
    return <div className="w-full h-[320px] sm:h-[400px] md:h-[500px] skeleton" />;
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        {banners.map((banner: any, i: number) =>
          i === current ? (
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              {banner.imageUrl ? (
                <>
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent
                                  flex items-center">
                    <div className="container-main text-white">
                      <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                        className="font-display text-3xl sm:text-4xl md:text-5xl
                                   font-bold mb-4 leading-tight max-w-xl"
                      >
                        {banner.title}
                      </motion.h1>
                      {banner.link && (
                        <motion.div
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        >
                          <Link
                            href={banner.link}
                            className="inline-flex items-center gap-2 bg-primary-600
                                       hover:bg-primary-700 text-white font-medium
                                       px-6 py-2.5 rounded-xl transition-colors text-sm
                                       hover:scale-105 active:scale-95 transition-transform"
                          >
                            Shop Now
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className={cn(
                  "w-full h-full bg-gradient-to-br flex items-center justify-center",
                  GRADIENT_BG[i % GRADIENT_BG.length]
                )}>
                  <div className="text-center text-white px-8 max-w-2xl">
                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                      className="text-xs font-medium uppercase tracking-widest
                                 text-primary-200 mb-4"
                    >
                      BuildMart BD
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                      className="font-display text-3xl sm:text-4xl md:text-5xl
                                 font-bold mb-4 leading-tight"
                    >
                      {banner.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.32, ease: "easeOut" }}
                      className="text-primary-100 text-sm sm:text-base mb-8 max-w-md mx-auto"
                    >
                      Bangladesh-এর সেরা Construction Materials ও Engineering Services
                    </motion.p>
                    {banner.link && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.44, ease: "easeOut" }}
                      >
                        <Link
                          href={banner.link}
                          className="inline-flex items-center gap-2 bg-white text-primary-800
                                     font-semibold px-7 py-3 rounded-xl hover:bg-primary-50
                                     transition-colors text-sm hover:scale-105 active:scale-95
                                     transition-transform"
                        >
                          Explore Now <ChevronRight size={16} />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <motion.button
            onClick={prev}
            aria-label="Previous banner"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 rounded-full bg-white/20 hover:bg-white/40
                       backdrop-blur-sm text-white flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <motion.button
            onClick={next}
            aria-label="Next banner"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 rounded-full bg-white/20 hover:bg-white/40
                       backdrop-blur-sm text-white flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </motion.button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20
                        flex items-center gap-2">
          {banners.map((_: any, i: number) => (
            <motion.button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              whileTap={{ scale: 0.85 }}
              animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-2 rounded-full bg-white"
            />
          ))}
        </div>
      )}
    </div>
  );
}
