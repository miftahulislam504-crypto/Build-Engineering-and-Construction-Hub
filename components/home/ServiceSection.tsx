"use client";
// components/home/ServiceSection.tsx
import Link from "next/link";
import { ArrowRight, MessageSquare, Calendar, PenTool, Construction, ClipboardList, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const SERVICES: {
  slug: string;
  name: string;
  category: string;
  description: string;
  startingPrice: number;
  Icon: LucideIcon;
  color: string;
}[] = [
  {
    slug: "architectural-design",
    name: "Architectural Design",
    category: "Design Services",
    description: "Complete architectural design for residential and commercial buildings.",
    startingPrice: 15000,
    Icon: PenTool,
    color: "bg-blue-50 text-blue-700",
  },
  {
    slug: "structural-design",
    name: "Structural Design",
    category: "Design Services",
    description: "Professional structural engineering design with safety compliance.",
    startingPrice: 20000,
    Icon: Construction,
    color: "bg-orange-50 text-orange-700",
  },
  {
    slug: "boq-preparation",
    name: "BOQ Preparation",
    category: "Consultancy",
    description: "Detailed Bill of Quantities for accurate project cost estimation.",
    startingPrice: 8000,
    Icon: ClipboardList,
    color: "bg-green-50 text-green-700",
  },
  {
    slug: "land-survey",
    name: "Land Survey",
    category: "Survey Services",
    description: "Accurate land surveying with modern equipment and certified surveyors.",
    startingPrice: 5000,
    Icon: MapPin,
    color: "bg-purple-50 text-purple-700",
  },
];

export default function ServiceSection() {
  return (
    <section className="py-10 bg-white">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Engineering Services</h2>
          <Link
            href="/services"
            className="flex items-center gap-1.5 text-sm text-primary-600
                       hover:text-primary-700 font-medium transition-colors"
          >
            All Services <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((svc) => (
            <div key={svc.slug} className="card p-5 group hover:shadow-card-hover
                                           transition-shadow duration-200">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                               mb-4 ${svc.color}`}>
                <svc.Icon size={22} />
              </div>

              {/* Category */}
              <p className="text-xs text-dark-400 mb-1">{svc.category}</p>

              {/* Name */}
              <h3 className="font-display font-bold text-dark-800 mb-2 text-base">
                {svc.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-dark-500 mb-4 line-clamp-2 leading-relaxed">
                {svc.description}
              </p>

              {/* Price */}
              <p className="text-sm font-semibold text-primary-700 mb-4">
                Starting from {formatPrice(svc.startingPrice)}
              </p>

              {/* Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/services/${svc.slug}`}
                  className="flex-1 btn-secondary btn-sm justify-center text-xs"
                >
                  <MessageSquare size={13} />
                  Quote
                </Link>
                <Link
                  href={`/services/${svc.slug}#book`}
                  className="flex-1 btn-primary btn-sm justify-center text-xs"
                >
                  <Calendar size={13} />
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
