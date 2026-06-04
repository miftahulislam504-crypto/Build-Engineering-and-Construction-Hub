"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, ChevronRight, Clock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserQuotations } from "@/lib/firestore";
import { formatDateShort, cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  pending:  "badge-yellow",
  reviewed: "badge-blue",
  sent:     "badge-blue",
  approved: "badge-green",
  rejected: "badge-red",
};

export default function QuotationsPage() {
  const user = useAuthStore((s) => s.user);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getUserQuotations(user.id)
      .then(setQuotations)
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark-900">My Quotations</h1>
        <Link href="/quotation/new" className="btn-primary btn-sm">
          <Plus size={15} /> New Request
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="skeleton h-3 w-56 rounded" />
            </div>
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <div className="card p-14 text-center">
          <FileText size={48} className="text-dark-200 mx-auto mb-4" />
          <p className="font-medium text-dark-500 mb-1">No quotation requests yet</p>
          <p className="text-sm text-dark-400 mb-6">
            Request a bulk quotation for your construction project
          </p>
          <Link href="/quotation/new" className="btn-primary inline-flex gap-2">
            <Plus size={16} /> Request Quotation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => (
            <Link
              key={q.id}
              href={`/dashboard/quotations/${q.id}`}
              className="card p-5 block hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-semibold text-dark-800 text-sm">
                      {q.projectName}
                    </p>
                    <span className={cn("badge text-xs capitalize", STATUS_COLOR[q.status] || "badge-gray")}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mb-1">{q.quotationNumber}</p>
                  <p className="text-xs text-dark-500 line-clamp-1">{q.projectLocation}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-dark-400">
                    <Clock size={11} />
                    {q.createdAt?.toDate
                      ? formatDateShort(q.createdAt.toDate())
                      : "—"}
                    {q.items?.length > 0 && (
                      <>
                        <span className="text-dark-300">·</span>
                        {q.items.length} item{q.items.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-dark-300 flex-shrink-0 mt-1" />
              </div>

              {/* Admin response preview */}
              {q.adminResponse && (
                <div className="mt-3 pt-3 border-t border-dark-100">
                  <p className="text-xs text-green-600 font-medium">
                    Quoted: ৳{q.adminResponse.quotedPrice?.toLocaleString()}
                    {q.adminResponse.validUntil?.toDate && (
                      <span className="text-dark-400 font-normal ml-2">
                        Valid until {formatDateShort(q.adminResponse.validUntil.toDate())}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
