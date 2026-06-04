"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench, Clock, ChevronRight, Plus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserServiceRequests } from "@/lib/firestore";
import { formatDateShort, cn } from "@/lib/utils";

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

export default function ServiceRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getUserServiceRequests(user.id)
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark-900">
          Service Requests
        </h1>
        <Link href="/services" className="btn-primary btn-sm">
          <Plus size={15} /> Book Service
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
              <div className="skeleton h-3 w-36 rounded" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-14 text-center">
          <Wrench size={48} className="text-dark-200 mx-auto mb-4" />
          <p className="font-medium text-dark-500 mb-1">No service requests yet</p>
          <p className="text-sm text-dark-400 mb-6">
            Book a professional engineering service
          </p>
          <Link href="/services" className="btn-primary inline-flex gap-2">
            <Plus size={16} /> Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Service name & status */}
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-semibold text-dark-800 text-sm">
                      {req.serviceName}
                    </p>
                    <span className={cn(
                      "badge text-xs",
                      STATUS_COLOR[req.status] || "badge-gray"
                    )}>
                      {STATUS_LABEL[req.status] || req.status}
                    </span>
                  </div>

                  {/* Package */}
                  {req.packageName && (
                    <p className="text-xs text-dark-500 mb-1">
                      Package: {req.packageName}
                    </p>
                  )}

                  {/* Location */}
                  <p className="text-xs text-dark-500 line-clamp-1 mb-2">
                    {req.location}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-dark-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {req.createdAt?.toDate
                        ? formatDateShort(req.createdAt.toDate())
                        : "—"}
                    </span>
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
              </div>

              {/* Timeline */}
              {req.timeline?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-100">
                  <p className="text-xs font-semibold text-dark-500 uppercase
                                 tracking-wider mb-3">
                    Progress
                  </p>
                  <div className="space-y-2">
                    {req.timeline.slice(-3).map((t: any, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-dark-700 capitalize">
                            {t.status?.replace("_", " ")}
                          </p>
                          {t.note && (
                            <p className="text-xs text-dark-400">{t.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
