"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2, Trash2, Eye } from "lucide-react";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, deleteDoc, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDateShort, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [reviews,  setReviews]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("pending");

  useEffect(() => {
    getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")))
      .then((snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all"
    ? reviews
    : tab === "pending"
      ? reviews.filter((r) => !r.isApproved)
      : reviews.filter((r) => r.isApproved);

  async function approveReview(id: string) {
    await updateDoc(doc(db, "reviews", id), {
      isApproved: true, updatedAt: serverTimestamp(),
    });
    setReviews((r) => r.map((x) => x.id === id ? { ...x, isApproved: true } : x));
    toast.success("Review approved");
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    await deleteDoc(doc(db, "reviews", id));
    setReviews((r) => r.filter((x) => x.id !== id));
    toast.success("Review deleted");
  }

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-orange-600 mt-0.5">
              {pendingCount} review{pendingCount !== 1 ? "s" : ""} pending approval
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "pending",  label: `Pending (${pendingCount})`    },
          { id: "approved", label: "Approved"                     },
          { id: "all",      label: `All (${reviews.length})`      },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              tab === id
                ? "bg-primary-600 text-white"
                : "bg-dark-100 text-dark-600 hover:bg-dark-200"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <Star size={40} className="text-dark-200 mx-auto mb-3" />
          <p className="text-dark-400 text-sm">No {tab} reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* User & rating */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <p className="font-semibold text-dark-800 text-sm">
                      {review.userName}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={cn(
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-dark-200"
                        )} />
                      ))}
                    </div>
                    <span className={cn(
                      "badge text-2xs",
                      review.isApproved ? "badge-green" : "badge-yellow"
                    )}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  {/* Product/Service */}
                  <p className="text-xs text-dark-400 mb-2">
                    {review.productId
                      ? `Product review · ID: ${review.productId}`
                      : `Service review · ID: ${review.serviceId}`}
                  </p>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-dark-600 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-dark-400 mt-2">
                    {review.createdAt?.toDate
                      ? formatDateShort(review.createdAt.toDate())
                      : "—"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.isApproved && (
                    <button
                      onClick={() => approveReview(review.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100
                                 text-green-700 hover:bg-green-200 rounded-lg text-xs
                                 font-medium transition-all"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="btn-icon btn-ghost text-red-400 hover:bg-red-50
                               hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
