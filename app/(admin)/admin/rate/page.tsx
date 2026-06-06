"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Loader2, Save } from "lucide-react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = ["Cement", "Steel", "Bricks", "Sand", "Stone Chips", "Paint", "Other"];

export default function AdminRatesPage() {
  const [rates,    setRates]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [saving,   setSaving]   = useState(false);

  const [form, setForm] = useState({
    materialName: "", unit: "bag", ratePerUnit: "", category: "Cement",
  });

  useEffect(() => {
    getDocs(query(collection(db, "materialRates"), orderBy("category")))
      .then((snap) => setRates(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!form.materialName || !form.ratePerUnit) {
      toast.error("Fill all fields"); return;
    }
    setSaving(true);
    try {
      const data = {
        materialName: form.materialName,
        unit:         form.unit,
        ratePerUnit:  Number(form.ratePerUnit),
        category:     form.category,
      };
      if (editing) {
        await updateDoc(doc(db, "materialRates", editing.id),
          { ...data, updatedAt: serverTimestamp() });
        setRates((r) => r.map((x) => x.id === editing.id ? { ...x, ...data } : x));
        toast.success("Rate updated!");
      } else {
        const ref = await addDoc(collection(db, "materialRates"),
          { ...data, createdAt: serverTimestamp() });
        setRates((r) => [...r, { id: ref.id, ...data }]);
        toast.success("Rate added!");
      }
      resetForm();
    } catch {
      toast.error("Failed to save rate");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRate(id: string) {
    if (!confirm("Delete this rate?")) return;
    await deleteDoc(doc(db, "materialRates", id));
    setRates((r) => r.filter((x) => x.id !== id));
    toast.success("Rate deleted");
  }

  function startEdit(rate: any) {
    setEditing(rate);
    setForm({
      materialName: rate.materialName, unit: rate.unit,
      ratePerUnit:  String(rate.ratePerUnit), category: rate.category,
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ materialName: "", unit: "bag", ratePerUnit: "", category: "Cement" });
    setEditing(null);
    setShowForm(false);
  }

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = rates.filter((r) => r.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Material Rates</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            Used by Engineering Calculator
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={17} /> Add Rate
        </button>
      </div>

      {/* Rates by category */}
      {CATEGORIES.map((cat) => {
        const catRates = grouped[cat] || [];
        if (!loading && catRates.length === 0) return null;
        return (
          <div key={cat} className="card overflow-hidden">
            <div className="px-5 py-3 bg-dark-50 border-b border-dark-100 flex items-center justify-between">
              <p className="font-semibold text-dark-700 text-sm">
                {cat}
                <span className="ml-2 badge-gray badge text-2xs">{catRates.length}</span>
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-dark-100">
                <tr>
                  {["Material", "Unit", "Rate (৳)", "Actions"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-dark-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i}>
                      {[1,2,3,4].map((j) => (
                        <td key={j} className="py-3 px-4">
                          <div className="skeleton h-4 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  catRates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-dark-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-dark-800">
                        {rate.materialName}
                      </td>
                      <td className="py-3 px-4 text-dark-500">
                        per {rate.unit}
                      </td>
                      <td className="py-3 px-4 font-bold text-primary-700">
                        {formatPrice(rate.ratePerUnit)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(rate)}
                            className="btn-icon btn-ghost text-primary-600 hover:bg-primary-50">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteRate(rate.id)}
                            className="btn-icon btn-ghost text-red-400 hover:bg-red-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-dark-900">
                {editing ? "Edit Rate" : "Add Rate"}
              </h2>
              <button onClick={resetForm} className="btn-icon btn-ghost"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Material Name</label>
                <input type="text" value={form.materialName}
                  onChange={(e) => setForm((f) => ({ ...f, materialName: e.target.value }))}
                  className="input" placeholder="e.g. Holcim Cement (50kg bag)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Unit</label>
                  <select value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="input">
                    {["bag","ton","pcs","cft","sqft","kg","liter","rft"].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Rate per unit (৳)</label>
                  <input type="number" value={form.ratePerUnit}
                    onChange={(e) => setForm((f) => ({ ...f, ratePerUnit: e.target.value }))}
                    className="input" placeholder="0" min="0" />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="input">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex-1 justify-center">
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : <><Save size={16} /> {editing ? "Update" : "Add Rate"}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
