"use client";

import { useState, useEffect } from "react";
import { Calculator, Download, RotateCcw } from "lucide-react";
import { getMaterialRates } from "@/lib/firestore";
import { formatPrice, cn } from "@/lib/utils";

const TOOLS = [
  { id: "material", label: "Material Estimator", icon: "🧮" },
  { id: "boq",      label: "BOQ Generator",      icon: "📊" },
  { id: "cost",     label: "Cost Estimator",      icon: "💰" },
];

// ── Material Estimator ──
function MaterialEstimator({ rates }: { rates: any[] }) {
  const [inputs, setInputs] = useState({
    length: "", width: "", height: "", type: "slab",
  });
  const [results, setResults] = useState<any[]>([]);

  function calculate() {
    const L = parseFloat(inputs.length) || 0;
    const W = parseFloat(inputs.width)  || 0;
    const H = parseFloat(inputs.height) || 0;
    if (!L || !W) return;

    const volume = L * W * (H || 0.125); // default 5" slab
    const area   = L * W;

    const getRate = (name: string) =>
      rates.find((r) => r.materialName?.toLowerCase().includes(name.toLowerCase()))?.ratePerUnit || 0;

    const res = [
      { material: "Cement (OPC 52.5)",  qty: Math.ceil(volume * 8.5),    unit: "bag",  rate: getRate("cement") || 520  },
      { material: "Fine Sand",           qty: Math.ceil(volume * 0.44),   unit: "cft",  rate: getRate("fine sand") || 45 },
      { material: "Stone Chips (20mm)", qty: Math.ceil(volume * 0.88),   unit: "cft",  rate: getRate("stone chips") || 75 },
      { material: "Steel Rod",           qty: Math.ceil(area * 4.5),      unit: "kg",   rate: 95     },
      { material: "Brick",               qty: Math.ceil(area * 10),       unit: "pcs",  rate: getRate("brick") || 14 },
    ];

    setResults(res.map((r) => ({ ...r, total: r.qty * r.rate })));
  }

  const grandTotal = results.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="label">Length (ft)</label>
          <input type="number" value={inputs.length}
            onChange={(e) => setInputs((i) => ({ ...i, length: e.target.value }))}
            placeholder="0" className="input" />
        </div>
        <div>
          <label className="label">Width (ft)</label>
          <input type="number" value={inputs.width}
            onChange={(e) => setInputs((i) => ({ ...i, width: e.target.value }))}
            placeholder="0" className="input" />
        </div>
        <div>
          <label className="label">Height/Thickness (ft)</label>
          <input type="number" value={inputs.height}
            onChange={(e) => setInputs((i) => ({ ...i, height: e.target.value }))}
            placeholder="0.42 (5 inch)" className="input" />
        </div>
        <div>
          <label className="label">Type</label>
          <select value={inputs.type}
            onChange={(e) => setInputs((i) => ({ ...i, type: e.target.value }))}
            className="input">
            <option value="slab">RCC Slab</option>
            <option value="beam">Beam</option>
            <option value="column">Column</option>
            <option value="wall">Brick Wall</option>
          </select>
        </div>
      </div>

      <button onClick={calculate} className="btn-primary">
        <Calculator size={17} /> Calculate
      </button>

      {results.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-dark-50">
              <tr>
                {["Material", "Quantity", "Unit", "Rate (৳)", "Total (৳)"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-dark-700 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-dark-50">
                  <td className="py-3 px-4 font-medium text-dark-700">{r.material}</td>
                  <td className="py-3 px-4 text-dark-600">{r.qty.toLocaleString()}</td>
                  <td className="py-3 px-4 text-dark-500">{r.unit}</td>
                  <td className="py-3 px-4 text-dark-600">{r.rate.toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-primary-700">
                    {formatPrice(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-primary-50">
              <tr>
                <td colSpan={4} className="py-3 px-4 font-bold text-dark-800">
                  Estimated Total
                </td>
                <td className="py-3 px-4 font-bold text-primary-700 text-base">
                  {formatPrice(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ── BOQ Generator ──
function BOQGenerator({ rates }: { rates: any[] }) {
  const [inputs, setInputs] = useState({
    floors: "1", floorArea: "", projectType: "residential",
  });
  const [results, setResults] = useState<any[]>([]);

  function generate() {
    const floors = parseInt(inputs.floors)    || 1;
    const area   = parseFloat(inputs.floorArea) || 0;
    if (!area) return;

    const totalArea = floors * area;
    const getRate   = (name: string) =>
      rates.find((r) => r.materialName?.toLowerCase().includes(name.toLowerCase()))?.ratePerUnit || 0;

    const boq = [
      { item: "Cement (OPC 52.5)",  qty: Math.ceil(totalArea * 0.55), unit: "bag",    rate: getRate("cement") || 520  },
      { item: "Steel Rod (Grade 60)",qty: Math.ceil(totalArea * 5.5),  unit: "kg",    rate: 95                        },
      { item: "Brick (1st Class)",  qty: Math.ceil(totalArea * 450),  unit: "pcs",    rate: getRate("brick") || 14    },
      { item: "Fine Sand",          qty: Math.ceil(totalArea * 1.8),  unit: "cft",    rate: getRate("fine sand") || 45 },
      { item: "Stone Chips (20mm)", qty: Math.ceil(totalArea * 2.2),  unit: "cft",    rate: getRate("stone") || 75    },
      { item: "RAK Ceramic Tile",   qty: Math.ceil(totalArea * 1.1),  unit: "sqft",   rate: 85                        },
      { item: "Berger Paint",       qty: Math.ceil(totalArea * 0.08), unit: "liter",  rate: 350                       },
      { item: "BRB Cable (wire)",   qty: Math.ceil(totalArea * 2.5),  unit: "rft",    rate: 45                        },
      { item: "Sanitary Fittings",  qty: Math.ceil(floors * 2),       unit: "set",    rate: 35000                     },
      { item: "Doors & Windows",    qty: Math.ceil(totalArea * 0.08), unit: "nos",    rate: 18000                     },
    ];

    setResults(boq.map((r) => ({ ...r, total: r.qty * r.rate })));
  }

  const grandTotal = results.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Number of Floors</label>
          <input type="number" value={inputs.floors} min="1" max="20"
            onChange={(e) => setInputs((i) => ({ ...i, floors: e.target.value }))}
            className="input" />
        </div>
        <div>
          <label className="label">Floor Area (sqft)</label>
          <input type="number" value={inputs.floorArea}
            onChange={(e) => setInputs((i) => ({ ...i, floorArea: e.target.value }))}
            placeholder="e.g. 1200" className="input" />
        </div>
        <div>
          <label className="label">Project Type</label>
          <select value={inputs.projectType}
            onChange={(e) => setInputs((i) => ({ ...i, projectType: e.target.value }))}
            className="input">
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      <button onClick={generate} className="btn-primary">
        <Calculator size={17} /> Generate BOQ
      </button>

      {results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 bg-dark-50 border-b border-dark-100 flex justify-between items-center">
            <p className="font-semibold text-dark-800 text-sm">
              BOQ — {inputs.floors} Floor · {inputs.floorArea} sqft/floor
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-dark-50">
              <tr>
                {["Item", "Qty", "Unit", "Rate (৳)", "Amount (৳)"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-dark-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-dark-50">
                  <td className="py-3 px-4 font-medium text-dark-700">{r.item}</td>
                  <td className="py-3 px-4">{r.qty.toLocaleString()}</td>
                  <td className="py-3 px-4 text-dark-500">{r.unit}</td>
                  <td className="py-3 px-4">{r.rate.toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-primary-700">
                    {formatPrice(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-primary-50">
              <tr>
                <td colSpan={4} className="py-3 px-4 font-bold text-dark-800">Grand Total</td>
                <td className="py-3 px-4 font-bold text-primary-700 text-lg">
                  {formatPrice(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Cost Estimator ──
function CostEstimator() {
  const [inputs, setInputs] = useState({
    area: "", floors: "1", type: "residential", quality: "standard",
  });
  const [result, setResult] = useState<any>(null);

  const RATES: Record<string, Record<string, number>> = {
    residential: { economy: 2200, standard: 2800, premium: 4000 },
    commercial:  { economy: 2800, standard: 3500, premium: 5500 },
  };

  function estimate() {
    const area   = parseFloat(inputs.area)   || 0;
    const floors = parseInt(inputs.floors)   || 1;
    if (!area) return;
    const ratePerSqft = RATES[inputs.type]?.[inputs.quality] || 2800;
    const totalArea   = area * floors;
    const totalCost   = totalArea * ratePerSqft;

    setResult({
      totalArea,
      ratePerSqft,
      totalCost,
      breakdown: {
        "Civil Work (60%)":      totalCost * 0.60,
        "Electrical (10%)":      totalCost * 0.10,
        "Plumbing (8%)":         totalCost * 0.08,
        "Finishing (15%)":       totalCost * 0.15,
        "Miscellaneous (7%)":    totalCost * 0.07,
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="label">Floor Area (sqft)</label>
          <input type="number" value={inputs.area}
            onChange={(e) => setInputs((i) => ({ ...i, area: e.target.value }))}
            placeholder="e.g. 1200" className="input" />
        </div>
        <div>
          <label className="label">Floors</label>
          <input type="number" value={inputs.floors} min="1"
            onChange={(e) => setInputs((i) => ({ ...i, floors: e.target.value }))}
            className="input" />
        </div>
        <div>
          <label className="label">Building Type</label>
          <select value={inputs.type}
            onChange={(e) => setInputs((i) => ({ ...i, type: e.target.value }))}
            className="input">
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className="label">Quality Grade</label>
          <select value={inputs.quality}
            onChange={(e) => setInputs((i) => ({ ...i, quality: e.target.value }))}
            className="input">
            <option value="economy">Economy</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      <button onClick={estimate} className="btn-primary">
        <Calculator size={17} /> Estimate Cost
      </button>

      {result && (
        <div className="space-y-4">
          <div className="card p-5 bg-primary-50 border-primary-200">
            <p className="text-sm text-dark-500 mb-1">Estimated Total Cost</p>
            <p className="font-display text-4xl font-bold text-primary-700">
              {formatPrice(result.totalCost)}
            </p>
            <p className="text-xs text-dark-400 mt-1">
              {result.totalArea.toLocaleString()} sqft × ৳{result.ratePerSqft}/sqft
            </p>
          </div>
          <div className="card overflow-hidden">
            <p className="px-5 py-3 font-semibold text-dark-800 text-sm border-b border-dark-100">
              Cost Breakdown
            </p>
            <div className="divide-y divide-dark-100">
              {Object.entries(result.breakdown).map(([label, amt]: any) => (
                <div key={label} className="flex justify-between items-center px-5 py-3">
                  <span className="text-sm text-dark-600">{label}</span>
                  <span className="font-semibold text-dark-800 text-sm">
                    {formatPrice(amt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-dark-400 text-center">
            This is an approximate estimate. Actual cost may vary based on location, materials, and design.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function CalculatorPage() {
  const [activeTool, setActiveTool] = useState("material");
  const [rates,      setRates]      = useState<any[]>([]);

  useEffect(() => {
    getMaterialRates().then(setRates).catch(() => {});
  }, []);

  return (
    <div className="bg-gradient-to-b from-primary-900 to-dark-900 min-h-screen">
      {/* Header */}
      <div className="container-main pt-14 pb-10 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full
                         px-4 py-1.5 mb-5">
          <Calculator size={16} className="text-primary-200" />
          <span className="text-sm font-medium text-primary-100">Free Tools</span>
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">
          Engineering Calculators
        </h1>
        <p className="text-primary-200 text-sm max-w-md mx-auto">
          Plan your construction project accurately with our professional calculation tools
        </p>
      </div>

      {/* Tool tabs */}
      <div className="container-main pb-3">
        <div className="flex gap-2 justify-center flex-wrap">
          {TOOLS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150",
                activeTool === id
                  ? "bg-white text-primary-800 shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool content */}
      <div className="container-main pb-14 pt-6 max-w-5xl">
        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-dark-900 mb-6">
            {TOOLS.find((t) => t.id === activeTool)?.label}
          </h2>
          {activeTool === "material" && <MaterialEstimator rates={rates} />}
          {activeTool === "boq"      && <BOQGenerator      rates={rates} />}
          {activeTool === "cost"     && <CostEstimator />}
        </div>
      </div>
    </div>
  );
}
