import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2, Users, Award, Target,
  CheckCircle2, Phone, ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title:       "About Us | Build EngineX",
  description: "Learn about Build EngineX — Bangladesh's leading civil engineering construction materials and services marketplace.",
};

const STATS = [
  { label: "Products Listed",   value: "500+",  icon: Building2 },
  { label: "Happy Customers",   value: "2,000+",icon: Users      },
  { label: "Brands Available",  value: "50+",   icon: Award      },
  { label: "Years Experience",  value: "5+",    icon: Target     },
];

const VALUES = [
  {
    title: "Quality Assurance",
    desc:  "We work directly with authorized dealers to ensure every product is genuine and meets BNBC standards.",
  },
  {
    title: "Transparent Pricing",
    desc:  "No hidden charges. Real-time market prices for cement, steel, paint, and all construction materials.",
  },
  {
    title: "Expert Support",
    desc:  "Our team of civil engineers is always ready to help you choose the right materials for your project.",
  },
  {
    title: "Fast Delivery",
    desc:  "We deliver construction materials directly to your project site across Bangladesh.",
  },
];

const TEAM = [
  { name: "Engr. Rahim Ahmed",    role: "Founder & CEO",             initial: "R" },
  { name: "Engr. Karim Hossain",  role: "Head of Engineering",       initial: "K" },
  { name: "Sarah Islam",          role: "Head of Operations",        initial: "S" },
  { name: "Engr. Taufiq Ali",     role: "Technical Consultant",      initial: "T" },
];

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-20">
        <div className="container-main text-center">
          <p className="text-primary-200 text-sm font-medium uppercase tracking-widest mb-4">
            About Build EngineX
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5 max-w-3xl mx-auto">
            Bangladesh&apos;s Trusted Construction Marketplace
          </h1>
          <p className="text-primary-100 text-base max-w-2xl mx-auto leading-relaxed">
            Build EngineX is a one-stop marketplace connecting construction professionals,
            contractors, and homeowners with quality building materials and engineering
            services across Bangladesh.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-dark-900 py-12">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center
                                 justify-center mx-auto mb-3">
                  <Icon size={22} className="text-primary-400" />
                </div>
                <p className="font-display text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-dark-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-16">
        <div className="container-main max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-3">
                Our Mission
              </p>
              <h2 className="font-display text-3xl font-bold text-dark-900 mb-4">
                Making Construction Simpler for Everyone
              </h2>
              <p className="text-dark-500 text-sm leading-relaxed mb-5">
                We believe every construction project deserves access to quality materials
                at fair prices. Build EngineX was founded to eliminate the complexity of
                sourcing construction materials in Bangladesh — bringing together top
                brands, reliable contractors, and professional engineers in one platform.
              </p>
              <p className="text-dark-500 text-sm leading-relaxed">
                From a small apartment renovation to a large commercial project, we
                provide the materials, tools, and expertise you need to build better.
              </p>
            </div>
            <div className="space-y-4">
              {VALUES.map(({ title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center
                                   justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-800 text-sm mb-0.5">{title}</p>
                    <p className="text-dark-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <div className="py-14 bg-dark-50">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-dark-900 mb-3">
              What We Offer
            </h2>
            <p className="text-dark-400 text-sm max-w-lg mx-auto">
              Everything you need for your construction project — under one roof.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon:  "🏗️",
                title: "Dealership Products",
                desc:  "Holcim, BSRM, Berger, BRB Cable, Sika, RAK Ceramics and 50+ top brands.",
              },
              {
                icon:  "🧱",
                title: "Contract Materials",
                desc:  "Bricks, sand, stone chips and other bulk construction materials delivered to site.",
              },
              {
                icon:  "🦺",
                title: "Construction Essentials",
                desc:  "Safety equipment, tools, and accessories for every construction professional.",
              },
              {
                icon:  "✏️",
                title: "Design Services",
                desc:  "Architectural, structural, electrical and plumbing design by certified engineers.",
              },
              {
                icon:  "📋",
                title: "Consultancy",
                desc:  "BOQ preparation, cost estimation, project planning and site inspection services.",
              },
              {
                icon:  "🧮",
                title: "Free Calculators",
                desc:  "BOQ generator, material estimator, and cost estimator tools — completely free.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card p-5 hover:shadow-card-hover transition-shadow">
                <span className="text-4xl mb-4 block">{icon}</span>
                <h3 className="font-display font-bold text-dark-900 mb-2 text-base">{title}</h3>
                <p className="text-dark-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-14">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-dark-900 mb-3">Our Team</h2>
            <p className="text-dark-400 text-sm">
              Experienced engineers and professionals dedicated to your success
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-3xl mx-auto">
            {TEAM.map(({ name, role, initial }) => (
              <div key={name} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center
                                 justify-center mx-auto mb-3">
                  <span className="font-display font-bold text-primary-700 text-2xl">
                    {initial}
                  </span>
                </div>
                <p className="font-semibold text-dark-800 text-sm">{name}</p>
                <p className="text-dark-400 text-xs mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-14 bg-gradient-to-br from-primary-800 to-primary-600">
        <div className="container-main text-center text-white">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Build Something Great?
          </h2>
          <p className="text-primary-100 text-sm mb-8 max-w-md mx-auto">
            Browse our products, request a quotation, or speak with our engineering team today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="flex items-center gap-2 bg-white text-primary-800
                         font-semibold px-6 py-3 rounded-xl hover:bg-primary-50
                         transition-colors text-sm"
            >
              Browse Products <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20
                         text-white font-medium px-6 py-3 rounded-xl
                         border border-white/20 transition-colors text-sm"
            >
              <Phone size={16} /> Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
