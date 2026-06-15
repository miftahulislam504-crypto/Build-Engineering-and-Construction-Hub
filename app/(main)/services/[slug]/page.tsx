"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, CheckCircle2, ChevronRight, ChevronDown,
  ChevronUp, Calendar, MessageSquare, Loader2, Phone,
  PenTool, Construction, ClipboardList, MapPin,
} from "lucide-react";
import { getServiceBySlug } from "@/lib/firestore";
import { createServiceRequest } from "@/lib/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice, cn } from "@/lib/utils";
import { generateOrderNumber } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ServiceDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);

  const [service,    setService]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [selPackage, setSelPackage] = useState(0);
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);
  const [showBook,   setShowBook]   = useState(false);

  // Booking form state
  const [bookForm, setBookForm] = useState({
    projectDetails: "",
    location:       "",
    preferredDate:  "",
    phone:          "",
  });
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    getServiceBySlug(slug as string)
      .then((data) => {
        if (data) setService(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    if (!bookForm.projectDetails || !bookForm.location) {
      toast.error("Please fill all required fields"); return;
    }
    setBooking(true);
    try {
      const pkg = service.packages?.[selPackage];
      await createServiceRequest({
        userId:         user.id,
        serviceId:      service.id,
        serviceName:    service.name,
        packageName:    pkg?.name || "",
        status:         "pending",
        projectDetails: bookForm.projectDetails,
        location:       bookForm.location,
        preferredDate:  bookForm.preferredDate || null,
        totalAmount:    pkg?.price || service.startingPrice,
        phone:          bookForm.phone || user.phone || "",
        timeline:       [],
      });
      toast.success("Service booked successfully!");
      router.push("/dashboard/services");
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="container-main py-10 space-y-4">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-8 w-1/2 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container-main py-16 text-center">
        <p className="text-dark-400">Service not found.</p>
        <Link href="/services" className="btn-primary mt-4 inline-flex">
          Back to Services
        </Link>
      </div>
    );
  }

  const activePackage = service.packages?.[selPackage];

  return (
    <div className="bg-white">
      <div className="container-main py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-dark-400 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight size={12} />
          <Link href="/services" className="hover:text-primary-600">Services</Link>
          <ChevronRight size={12} />
          <span className="text-dark-600">{service.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Content ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero image */}
            <div className="rounded-2xl overflow-hidden h-64 bg-gradient-to-br
                             from-primary-100 to-primary-50 flex items-center justify-center">
              {service.images?.[0] ? (
                <img src={service.images[0]} alt={service.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-primary-200">
                  {service.serviceCategory === "design"       ? <PenTool size={48} className="text-primary-700" /> :
                   service.serviceCategory === "construction" ? <Construction size={48} className="text-primary-700" /> :
                   service.serviceCategory === "consultancy"  ? <ClipboardList size={48} className="text-primary-700" /> :
                                                                <MapPin size={48} className="text-primary-700" />}
                </div>
              )}
            </div>

            {/* Title & rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-blue badge capitalize text-xs">
                  {service.serviceCategory}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-dark-900 mb-3">
                {service.name}
              </h1>
              {service.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={15}
                        className={cn(
                          i < Math.round(service.avgRating || 0)
                            ? "text-yellow-400 fill-yellow-400" : "text-dark-200"
                        )} />
                    ))}
                  </div>
                  <span className="text-sm text-dark-500">
                    {service.avgRating?.toFixed(1)} ({service.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display font-bold text-dark-900 text-xl mb-3">
                Service Overview
              </h2>
              <p className="text-dark-600 text-sm leading-relaxed">
                {service.description || service.shortDescription}
              </p>
            </div>

            {/* Process Steps */}
            {service.processSteps?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-dark-900 text-xl mb-4">
                  How It Works
                </h2>
                <div className="space-y-4">
                  {service.processSteps.map((step: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-primary-600 text-white
                                       flex items-center justify-center flex-shrink-0
                                       font-bold text-sm">
                        {step.step || i + 1}
                      </div>
                      <div className="pt-1">
                        <p className="font-semibold text-dark-800 text-sm mb-0.5">
                          {step.title}
                        </p>
                        <p className="text-xs text-dark-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages */}
            {service.packages?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-dark-900 text-xl mb-4">
                  Pricing Packages
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {service.packages.map((pkg: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => setSelPackage(i)}
                      className={cn(
                        "card p-5 cursor-pointer transition-all",
                        selPackage === i
                          ? "border-primary-500 bg-primary-50 shadow-card-hover"
                          : "hover:border-dark-300"
                      )}
                    >
                      {pkg.isPopular && (
                        <span className="badge-blue badge text-2xs mb-2">Popular</span>
                      )}
                      <p className="font-display font-bold text-dark-900 mb-1">
                        {pkg.name}
                      </p>
                      <p className="text-xl font-bold text-primary-700 mb-3">
                        {formatPrice(pkg.price)}
                      </p>
                      {pkg.duration && (
                        <p className="text-xs text-dark-400 mb-3">
                          Duration: {pkg.duration}
                        </p>
                      )}
                      {Array.isArray(pkg.deliverables) && (
                        <ul className="space-y-1.5">
                          {pkg.deliverables.map((d: string, j: number) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-dark-600">
                              <CheckCircle2 size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {service.faqs?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-dark-900 text-xl mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2">
                  {service.faqs.map((faq: any, i: number) => (
                    <div key={i} className="card overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <p className="text-sm font-medium text-dark-800 pr-4">
                          {faq.question}
                        </p>
                        {openFaq === i
                          ? <ChevronUp size={16} className="text-dark-400 flex-shrink-0" />
                          : <ChevronDown size={16} className="text-dark-400 flex-shrink-0" />
                        }
                      </button>
                      {openFaq === i && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-dark-500 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-5">

            {/* Price card */}
            <div className="card p-6 sticky top-24">
              <p className="text-sm text-dark-400 mb-1">Starting from</p>
              <p className="font-display text-3xl font-bold text-primary-700 mb-4">
                {formatPrice(activePackage?.price || service.startingPrice)}
              </p>

              {activePackage && (
                <p className="text-sm text-dark-500 mb-5">
                  Package: <span className="font-semibold text-dark-700">
                    {activePackage.name}
                  </span>
                  {activePackage.duration && (
                    <span className="text-dark-400"> · {activePackage.duration}</span>
                  )}
                </p>
              )}

              {/* Book button */}
              <button
                id="book"
                onClick={() => {
                  if (!user) { router.push("/auth/login"); return; }
                  setShowBook(true);
                }}
                className="btn-primary w-full justify-center btn-lg mb-3"
              >
                <Calendar size={18} /> Book Service
              </button>

              {/* Quote button */}
              <Link
                href={`/quotation/new?service=${service.id}`}
                className="btn-secondary w-full justify-center"
              >
                <MessageSquare size={17} /> Request Quote
              </Link>

              {/* Contact */}
              <div className="mt-5 pt-5 border-t border-dark-100">
                <p className="text-xs text-dark-400 mb-3 text-center">
                  Have questions? Call us
                </p>
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_CALL_NUMBER}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-4
                             rounded-xl border border-dark-200 text-sm font-medium
                             text-dark-700 hover:border-primary-300 hover:text-primary-700
                             transition-colors"
                >
                  <Phone size={15} />
                  {process.env.NEXT_PUBLIC_CALL_NUMBER || "Call Now"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Modal ── */}
      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBook(false)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg
                           p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-bold text-dark-900 mb-5">
              Book: {service.name}
            </h2>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="label">Project Details</label>
                <textarea
                  value={bookForm.projectDetails}
                  onChange={(e) => setBookForm((f) => ({ ...f, projectDetails: e.target.value }))}
                  placeholder="Describe your project requirements..."
                  rows={3}
                  className="input resize-none"
                  required
                />
              </div>
              <div>
                <label className="label">Project Location</label>
                <input
                  type="text"
                  value={bookForm.location}
                  onChange={(e) => setBookForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Gulshan-2, Dhaka"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">
                  Preferred Date
                  <span className="text-dark-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="date"
                  value={bookForm.preferredDate}
                  onChange={(e) => setBookForm((f) => ({ ...f, preferredDate: e.target.value }))}
                  className="input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="label">Contact Phone</label>
                <input
                  type="tel"
                  value={bookForm.phone}
                  onChange={(e) => setBookForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  className="input"
                  defaultValue={user?.phone || ""}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBook(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="btn-primary flex-1 justify-center"
                >
                  {booking ? (
                    <><Loader2 size={16} className="animate-spin" /> Booking...</>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
