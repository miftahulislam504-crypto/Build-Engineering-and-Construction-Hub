// components/home/PromoBanner.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <section className="py-8 bg-dark-50">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Bulk Order CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-800 to-primary-600
                          p-8 text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full
                            bg-white/5" />
            <div className="absolute -right-2 -top-6 w-24 h-24 rounded-full
                            bg-white/5" />
            <div className="relative z-10">
              <p className="text-primary-200 text-xs font-semibold uppercase
                             tracking-wider mb-2">
                Special Offer
              </p>
              <h3 className="font-display text-2xl font-bold mb-3">
                Bulk Order?<br />Get Special Discount
              </h3>
              <p className="text-primary-100 text-sm mb-5 max-w-xs">
                Order in bulk and save more. Request a custom quotation for your project.
              </p>
              <Link
                href="/quotation/new"
                className="inline-flex items-center gap-2 bg-white text-primary-700
                           font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50
                           transition-colors text-sm"
              >
                Request Quote <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Engineering Services CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-dark-900 to-dark-800
                          p-8 text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full
                            bg-white/5" />
            <div className="relative z-10">
              <p className="text-dark-400 text-xs font-semibold uppercase
                             tracking-wider mb-2">
                Professional Services
              </p>
              <h3 className="font-display text-2xl font-bold mb-3">
                Need Engineering<br />Consultancy?
              </h3>
              <p className="text-dark-300 text-sm mb-5 max-w-xs">
                From architectural design to project supervision, we have expert engineers.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-primary-600
                           hover:bg-primary-700 text-white font-medium
                           px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Our Services <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
