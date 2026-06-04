"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServices } from "@/lib/firestore";
import { formatPrice, cn } from "@/lib/utils";
import { MessageSquare, Calendar, Star } from "lucide-react";
import type { Service } from "@/lib/types";

const CATEGORIES = [
  { label: "All Services",          value: ""              },
  { label: "Design Services",       value: "design"        },
  { label: "Construction Services", value: "construction"  },
  { label: "Consultancy Services",  value: "consultancy"   },
  { label: "Survey Services",       value: "survey"        },
];

const FALLBACK_SERVICES = [
  {
    id: "1", slug: "architectural-design",
    name: "Architectural Design",
    serviceCategory: "design",
    shortDescription: "Complete architectural design for residential and commercial buildings including floor plan, elevation, and 3D view.",
    startingPrice: 15000,
    images: [],
    avgRating: 4.8, reviewCount: 24,
    packages: [{ name: "Basic", price: 15000 }, { name: "Standard", price: 25000 }, { name: "Premium", price: 45000 }],
  },
  {
    id: "2", slug: "structural-design",
    name: "Structural Design",
    serviceCategory: "design",
    shortDescription: "Professional structural engineering design ensuring safety and compliance with BNBC standards.",
    startingPrice: 20000,
    images: [],
    avgRating: 4.9, reviewCount: 18,
    packages: [{ name: "Basic", price: 20000 }, { name: "Standard", price: 35000 }],
  },
  {
    id: "3", slug: "boq-preparation",
    name: "BOQ Preparation",
    serviceCategory: "consultancy",
    shortDescription: "Detailed Bill of Quantities with accurate material takeoff for your construction project.",
    startingPrice: 8000,
    images: [],
    avgRating: 4.7, reviewCount: 32,
    packages: [{ name: "Basic", price: 8000 }, { name: "Standard", price: 15000 }],
  },
  {
    id: "4", slug: "land-survey",
    name: "Land Survey",
    serviceCategory: "survey",
    shortDescription: "Accurate land surveying with modern equipment and certified surveyors.",
    startingPrice: 5000,
    images: [],
    avgRating: 4.6, reviewCount: 15,
    packages: [{ name: "Basic", price: 5000 }, { name: "Standard", price: 10000 }],
  },
  {
    id: "5", slug: "building-construction",
    name: "Building Construction",
    serviceCategory: "construction",
    shortDescription: "Complete building construction service from foundation to finishing with quality materials.",
    startingPrice: 1500000,
    images: [],
    avgRating: 4.8, reviewCount: 8,
    packages: [{ name: "Standard", price: 1500000 }, { name: "Premium", price: 2500000 }],
  },
  {
    id: "6", slug: "renovation",
    name: "Renovation & Remodeling",
    serviceCategory: "construction",
    shortDescription: "Transform your existing space with professional renovation and interior remodeling services.",
    startingPrice: 200000,
    images: [],
    avgRating: 4.7, reviewCount: 21,
    packages: [{ name: "Basic", price: 200000 }, { name: "Premium", price: 500000 }],
  },
  {
    id: "7", slug: "electrical-design",
    name: "Electrical Design",
    serviceCategory: "design",
    shortDescription: "Complete electrical wiring design and load calculation for residential and commercial buildings.",
    startingPrice: 10000,
    images: [],
    avgRating: 4.6, reviewCount: 12,
    packages: [{ name: "Basic", price: 10000 }, { name: "Standard", price: 18000 }],
  },
  {
    id: "8", slug: "site-inspection",
    name: "Site Inspection",
    serviceCategory: "consultancy",
    shortDescription: "Professional site inspection and quality control service by certified engineers.",
    startingPrice: 3000,
    images: [],
    avgRating: 4.9, reviewCount: 45,
    packages: [{ name: "Single Visit", price: 3000 }, { name: "Monthly", price: 15000 }],
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>(FALLBACK_SERVICES);
  const [loading,  setLoading]  = useState(true);
  const [selCat,   setSelCat]   = useState("");

  useEffect(() => {
    getServices()
      .then((data) => { if (data.length > 0) setServices(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = selCat
    ? services.filter((s) => s.serviceCategory === selCat)
    : services;

  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-14">
        <div className="container-main text-center">
          <p className="text-primary-200 text-sm font-medium uppercase tracking-widest mb-3">
            Professional Engineering
          </p>
          <h1 className="font-display text-4xl font-bold mb-4">
            Engineering Services
          </h1>
          <p className="text-primary-100 max-w-xl mx-auto text-sm leading-relaxed">
            From architectural design to site supervision — expert engineers for every stage of your construction project.
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-8">
          {CATEGORIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelCat(value)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap",
                "transition-all duration-150",
                selCat === value
                  ? "bg-primary-600 text-white"
                  : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((svc) => (
            <div key={svc.id} className="card overflow-hidden group hover:shadow-card-hover transition-shadow">
              {/* Image / Gradient */}
              <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-50
                               relative overflow-hidden">
                {svc.images?.[0] ? (
                  <img src={svc.images[0]} alt={svc.name}
                    className="w-full h-full object-cover group-hover:scale-105
                               transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl">
                      {svc.serviceCategory === "design"       ? "✏️" :
                       svc.serviceCategory === "construction" ? "🏗️" :
                       svc.serviceCategory === "consultancy"  ? "📋" : "🗺️"}
                    </span>
                  </div>
                )}
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="badge-blue badge text-xs capitalize">
                    {svc.serviceCategory}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-dark-900 mb-2 text-base
                               group-hover:text-primary-700 transition-colors">
                  {svc.name}
                </h3>
                <p className="text-sm text-dark-500 line-clamp-2 mb-3 leading-relaxed">
                  {svc.shortDescription}
                </p>

                {/* Rating */}
                {svc.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-dark-600 font-medium">
                      {svc.avgRating?.toFixed(1)}
                    </span>
                    <span className="text-xs text-dark-400">
                      ({svc.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Packages preview */}
                {svc.packages?.length > 0 && (
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {svc.packages.slice(0, 3).map((pkg: any) => (
                      <span key={pkg.name}
                        className="text-2xs px-2 py-0.5 rounded-full bg-dark-100
                                   text-dark-500 font-medium">
                        {pkg.name}
                      </span>
                    ))}
                  </div>
                )}

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
                    <MessageSquare size={13} /> Quote
                  </Link>
                  <Link
                    href={`/services/${svc.slug}#book`}
                    className="flex-1 btn-primary btn-sm justify-center text-xs"
                  >
                    <Calendar size={13} /> Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-dark-400">No services found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
