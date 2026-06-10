import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800
                    to-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 Number */}
        <div className="relative mb-8">
          <p className="text-[120px] sm:text-[160px] font-display font-bold
                         text-white/10 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center
                               justify-center mx-auto mb-3 backdrop-blur-sm">
                <Search size={36} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-primary-200 text-sm sm:text-base mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Please check the URL or navigate back to home.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-white text-primary-800
                       font-semibold px-6 py-3 rounded-xl hover:bg-primary-50
                       transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <Home size={17} />
            Go to Home
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20
                       text-white font-medium px-6 py-3 rounded-xl
                       transition-colors text-sm w-full sm:w-auto justify-center
                       backdrop-blur-sm border border-white/20"
          >
            Browse Products
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-primary-300 text-xs mb-4">Popular pages</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Cement",     href: "/category/cement"        },
              { label: "Steel",      href: "/category/steel"         },
              { label: "Services",   href: "/services"               },
              { label: "Calculator", href: "/calculator"             },
              { label: "Contact",    href: "/contact"                },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20
                           text-white text-xs font-medium transition-colors
                           border border-white/10"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
