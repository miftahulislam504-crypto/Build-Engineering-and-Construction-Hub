"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, FileText, MapPin, Clock,
  CheckCircle2, XCircle, Send, Loader2,
} from "lucide-react";
import { getDocument, updateDocument } from "@/lib/firestore";
import { formatPrice, formatDate, formatDateShort, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_COLOR: Record<string, string> = {
  pending:  "badge-yellow",
  reviewed: "badge-blue",
  sent:     "badge-blue",
  approved: "badge-green",
  rejected: "badge-red",
};

export default function QuotationDetailsPage() {
  const { id }       = useParams<{ id: string }>();
  const router       = useRouter();
  const [quotation,  setQuotation]  = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDocument("quotations", id as string)
      .then(setQuotation)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    setResponding(true);
    try {
      await updateDocument("quotations", id as string, { status: "approved" });
      setQuotation((q: any) => ({ ...q, status: "approved" }));
      toast.success("Quotation approved!");
    } catch {
      toast.error("Failed to approve");
    } finally {
      setResponding(false);
    }
  }

  async function handleReject() {
    setResponding(true);
    try {
      await updateDocument("quotations", id as string, { status: "rejected" });
      setQuotation((q: any) => ({ ...q, status: "rejected" }));
      toast.success("Quotation rejected");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setResponding(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="card p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-16">
        <FileText size={48} className="text-dark-200 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">Quotation not found.</p>
        <Link href="/dashboard/quotations" className="btn-primary inline-flex">
          Back to Quotations
        </Link>
      </div>
    );
  }

  const hasResponse = !!quotation.adminResponse;
  const canRespond  = quotation.status === "sent";

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quotations" className="btn-icon btn-ghost">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-dark-900">
            Quotation Details
          </h1>
          <p className="text-dark-400 text-sm font-mono">{quotation.quotationNumber}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        "card p-4 flex items-center gap-3",
        quotation.status === "approved" && "border-green-300 bg-green-50",
        quotation.status === "rejected" && "border-red-300 bg-red-50",
        quotation.status === "sent"     && "border-blue-300 bg-blue-50",
        quotation.status === "pending"  && "border-yellow-300 bg-yellow-50",
      )}>
        {quotation.status === "approved" && <CheckCircle2 size={20} className="text-green-600" />}
        {quotation.status === "rejected" && <XCircle     size={20} className="text-red-500"   />}
        {quotation.status === "sent"     && <Send        size={20} className="text-blue-600"   />}
        {quotation.status === "pending"  && <Clock       size={20} className="text-yellow-600" />}
        <div>
          <p className={cn(
            "font-semibold text-sm capitalize",
            quotation.status === "approved" && "text-green-800",
            quotation.status === "rejected" && "text-red-800",
            quotation.status === "sent"     && "text-blue-800",
            quotation.status === "pending"  && "text-yellow-800",
          )}>
            {quotation.status === "sent"     ? "Quotation Received — Please Review"  :
             quotation.status === "approved" ? "You Approved This Quotation"         :
             quotation.status === "rejected" ? "You Rejected This Quotation"         :
             "Awaiting Admin Response"}
          </p>
          <p className={cn(
            "text-xs",
            quotation.status === "approved" && "text-green-600",
            quotation.status === "rejected" && "text-red-600",
            quotation.status === "sent"     && "text-blue-600",
            quotation.status === "pending"  && "text-yellow-600",
          )}>
            {quotation.status === "pending"
              ? "Our team will review and send you a quote shortly."
              : quotation.status === "sent"
                ? "Review the quotation below and approve or reject."
                : ""}
          </p>
        </div>
      </div>

      {/* Project Info */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-dark-800 text-sm">Project Information</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-dark-400 text-xs mb-0.5">Project Name</p>
            <p className="font-medium text-dark-800">{quotation.projectName}</p>
          </div>
          <div>
            <p className="text-dark-400 text-xs mb-0.5">Location</p>
            <p className="font-medium text-dark-800">{quotation.projectLocation}</p>
          </div>
        </div>
        {quotation.description && (
          <div>
            <p className="text-dark-400 text-xs mb-0.5">Notes</p>
            <p className="text-sm text-dark-600">{quotation.description}</p>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-dark-400 pt-1">
          <Clock size={12} />
          Submitted on {quotation.createdAt?.toDate
            ? formatDate(quotation.createdAt.toDate())
            : "—"}
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-100">
          <p className="font-semibold text-dark-800 text-sm">
            Requested Items ({quotation.items?.length || 0})
          </p>
        </div>
        <div className="divide-y divide-dark-100">
          {quotation.items?.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-dark-800">{item.productName}</p>
                {item.note && (
                  <p className="text-xs text-dark-400">{item.note}</p>
                )}
              </div>
              <span className="badge-gray badge text-xs">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Response */}
      {hasResponse && (
        <div className="card p-5 border-blue-200 bg-blue-50 space-y-4">
          <h2 className="font-semibold text-blue-800 text-sm flex items-center gap-2">
            <Send size={15} />
            Quotation from BuildMart BD
          </h2>

          <p className="text-sm text-blue-700 leading-relaxed">
            {quotation.adminResponse.message}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3 bg-white">
              <p className="text-xs text-dark-400 mb-0.5">Quoted Price</p>
              <p className="font-bold text-primary-700 text-xl">
                {formatPrice(quotation.adminResponse.quotedPrice)}
              </p>
            </div>
            <div className="card p-3 bg-white">
              <p className="text-xs text-dark-400 mb-0.5">Valid Until</p>
              <p className="font-semibold text-dark-800 text-sm">
                {quotation.adminResponse.validUntil?.toDate
                  ? formatDateShort(quotation.adminResponse.validUntil.toDate())
                  : quotation.adminResponse.validUntil
                    ? formatDateShort(new Date(
                        quotation.adminResponse.validUntil.seconds * 1000
                      ))
                    : "—"}
              </p>
            </div>
          </div>

          {/* Approve / Reject buttons */}
          {canRespond && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReject}
                disabled={responding}
                className="flex-1 py-2.5 rounded-xl border-2 border-red-300
                           text-red-600 hover:bg-red-50 font-medium text-sm
                           transition-all disabled:opacity-50 flex items-center
                           justify-center gap-2"
              >
                {responding ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={responding}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700
                           text-white font-medium text-sm transition-all
                           disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {responding ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Approve Quotation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
