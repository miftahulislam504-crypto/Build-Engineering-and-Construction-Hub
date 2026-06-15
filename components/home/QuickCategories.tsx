import Link from "next/link";
import {
  Construction, Wrench, Layers, Zap, Droplets,
  FlaskConical, SquareSquare, DoorOpen, BrickWall,
  Mountain, Fence, Shield, Hammer,
} from "lucide-react";

const CATS = [
  { label: "Cement",        slug: "cement",               href: null,       Icon: Construction,  color: "bg-blue-50   text-blue-700"   },
  { label: "Steel",         slug: "steel",                href: null,       Icon: Wrench,         color: "bg-gray-50   text-gray-700"   },
  { label: "Paint",         slug: "paint",                href: null,       Icon: Layers,         color: "bg-pink-50   text-pink-700"   },
  { label: "Electrical",    slug: "electrical",           href: null,       Icon: Zap,            color: "bg-yellow-50 text-yellow-700" },
  { label: "Sanitary",      slug: "sanitary-bathroom",    href: null,       Icon: Droplets,       color: "bg-cyan-50   text-cyan-700"   },
  { label: "Waterproofing", slug: "chemical-waterproofing", href: null,     Icon: FlaskConical,   color: "bg-green-50  text-green-700"  },
  { label: "Tiles",         slug: "tile-ceramics",        href: null,       Icon: SquareSquare,   color: "bg-orange-50 text-orange-700" },
  { label: "Doors",         slug: "doors-windows",        href: null,       Icon: DoorOpen,       color: "bg-amber-50  text-amber-700"  },
  { label: "Bricks",        slug: "bricks",               href: null,       Icon: BrickWall,      color: "bg-red-50    text-red-700"    },
  { label: "Sand",          slug: "sand",                 href: null,       Icon: Mountain,       color: "bg-yellow-50 text-yellow-700" },
  { label: "Stone Chips",   slug: "stone-chips",          href: null,       Icon: Fence,          color: "bg-stone-50  text-stone-700"  },
  { label: "Safety",        slug: "safety-equipment",     href: null,       Icon: Shield,         color: "bg-lime-50   text-lime-700"   },
  { label: "Services",      slug: null,                   href: "/services", Icon: Hammer,        color: "bg-purple-50 text-purple-700" },
];

export default function QuickCategories() {
  return (
    <section className="py-10 bg-white">
      <div className="container-main">
        <h2 className="section-title">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {CATS.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href ?? `/category/${cat.slug}`}
              className="flex flex-col items-center gap-2.5 p-3 rounded-2xl
                         border border-dark-100 hover:border-primary-200
                         hover:shadow-card transition-all duration-200 group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center
                            ${cat.color} group-hover:scale-110
                            transition-transform duration-200`}
              >
                <cat.Icon size={22} />
              </div>
              <span className="text-xs font-medium text-dark-600 text-center
                               leading-tight group-hover:text-primary-700
                               transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
