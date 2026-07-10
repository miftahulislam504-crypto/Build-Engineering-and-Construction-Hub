"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Youtube, Linkedin } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

const PRODUCT_LINKS = [
  { label: "Cement",                 href: "/category/cement"                },
  { label: "Steel",                  href: "/category/steel"                 },
  { label: "Paint",                  href: "/category/paint"                 },
  { label: "Electrical",             href: "/category/electrical"            },
  { label: "Sanitary & Bathroom",    href: "/category/sanitary-bathroom"     },
  { label: "Chemical & Waterproofing", href: "/category/chemical-waterproofing" },
  { label: "Tile & Ceramics",        href: "/category/tile-ceramics"         },
  { label: "Doors & Windows",        href: "/category/doors-windows"         },
];

const CONTRACT_LINKS = [
  { label: "Bricks",       href: "/category/bricks"       },
  { label: "Sand",         href: "/category/sand"         },
  { label: "Stone Chips",  href: "/category/stone-chips"  },
];

const SERVICE_LINKS = [
  { label: "Design Services",       href: "/services/design-services"       },
  { label: "Construction Services", href: "/services/construction-services" },
  { label: "Consultancy Services",  href: "/services/consultancy-services"  },
  { label: "Survey Services",       href: "/services/survey-services"       },
];

const QUICK_LINKS = [
  { label: "About Us",        href: "/about"           },
  { label: "Contact Us",      href: "/contact"         },
  { label: "Blog",            href: "/blog"            },
  { label: "Engineering News",href: "/blog?cat=news"   },
  { label: "Bulk Order",      href: "/bulk-order"      },
  { label: "Request Quote",   href: "/quotation/new"   },
  { label: "Track Order",     href: "/dashboard/orders"},
  { label: "Privacy Policy",  href: "/privacy-policy"  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-dark-300">

      {/* ── Main Footer ── */}
      <div className="container-main py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="EngineX Mart" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-display font-bold text-white text-xl leading-tight">
                  EngineX Mart
                </p>
                <p className="text-dark-400 text-xs">
                  Construction Marketplace
                </p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-dark-400 max-w-xs">
              Bangladesh-এর সেরা Civil Engineering Construction Materials ও
              Engineering Services Marketplace। সব ধরনের নির্মাণ সামগ্রী এক জায়গায়।
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`tel:${process.env.NEXT_PUBLIC_CALL_NUMBER}`}
                className="flex items-center gap-3 text-sm hover:text-white
                           transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center
                                justify-center group-hover:bg-primary-600 transition-colors">
                  <Phone size={14} />
                </div>
                {process.env.NEXT_PUBLIC_CALL_NUMBER || "+880 1XXX-XXXXXX"}
              </a>

              <a
                href={whatsappLink(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-white
                           transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center
                                justify-center group-hover:bg-green-600 transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                  </svg>
                </div>
                WhatsApp করুন
              </a>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center">
                  <MapPin size={14} />
                </div>
                Dhaka, Bangladesh
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: Facebook, href: "#", label: "Facebook"  },
                { icon: Youtube,  href: "#", label: "Youtube"   },
                { icon: Linkedin, href: "#", label: "LinkedIn"  },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-dark-800 hover:bg-primary-600
                             flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="font-display font-semibold text-white mb-5 text-sm uppercase
                           tracking-wider">
              Products
            </p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {CONTRACT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="font-display font-semibold text-white mb-5 text-sm uppercase
                           tracking-wider">
              Services
            </p>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-display font-semibold text-white mb-5 text-sm uppercase
                           tracking-wider">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Payment Methods ── */}
      <div className="border-t border-dark-800">
        <div className="container-main py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-400">We Accept</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {["bKash", "Nagad", "Rocket", "VISA", "Mastercard"].map((method) => (
                <div
                  key={method}
                  className="px-3 py-1.5 bg-dark-800 rounded-lg text-xs font-medium
                             text-dark-300 border border-dark-700"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-dark-800">
        <div className="container-main py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-dark-500 text-center sm:text-left">
              &copy; {year} EngineX Mart. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: "Terms",   href: "/terms"          },
                { label: "Privacy", href: "/privacy-policy" },
                { label: "Refund",  href: "/refund-policy"  },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
