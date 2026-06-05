"use client";

import { useEffect, useState } from "react";
import { FileText, Search, ChevronRight, Send, X } from "lucide-react";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDateShort, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_COLOR: Record<string, string> = {
  pending:  "badge-yellow",
  reviewed: "badge-blue",
  sent:     "badge-blue",
  approved: "badge-green",
  rejected: "badge-red",
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [tab,        setTab]        = useState("all");
  const [selected,   setSelected]   = useState<any>(null);
  const [response,   setResponse]   = useState({ message: "", quotedPrice: "", validDays: "7" });
  const [sending,    setSending]    = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, "quotations"), orderBy("createdAt", "desc")))
      .then((snap) => setQuotations(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = quotations.filter((q) => {
    const matchTab = tab === "all" || q.status === tab;
    const matchSearch = !search ||
      q.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      q.userName?.toLowerCase().includes(search.toLowerCase()) ||
      q.quotationNumber?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  async function sendQuotation() {
    if (!response.message || !response.quotedPrice) {
      toast.error("Fill message and quoted price"); return;
    }
    setSending(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + Number(response.validDays));

      await updateDoc(doc(db, "quotations", selected.id), {
        status: "sent",
        adminResponse: {
          message:     response.message,
          quotedPrice: Number(response.quotedPrice),
          validUntil,
        },
        updatedAt: serverTimestamp(),
      });

      setQuotations((prev) =>
        prev.map((q) => q.id === selected.id
          ? { ...q, status: "sent", adminResponse: { message: response.message, quotedPrice: Number(response.quotedPrice), validUntil } }
          : q
        )
      );
      toast.success("Quotation sent to customer");
      setSelected(null);
      setResponse({ message: "", quotedPrice: "", validDays: "7" });
    } catch {
      toast.error("Failed to send quotation");
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await updateDoc(doc(db, "quotations", id), { status, updatedAt: serverTimestamp() });
    setQuotations((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    toast.success(`Quotation ${status}`);
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-dark-900">Quotations</h1>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations..."
            className="input pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["all","pending","reviewed","sent","approved","rejected"].map((s) => (
            <button key={s} onClick={() => setTab(s)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                tab === s
                  ? "bg-primary-600 text-white"
                  : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              )}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {["Quotation #", "Customer", "Project", "Items", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-dark-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-dark-400 text-sm">
                    <FileText size={36} className="mx-auto mb-2 text-dark-200" />
                    No quotations found
                  </td>
                </tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-dark-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs text-dark-700">{q.quotationNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-medium text-dark-800">{q.userName}</p>
                      <p className="text-xs text-dark-400">{q.userPhone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-medium text-dark-700 truncate max-w-[140px]">
                        {q.projectName}
                      </p>
                      <p className="text-xs text-dark-400 truncate max-w-[140px]">
                        {q.projectLocation}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge-gray badge text-xs">
                        {q.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("badge text-xs capitalize", STATUS_COLOR[q.status] || "badge-gray")}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-dark-400">
                        {q.createdAt?.toDate ? formatDateShort(q.createdAt.toDate()) : "—"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {q.status === "pending" && (
                          <button
                            onClick={() => setSelected(q)}
                            className="px-2.5 py-1 bg-primary-100 text-primary-700
                                       hover:bg-primary-200 rounded-lg text-2xs font-medium
                                       flex items-center gap-1 transition-all"
                          >
                            <Send size={11} /> Respond
                          </button>
                        )}
                        {q.status === "sent" && (
                          <>
                            <button onClick={() => updateStatus(q.id, "approved")}
                              className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200
                                         rounded-lg text-2xs font-medium transition-all">
                              Approve
                            </button>
                            <button onClick={() => updateStatus(q.id, "rejected")}
                              className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200
                                         rounded-lg text-2xs font-medium transition-all">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg p-6
                           animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-dark-900">
                Send Quotation Response
              </h2>
              <button onClick={() => setSelected(null)} className="btn-icon btn-ghost">
                <X size={18} />
              </button>
            </div>

            {/* Quotation details */}
            <div className="card p-4 bg-dark-50 mb-5">
              <p className="font-semibold text-dark-800 text-sm mb-1">{selected.projectName}</p>
              <p className="text-xs text-dark-500 mb-2">{selected.projectLocation}</p>
              <div className="space-y-1">
                {selected.items?.map((item: any, i: number) => (
                  <p key={i} className="text-xs text-dark-600">
                    • {item.productName} — {item.quantity} {item.unit}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Your Message</label>
                <textarea value={response.message} rows={3}
                  onChange={(e) => setResponse((r) => ({ ...r, message: e.target.value }))}
                  className="input resize-none"
                  placeholder="Dear customer, we are pleased to provide the following quotation..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Quoted Price (৳)</label>
                  <input type="number" value={response.quotedPrice}
                    onChange={(e) => setResponse((r) => ({ ...r, quotedPrice: e.target.value }))}
                    className="input" placeholder="0" />
                </div>
                <div>
                  <label className="label">Valid for (days)</label>
                  <select value={response.validDays}
                    onChange={(e) => setResponse((r) => ({ ...r, validDays: e.target.value }))}
                    className="input">
                    {["3","5","7","14","30"].map((d) => (
                      <option key={d} value={d}>{d} days</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelected(null)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={sendQuotation} disabled={sending}
                  className="btn-primary flex-1 justify-center">
                  {sending ? "Sending..." : <><Send size={16} /> Send Quotation</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
