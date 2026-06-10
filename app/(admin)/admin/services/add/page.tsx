"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Save, Loader2,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateSlug, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const SERVICE_CATEGORIES = ["design", "construction", "consultancy", "survey"];

export default function AddServicePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name:             "",
    slug:             "",
    serviceCategory:  "design",
    shortDescription: "",
    description:      "",
    startingPrice:    "",
    isFeatured:       false,
    isActive:         true,
  });

  const [packages,  setPackages]  = useState([
    { name: "Basic", price: "", deliverables: [""], duration: "7 days", isPopular: false },
  ]);
  const [steps, setSteps] = useState([
    { step: 1, title: "", description: "" },
  ]);
  const [faqs, setFaqs] = useState([
    { question: "", answer: "" },
  ]);
  const [saving, setSaving] = useState(false);

  function updateForm(k: string, v: any) {
    setForm((f) => ({
      ...f, [k]: v,
      ...(k === "name" ? { slug: generateSlug(v) } : {}),
    }));
  }

  // Package helpers
  function addPackage() {
    setPackages((p) => [...p, { name: "", price: "", deliverables: [""], duration: "", isPopular: false }]);
  }
  function removePackage(i: number) { setPackages((p) => p.filter((_, j) => j !== i)); }
  function updatePackage(i: number, k: string, v: any) {
    setPackages((pp) => pp.map((x, j) => j === i ? { ...x, [k]: v } : x));
  }
  function addDeliverable(pkgIdx: number) {
    setPackages((pp) => pp.map((x, j) =>
      j === pkgIdx ? { ...x, deliverables: [...x.deliverables, ""] } : x
    ));
  }
  function updateDeliverable(pkgIdx: number, dIdx: number, v: string) {
    setPackages((pp) => pp.map((x, j) =>
      j === pkgIdx
        ? { ...x, deliverables: x.deliverables.map((d: string, k: number) => k === dIdx ? v : d) }
        : x
    ));
  }
  function removeDeliverable(pkgIdx: number, dIdx: number) {
    setPackages((pp) => pp.map((x, j) =>
      j === pkgIdx
        ? { ...x, deliverables: x.deliverables.filter((_: string, k: number) => k !== dIdx) }
        : x
    ));
  }

  // Steps helpers
  function addStep() { setSteps((s) => [...s, { step: s.length + 1, title: "", description: "" }]); }
  function removeStep(i: number) { setSteps((s) => s.filter((_, j) => j !== i)); }
  function updateStep(i: number, k: string, v: string) {
    setSteps((ss) => ss.map((x, j) => j === i ? { ...x, [k]: v } : x));
  }

  // FAQ helpers
  function addFaq() { setFaqs((f) => [...f, { question: "", answer: "" }]); }
  function removeFaq(i: number) { setFaqs((f) => f.filter((_, j) => j !== i)); }
  function updateFaq(i: number, k: string, v: string) {
    setFaqs((ff) => ff.map((x, j) => j === i ? { ...x, [k]: v } : x));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startingPrice) {
      toast.error("Name and starting price are required"); return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "services"), {
        name:             form.name,
        slug:             form.slug || generateSlug(form.name),
        serviceCategory:  form.serviceCategory,
        shortDescription: form.shortDescription,
        description:      form.description,
        startingPrice:    Number(form.startingPrice),
        images:           [],
        packages: packages
          .filter((p) => p.name && p.price)
          .map((p) => ({
            name:         p.name,
            price:        Number(p.price),
            deliverables: p.deliverables.filter(Boolean),
            duration:     p.duration,
            isPopular:    p.isPopular,
          })),
        processSteps: steps
          .filter((s) => s.title)
          .map((s, i) => ({ step: i + 1, title: s.title, description: s.description })),
        faqs: faqs.filter((f) => f.question && f.answer),
        isFeatured:  form.isFeatured,
        isActive:    form.isActive,
        avgRating:   0,
        reviewCount: 0,
        createdAt:   serverTimestamp(),
        updatedAt:   serverTimestamp(),
      });
      toast.success("Service added!");
      router.push("/admin/services");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add service");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/services" className="btn-icon btn-ghost">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-dark-900">Add Service</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-dark-800">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Service Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                className="input" placeholder="e.g. Architectural Design" required />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.serviceCategory}
                onChange={(e) => updateForm("serviceCategory", e.target.value)}
                className="input">
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Starting Price (৳) <span className="text-red-500">*</span></label>
              <input type="number" value={form.startingPrice}
                onChange={(e) => updateForm("startingPrice", e.target.value)}
                className="input" placeholder="15000" min="0" required />
            </div>
            <div>
              <label className="label">Slug</label>
              <input type="text" value={form.slug}
                onChange={(e) => updateForm("slug", e.target.value)}
                className="input" placeholder="auto-generated" />
            </div>
          </div>
          <div>
            <label className="label">Short Description</label>
            <input type="text" value={form.shortDescription}
              onChange={(e) => updateForm("shortDescription", e.target.value)}
              className="input" placeholder="One-line description" />
          </div>
          <div>
            <label className="label">Full Description</label>
            <textarea value={form.description} rows={4}
              onChange={(e) => updateForm("description", e.target.value)}
              className="input resize-none" placeholder="Detailed service description..." />
          </div>
        </div>

        {/* Packages */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-800">Pricing Packages</h2>
            <button type="button" onClick={addPackage} className="btn-secondary btn-sm">
              <Plus size={14} /> Add Package
            </button>
          </div>
          {packages.map((pkg, i) => (
            <div key={i} className="p-4 bg-dark-50 rounded-xl border border-dark-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-dark-700">Package {i + 1}</p>
                {packages.length > 1 && (
                  <button type="button" onClick={() => removePackage(i)}
                    className="text-red-400 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Name</label>
                  <input type="text" value={pkg.name}
                    onChange={(e) => updatePackage(i, "name", e.target.value)}
                    className="input bg-white" placeholder="Basic" />
                </div>
                <div>
                  <label className="label">Price (৳)</label>
                  <input type="number" value={pkg.price}
                    onChange={(e) => updatePackage(i, "price", e.target.value)}
                    className="input bg-white" placeholder="15000" />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input type="text" value={pkg.duration}
                    onChange={(e) => updatePackage(i, "duration", e.target.value)}
                    className="input bg-white" placeholder="7 days" />
                </div>
              </div>
              {/* Deliverables */}
              <div>
                <label className="label">Deliverables</label>
                {pkg.deliverables.map((d: string, di: number) => (
                  <div key={di} className="flex gap-2 mb-2">
                    <input type="text" value={d}
                      onChange={(e) => updateDeliverable(i, di, e.target.value)}
                      className="input bg-white flex-1 text-sm py-2"
                      placeholder="e.g. Floor Plan" />
                    {pkg.deliverables.length > 1 && (
                      <button type="button" onClick={() => removeDeliverable(i, di)}
                        className="text-red-400 hover:text-red-600 px-2">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addDeliverable(i)}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus size={12} /> Add deliverable
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={pkg.isPopular}
                  onChange={(e) => updatePackage(i, "isPopular", e.target.checked)}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-dark-700">Mark as Popular</span>
              </label>
            </div>
          ))}
        </div>

        {/* Process Steps */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-800">Process Steps</h2>
            <button type="button" onClick={addStep} className="btn-secondary btn-sm">
              <Plus size={14} /> Add Step
            </button>
          </div>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center
                               justify-center text-primary-700 font-bold text-sm flex-shrink-0 mt-6">
                {i + 1}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Title</label>
                  <input type="text" value={step.title}
                    onChange={(e) => updateStep(i, "title", e.target.value)}
                    className="input" placeholder="e.g. Initial Consultation" />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input type="text" value={step.description}
                    onChange={(e) => updateStep(i, "description", e.target.value)}
                    className="input" placeholder="Brief description..." />
                </div>
              </div>
              {steps.length > 1 && (
                <button type="button" onClick={() => removeStep(i)}
                  className="text-red-400 hover:text-red-600 mt-6 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-800">FAQs</h2>
            <button type="button" onClick={addFaq} className="btn-secondary btn-sm">
              <Plus size={14} /> Add FAQ
            </button>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-dark-500">FAQ {i + 1}</p>
                {faqs.length > 1 && (
                  <button type="button" onClick={() => removeFaq(i)}
                    className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input type="text" value={faq.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
                className="input" placeholder="Question?" />
              <textarea value={faq.answer} rows={2}
                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                className="input resize-none" placeholder="Answer..." />
            </div>
          ))}
        </div>

        {/* Visibility */}
        <div className="card p-6">
          <h2 className="font-semibold text-dark-800 mb-4">Visibility</h2>
          <div className="flex gap-4">
            {[
              { key: "isActive",   label: "Active"   },
              { key: "isFeatured", label: "Featured" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer
                                           p-3 rounded-xl border border-dark-100
                                           hover:border-primary-300 transition-all">
                <input type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => updateForm(key, e.target.checked)}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-dark-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link href="/admin/services" className="btn-secondary flex-1 justify-center">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="btn-primary flex-1 justify-center btn-lg">
            {saving
              ? <><Loader2 size={18} className="animate-spin" /> Saving...</>
              : <><Save size={18} /> Add Service</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
