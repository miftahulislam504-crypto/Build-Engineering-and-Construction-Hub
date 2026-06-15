"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package, Wrench, HardHat, Zap, Droplets,
  Layers, DoorOpen, BrickWall, Mountain, Shield,
  PenTool, Building, MapPin, ChevronRight,
  FlaskConical, Grid2X2, Hammer, Construction,
  Fence, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  {
    id: "dealership",
    label: "Dealership Products",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    children: [
      { label: "Cement",                slug: "cement",               icon: Construction,   brands: ["Holcim", "Shah Cement", "Crown Cement"] },
      { label: "Steel",                 slug: "steel",                icon: Wrench,         brands: ["BSRM", "GPH Ispat", "KSRM"] },
      { label: "Paint",                 slug: "paint",                icon: Layers,         brands: ["Berger", "Asian Paints", "Elite Paint", "Rainbow Paint"] },
      { label: "Electrical",            slug: "electrical",           icon: Zap,            brands: ["BRB Cable", "Bizli Cable", "Super Star", "SQ Group"] },
      { label: "Sanitary & Bathroom",   slug: "sanitary-bathroom",    icon: Droplets,       brands: ["Kohler", "Grohe", "Shine", "Bengal Sanitary"] },
      { label: "Chemical & Waterproofing", slug: "chemical-waterproofing", icon: FlaskConical, brands: ["Sika", "Dr Fixit"] },
      { label: "Tile & Ceramics",       slug: "tile-ceramics",        icon: Grid2X2,        brands: ["RAK Ceramics", "Akij Ceramics", "Great Wall"] },
      { label: "Doors & Windows",       slug: "doors-windows",        icon: DoorOpen,       brands: ["Bashundhara", "RFL"] },
    ],
  },
  {
    id: "contract",
    label: "Contract Materials",
    icon: HardHat,
    color: "text-orange-600",
    bg: "bg-orange-50",
    children: [
      { label: "Bricks",      slug: "bricks",      icon: BrickWall, brands: ["First Class Brick", "Picked Brick", "Fly Ash Brick"] },
      { label: "Sand",        slug: "sand",         icon: Mountain,  brands: ["Fine Sand", "Medium Sand", "Sylhet Sand"] },
      { label: "Stone Chips", slug: "stone-chips",  icon: Fence,     brands: ["20mm Chips", "10mm Chips"] },
    ],
  },
  {
    id: "essentials",
    label: "Construction Essentials",
    icon: Shield,
    color: "text-green-600",
    bg: "bg-green-50",
    children: [
      { label: "Safety Equipment",  slug: "safety-equipment",  icon: Shield,  brands: ["Safety Helmet", "Safety Gloves", "Safety Vest", "N95 Mask", "Normal Mask"] },
      { label: "Tools & Equipment", slug: "tools-equipment",   icon: Hammer,  brands: ["Rope", "Measuring Tape", "Wheelbarrow", "Shovel", "Spade", "Broom"] },
    ],
  },
  {
    id: "services",
    label: "Engineering Services",
    icon: Wrench,
    color: "text-purple-600",
    bg: "bg-purple-50",
    children: [
      { label: "Design Services",      slug: "design-services",      icon: PenTool,       brands: ["Architectural Design", "Structural Design", "Electrical Design", "Plumbing Design"] },
      { label: "Construction Services",slug: "construction-services", icon: Building,      brands: ["Building Construction", "Renovation", "Interior Works", "Project Supervision"] },
      { label: "Consultancy Services", slug: "consultancy-services",  icon: ClipboardList, brands: ["BOQ Preparation", "Estimation & Costing", "Project Planning", "Site Inspection"] },
      { label: "Survey Services",      slug: "survey-services",       icon: MapPin,        brands: ["Land Survey", "Topographic Survey", "Setting Out"] },
    ],
  },
];

interface Props {
  onClose: () => void;
  mobile?: boolean;
}

export default function MegaMenu({ onClose, mobile = false }: Props) {
  const [activeGroup, setActiveGroup] = useState(MENU[0].id);

  const active = MENU.find((m) => m.id === activeGroup)!;

  if (mobile) {
    return (
      <div className="p-4 space-y-2">
        {MENU.map((group) => (
          <div key={group.id}>
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider
                           px-2 pt-3 pb-1">
              {group.label}
            </p>
            {group.children.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                             hover:bg-dark-50 transition-colors"
                >
                  <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-dark-100">
                    <CatIcon size={15} className="text-dark-600" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-dark-700">{cat.label}</p>
                    <p className="text-xs text-dark-400">
                      {cat.brands.slice(0, 2).join(", ")}
                      {cat.brands.length > 2 && ` +${cat.brands.length - 2}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Desktop Mega Menu
  return (
    <div className="container-main">
      <div className="flex gap-0 bg-white rounded-b-2xl shadow-card-hover
                      border border-t-0 border-dark-100 overflow-hidden"
           style={{ maxHeight: "460px" }}>

        {/* Left — Group tabs */}
        <div className="w-56 flex-shrink-0 bg-dark-50 border-r border-dark-100 overflow-y-auto">
          {MENU.map((group) => {
            const Icon = group.icon;
            return (
              <button
                key={group.id}
                onMouseEnter={() => setActiveGroup(group.id)}
                onClick={() => setActiveGroup(group.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium",
                  "border-l-2 transition-all duration-150 text-left",
                  activeGroup === group.id
                    ? "border-primary-600 bg-white text-primary-700"
                    : "border-transparent text-dark-600 hover:bg-dark-100"
                )}
              >
                <span className={cn("p-1.5 rounded-lg", group.bg)}>
                  <Icon size={15} className={group.color} />
                </span>
                {group.label}
                <ChevronRight size={14} className="ml-auto text-dark-300" />
              </button>
            );
          })}
        </div>

        {/* Right — Sub categories */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {active.children.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.slug} className="space-y-2">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 font-semibold text-dark-800
                               hover:text-primary-600 transition-colors text-sm group"
                  >
                    <CatIcon size={15} className="text-dark-500 flex-shrink-0" />
                    {cat.label}
                    <ChevronRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                  <ul className="space-y-1 pl-5">
                    {cat.brands.map((brand) => (
                      <li key={brand}>
                        <Link
                          href={`/brand/${brand.toLowerCase().replace(/ /g, "-")}`}
                          onClick={onClose}
                          className="text-xs text-dark-500 hover:text-primary-600
                                     transition-colors block py-0.5"
                        >
                          {brand}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
