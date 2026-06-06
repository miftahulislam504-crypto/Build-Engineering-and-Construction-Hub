"use client";

import { useEffect, useState } from "react";
import {
  Wrench, Search, ChevronDown, ChevronUp,
  Plus, X, Loader2,
} from "lucide-react";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, serverTimestamp, arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDateShort, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending","confirmed","in_progress","completed","cancelled"];
const STATUS_COLOR: Record<string, string> = {
  pending:     "badge-yellow",
  confirmed:   "badge-blue",
  in_progress: "badge-blue",
  completed:   "badge-green",
  cancelled:   "badge-red",
};
const STATUS_LABEL: Record<string, string> = {
  pending:     "Pending",
  confirmed:   "Confirmed",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [tab,      setTab]      = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [note,     setNote]     = useState("");
  const [newStatus,setNewStatus]= useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, "serviceRequests"), orderBy("createdAt", "desc")))
      .then((snap) => setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter((r) => {
    const matchTab    = tab === "all" || r.status === tab;
    const matchSearch = !search ||
      r.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  async function updateStatus() {
    if (!selected || !newStatus) return;
    setUpdating(true);
    try {
      const timeline = {
        status:    newStatus,
        note:      note || "",
        updatedAt: new Date(),
      };
      await updateDoc(doc(db, "serviceRequests", selected.id), {
        status:    newStatus,
        timeline:  arrayUnion(timeline),
        updatedAt: serverTimestamp(),
      });
      setRequests((prev) => prev.map((r) =>
        r.id === selected.id
          ? { ...r, status: newStatus, timeline: [...(r.timeline || []), timeline] }
          : r
      ));
      toast.success("Status updated!");
      setSelected(null);
      setNote("");
      setNewStatus("");
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-dark-900">Service Requests</h1>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service or location..."
            className="input pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setTab(s)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                tab === s
                  ? "bg-primary-600 text-white"
                  : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              )}>
              {STATUS_LABEL[s] || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
              <div className="skeleton h-3 w-36 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <Wrench size={40} className="text-dark-200 mx-auto mb-3" />
          <p className="text-dark-400 text-sm">No service requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className="card overflow-hidden">
              {/* Main row */}
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <p className="font-semibold text-dark-800 text-sm">{req.serviceName}</p>
                    <span className={cn("badge text-xs", STATUS_COLOR[req.status] || "badge-gray")}>
                      {STATUS_LABEL[req.status] || req.status}
                    </span>
                    {req.packageName && (
                      <span className="badge-gray badge text-2xs">{req.packageName}</span>
                    )}
                  </div>
                  <p className="text-xs text-dark-500 mb-1">{req.location}</p>
                  <p className="text-xs text-dark-400 line-clamp-1">{req.projectDetails}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-dark-400 flex-wrap">
                    <span>
                      {req.createdAt?.toDate
                        ? formatDateShort(req.createdAt.toDate())
                        : "—"}
                    </span>
                    {req.preferredDate && (
                      <>
                        <span className="text-dark-300">·</span>
                        <span>Preferred: {formatDateShort(req.preferredDate.toDate?.() || req.preferredDate)}</span>
                      </>
                    )}
                    {req.totalAmount && (
                      <>
                        <span className="text-dark-300">·</span>
                        <span className="font-medium text-primary-700">
                          ৳{req.totalAmount.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setSelected(req); setNewStatus(req.status); }}
                    className="px-3 py-1.5 bg-primary-100 text-primary-700
                               hover:bg-primary-200 rounded-lg text-xs font-medium
                               transition-all"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                    className="btn-icon btn-ghost text-dark-400"
                  >
                    {expanded === req.id
                      ? <ChevronUp size={16} />
                      : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Timeline (expanded) */}
              {expanded === req.id && (
                <div className="border-t border-dark-100 px-5 py-4 bg-dark-50">
                  <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3">
                    Timeline
                  </p>
                  {req.timeline?.length > 0 ? (
                    <div className="space-y-3">
                      {req.timeline.map((t: any, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-dark-700 capitalize">
                              {STATUS_LABEL[t.status] || t.status}
                            </p>
                            {t.note && (
                              <p className="text-xs text-dark-500">{t.note}</p>
                            )}
                            <p className="text-xs text-dark-400">
                              {t.updatedAt?.toDate
                                ? formatDateShort(t.updatedAt.toDate())
                                : t.updatedAt
                                  ? formatDateShort(new Date(t.updatedAt.seconds * 1000))
                                  : "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-dark-400">No timeline entries yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-dark-900">Update Status</h2>
              <button onClick={() => setSelected(null)} className="btn-icon btn-ghost">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="card p-3 bg-dark-50">
                <p className="font-medium text-dark-800 text-sm">{selected.serviceName}</p>
                <p className="text-xs text-dark-500">{selected.location}</p>
              </div>
              <div>
                <label className="label">New Status</label>
                <select value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  Note
                  <span className="text-dark-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea value={note} rows={3}
                  onChange={(e) => setNote(e.target.value)}
                  className="input resize-none"
                  placeholder="Add a note for the customer..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelected(null)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={updateStatus} disabled={updating}
                  className="btn-primary flex-1 justify-center">
                  {updating
                    ? <><Loader2 size={16} className="animate-spin" /> Updating...</>
                    : "Update Status"
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
