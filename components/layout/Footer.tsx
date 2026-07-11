"use client";

import Link from "next/link";
import { Facebook, Youtube, Instagram, Mail } from "lucide-react";

// পরে আসল লিংক এখানে বসাবেন
const SOCIAL_LINKS = [
  { icon: Facebook,  href: "#", label: "Facebook"  },
  { icon: Youtube,   href: "#", label: "Youtube"   },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Mail,       href: "#", label: "Email"     },
];

const FOOTER_LINKS = [
  { label: "About Us",       href: "/about"          },
  { label: "Contact Us",     href: "/contact"        },
  { label: "Terms",          href: "/terms"          },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-dark-300">
      <div className="container-main py-12">
        <div className="flex flex-col items-center text-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="EngineX Mart" className="w-10 h-10 object-contain" />
            <p className="font-display font-bold text-white text-xl leading-tight">
              EngineX Mart
            </p>
          </Link>

          {/* Short Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-dark-400 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
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

          {/* Copyright */}
          <p className="text-xs text-dark-500 pt-2 border-t border-dark-800 w-full max-w-xs">
            &copy; {year} EngineX Mart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
