"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Send, Loader2, FileText } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createQuotation } from "@/lib/firestore";
import { generateQuotationNumber, cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import toast from "react-hot-toast";

interface QuotationItem {
  productName: string;
  quantity:    string;
  unit:        string;
  note:        string;
}

const UNITS = ["bag", "ton", "pcs", "sqft", "rft", "cft", "bundle", "liter", "kg"];

export default function NewQuotationPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    projectName:     "",
    projectLocation: "",
    description:     "",
  });

  const [items, setItems] = useState<QuotationItem[]>([
    { productName: "", quantity: "", unit: "bag", note: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  function updateForm(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function addItem() {
    setItems((i) => [...i, { productName: "", quantity: "", unit: "bag", note: "" }]);
  }

  function removeItem(idx: number) {
    setItems((i) => i.filter((_, j) => j !== idx));
  }

  function updateItem(idx: number, k: keyof QuotationItem, v: string) {
    setItems((items) =>
      items.map((item, j) => j === idx ? { ...item, [k]: v } : item)
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.projectName.trim())     e.projectName     = "Project name is required";
    if (!form.projectLocation.trim()) e.projectLocation = "Location is required";
    const validItems = items.filter((i) => i.productName.trim() && i.quantity);
    if (validItems.length === 0)      e.items = "Add at least one item";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const validItems = items.filter((i) => i.productName.trim() && i.quantity);
      await createQuotation({
        quotationNumber:  generateQuotationNumber(),
        userId:           user!.id,
        userName:         user!.name,
        userPhone:        user!.phone || "",
        status:           "pending",
        projectName:      form.projectName,
        projectLocation:  form.projectLocation,
        description:      form.description,
        items:            validItems.map((i) => ({
          productName: i.productName,
          quantity:    Number(i.quantity),
          unit:        i.unit,
          note:        i.note,
        })),
      });
      toast.success("Quotation request submitted!");
      router.push("/dashboard/quotations");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="container-main py-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center">
            <FileText size={22} className="text-primary-700" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-900">
              Request Quotation
            </h1>
            <p className="text-dark-400 text-sm">
              Fill in your project details and required materials
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Project Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-dark-800 text-base">Project Information</h2>

            <div>
              <label className="label">Project Name</label>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => updateForm("projectName", e.target.value)}
                placeholder="e.g. 5-Storey Residential Building, Mirpur"
                className={cn("input", errors.projectName && "input-error")}
              />
              {errors.projectName && (
                <p className="text-xs text-red-500 mt-1">{errors.projectName}</p>
              )}
            </div>

            <div>
              <label className="label">Project Location</label>
              <input
                type="text"
                value={form.projectLocation}
                onChange={(e) => updateForm("projectLocation", e.target.value)}
                placeholder="e.g. Mirpur-10, Dhaka"
                className={cn("input", errors.projectLocation && "input-error")}
              />
              {errors.projectLocation && (
                <p className="text-xs text-red-500 mt-1">{errors.projectLocation}</p>
              )}
            </div>

            <div>
              <label className="label">
                Additional Notes
                <span className="text-dark-400 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Any special requirements or notes for the supplier..."
                rows={3}
                className="input resize-none"
              />
            </div>
          </div>

          {/* Materials List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-dark-800 text-base">
                Required Materials
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary btn-sm"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            {errors.items && (
              <p className="text-xs text-red-500 mb-3">{errors.items}</p>
            )}

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx}
                  className="p-4 bg-dark-50 rounded-xl border border-dark-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-dark-600">Item {idx + 1}</p>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Product name */}
                  <div>
                    <label className="label">Product / Material Name</label>
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => updateItem(idx, "productName", e.target.value)}
                      placeholder="e.g. Holcim Cement, BSRM Steel Rod 16mm"
                      className="input bg-white"
                    />
                  </div>

                  {/* Quantity + Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        placeholder="0"
                        min="1"
                        className="input bg-white"
                      />
                    </div>
                    <div>
                      <label className="label">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                        className="input bg-white"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="label">
                      Note
                      <span className="text-dark-400 font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={item.note}
                      onChange={(e) => updateItem(idx, "note", e.target.value)}
                      placeholder="e.g. Grade 60, OPC 52.5"
                      className="input bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="w-full mt-4 py-3 border-2 border-dashed border-dark-200
                         rounded-xl text-sm text-dark-400 hover:border-primary-300
                         hover:text-primary-600 transition-all flex items-center
                         justify-center gap-2"
            >
              <Plus size={16} /> Add Another Item
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Link href="/dashboard/quotations" className="btn-secondary flex-1 justify-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center btn-lg"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                <><Send size={17} /> Submit Request</>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
