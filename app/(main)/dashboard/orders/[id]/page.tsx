"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, MapPin, CreditCard,
  Clock, CheckCircle2, Truck, XCircle,
} from "lucide-react";
import { getOrderById } from "@/lib/firestore";
import { formatPrice, formatDate, paymentLabel, cn } from "@/lib/utils";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_ICON: Record<string, any> = {
  pending:    Clock,
  processing: Package,
  shipped:    Truck,
  delivered:  CheckCircle2,
  cancelled:  XCircle,
};

export default function OrderDetailsPage() {
  const { id }    = useParams<{ id: string }>();
  const [order,   setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrderById(id as string)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="card p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="text-dark-200 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">Order not found.</p>
        <Link href="/dashboard/orders" className="btn-primary inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled  = order.status === "cancelled";
  const currentStep  = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="btn-icon btn-ghost">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-dark-900">
            Order Details
          </h1>
          <p className="text-dark-400 text-sm font-mono">{order.orderNumber}</p>
        </div>
      </div>

      {/* Status Tracker */}
      {!isCancelled ? (
        <div className="card p-6">
          <h2 className="font-semibold text-dark-800 mb-5 text-sm">Order Status</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-dark-100 z-0" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-primary-500 z-0 transition-all"
              style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
            />
            {STATUS_STEPS.map((step, i) => {
              const Icon    = STATUS_ICON[step];
              const isDone  = i <= currentStep;
              const isActive = i === currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-2 z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "border-2 transition-all",
                    isDone
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-dark-200 text-dark-300"
                  )}>
                    <Icon size={18} />
                  </div>
                  <p className={cn(
                    "text-xs font-medium capitalize hidden sm:block",
                    isActive ? "text-primary-700" :
                    isDone   ? "text-dark-600"    : "text-dark-300"
                  )}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-5 border-red-200 bg-red-50 flex items-center gap-3">
          <XCircle size={22} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Order Cancelled</p>
            <p className="text-xs text-red-600">This order has been cancelled.</p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-100">
          <p className="font-semibold text-dark-800 text-sm">
            Items ({order.items?.length || 0})
          </p>
        </div>
        <div className="divide-y divide-dark-100">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-50 flex-shrink-0">
                <img src={item.image || "/images/placeholder.png"}
                  alt={item.name}
                  className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-800 text-sm line-clamp-1">
                  {item.name}
                </p>
                {item.variantName && (
                  <p className="text-xs text-dark-400">{item.variantName}</p>
                )}
                <p className="text-xs text-dark-500 mt-0.5">
                  {item.quantity} {item.unit} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="font-bold text-dark-800 text-sm flex-shrink-0">
                {formatPrice(item.totalPrice)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-dark-800 text-sm">Price Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-500">Subtotal</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-500">Delivery Charge</span>
            <span className={cn(
              "font-medium",
              order.deliveryCharge === 0 ? "text-green-600" : ""
            )}>
              {order.deliveryCharge === 0 ? "Free" : formatPrice(order.deliveryCharge)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-dark-900 pt-2
                           border-t border-dark-100 text-base">
            <span>Total</span>
            <span className="text-primary-700">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-dark-800 text-sm flex items-center gap-2">
          <CreditCard size={16} className="text-primary-600" />
          Payment Information
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-dark-400 text-xs mb-0.5">Method</p>
            <p className="font-medium text-dark-700 capitalize">
              {paymentLabel(order.paymentMethod)}
            </p>
          </div>
          <div>
            <p className="text-dark-400 text-xs mb-0.5">Status</p>
            <span className={cn(
              "badge text-xs",
              order.paymentStatus === "paid" ? "badge-green" : "badge-yellow"
            )}>
              {order.paymentStatus}
            </span>
          </div>
          {order.transactionId && (
            <div className="col-span-2">
              <p className="text-dark-400 text-xs mb-0.5">Transaction ID</p>
              <p className="font-mono text-xs text-dark-700">{order.transactionId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-dark-800 text-sm flex items-center gap-2">
            <MapPin size={16} className="text-primary-600" />
            Delivery Address
          </h2>
          <div className="text-sm">
            <p className="font-medium text-dark-800">{order.address.fullName}</p>
            <p className="text-dark-500 mt-0.5">
              {order.address.fullAddress}, {order.address.thana},
              {order.address.district}, {order.address.division}
            </p>
            <p className="text-dark-400 text-xs mt-1">{order.address.phone}</p>
          </div>
        </div>
      )}

      {/* Order Date */}
      <div className="card p-5">
        <div className="flex items-center gap-2 text-sm text-dark-500">
          <Clock size={15} className="text-dark-400" />
          Order placed on{" "}
          <span className="font-medium text-dark-700">
            {order.createdAt?.toDate
              ? formatDate(order.createdAt.toDate())
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
