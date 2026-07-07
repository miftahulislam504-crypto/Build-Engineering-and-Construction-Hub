// components/home/BrandStrip.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getFeaturedBrands } from "@/lib/firestore";
import Reveal from "@/components/motion/Reveal";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";

const FALLBACK_BRANDS = [
  "Holcim", "Shah Cement", "BSRM", "GPH Ispat",
  "Berger", "Asian Paints", "BRB Cable", "Kohler",
  "Sika", "RAK Ceramics", "Bashundhara", "RFL",
];

export function BrandStrip() {
  const [brands, setBrands] = useState<string[]>(FALLBACK_BRANDS);

  useEffect(() => {
    getFeaturedBrands()
      .then((data) => {
        if (data.length > 0)
          setBrands(data.map((b: any) => b.name));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-8 bg-white border-y border-dark-100">
      <div className="container-main">
        <Reveal>
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider
                         mb-5 text-center">
            Trusted Brands
          </p>
        </Reveal>
        <StaggerGrid className="flex flex-wrap items-center justify-center gap-3">
          {brands.map((brand) => (
            <StaggerItem key={brand}>
              <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href={`/brand/${brand.toLowerCase().replace(/ /g, "-")}`}
                  className="block px-4 py-2 rounded-xl border border-dark-200
                             hover:border-primary-300 hover:bg-primary-50
                             text-sm font-medium text-dark-600 hover:text-primary-700
                             transition-colors duration-200"
                >
                  {brand}
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

export default BrandStrip;
