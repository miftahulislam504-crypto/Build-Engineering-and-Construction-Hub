// components/home/CalculatorPreview.tsx
import Link from "next/link";
import { Calculator, ArrowRight, BarChart2, Ruler, DollarSign } from "lucide-react";
import { LucideIcon } from "lucide-react";

const TOOLS: { title: string; desc: string; href: string; Icon: LucideIcon }[] = [
  {
    title: "BOQ Generator",
    desc:  "Generate complete Bill of Quantities for your project",
    href:  "/calculator?tool=boq",
    Icon:  BarChart2,
  },
  {
    title: "Material Estimator",
    desc:  "Calculate cement, steel, brick, sand quantities",
    href:  "/calculator?tool=material",
    Icon:  Ruler,
  },
  {
    title: "Cost Estimator",
    desc:  "Get approximate construction cost for your project",
    href:  "/calculator?tool=cost",
    Icon:  DollarSign,
  },
];

export default function CalculatorPreview() {
  return (
    <section className="py-10 bg-gradient-to-br from-primary-900 to-primary-700">
      <div className="container-main">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full
                           px-4 py-1.5 mb-4">
            <Calculator size={16} className="text-primary-200" />
            <span className="text-primary-100 text-sm font-medium">
              Free Engineering Tools
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Engineering Calculators
          </h2>
          <p className="text-primary-200 text-sm max-w-md mx-auto">
            Plan your construction project accurately with our free calculation tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-white/10 hover:bg-white/20 border border-white/20
                         rounded-2xl p-6 text-white transition-all duration-200
                         group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center
                              justify-center mb-4">
                <tool.Icon size={22} className="text-white" />
              </div>
              <h3 className="font-display font-bold mb-2">{tool.title}</h3>
              <p className="text-primary-200 text-sm leading-relaxed">{tool.desc}</p>
              <div className="flex items-center gap-1.5 mt-4 text-primary-200
                               group-hover:text-white transition-colors text-sm font-medium">
                Try Now <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 bg-white text-primary-800
                       font-semibold px-7 py-3 rounded-xl hover:bg-primary-50
                       transition-colors text-sm"
          >
            Open All Calculators <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
