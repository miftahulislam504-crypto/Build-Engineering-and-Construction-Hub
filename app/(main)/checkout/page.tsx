"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, CreditCard, CheckCircle2,
  Loader2, ChevronRight, Plus, Phone,
} from "lucide-react";
import { doc, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice, generateOrderNumber, cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import toast from "react-hot-toast";

const STEPS = ["Address", "Payment", "Confirm"];

const PAYMENT_METHODS = [
  { id: "bkash",   label: "bKash",            icon: "💳", desc: "Pay via bKash mobile banking"         },
  { id: "nagad",   label: "Nagad",            icon: "💳", desc: "Pay via Nagad mobile banking"         },
  { id: "rocket",  label: "Rocket",           icon: "💳", desc: "Pay via Rocket mobile banking"        },
  { id: "sslcommerz", label: "Card Payment",  icon: "💳", desc: "VISA / Mastercard via SSLCommerz"     },
  { id: "cod",     label: "Cash on Delivery", icon: "💵", desc: "Pay when your order is delivered"     },
];

export default function CheckoutPage() {
  const router  = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const user    = useAuthStore((s) => s.user);

  const [step,      setStep]      = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selAddr,   setSelAddr]   = useState<any>(null);
  const [selPay,    setSelPay]    = useState("bkash");
  const [loading,   setLoading]   = useState(false);
  const [orderId,   setOrderId]   = useState("");

  // New address form
  const [newAddr, setNewAddr]   = useState({
    fullName: user?.name || "", phone: user?.phone || "",
    division: "Dhaka", district: "", thana: "", fullAddress: "",
  });
  const [showNewAddr, setShowNewAddr] = useState(false);

  const subtotal       = totalPrice();
  const deliveryCharge = subtotal > 10000 ? 0 : 150;
  const total          = subtotal + deliveryCharge;

  // Load saved addresses
  useEffect(() => {
    if (!user?.id) return;
    getDocs(collection(db, "users", user.id, "addresses")).then((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAddresses(list);
      const def = list.find((a: any) => a.isDefault) || list[0];
      if (def) setSelAddr(def);
    });
  }, [user?.id]);

  async function saveNewAddress() {
    if (!newAddr.fullName || !newAddr.phone || !newAddr.district ||
        !newAddr.thana || !newAddr.fullAddress) {
      toast.error("Please fill all address fields"); return;
    }
    const ref = await addDoc(
      collection(db, "users", user!.id, "addresses"),
      { ...newAddr, isDefault: addresses.length === 0, createdAt: serverTimestamp() }
    );
    const saved = { id: ref.id, ...newAddr };
    setAddresses((a) => [...a, saved]);
    setSelAddr(saved);
    setShowNewAddr(false);
    toast.success("Address saved");
  }

  async function placeOrder() {
    if (!selAddr) { toast.error("Select a delivery address"); return; }
    if (items.length === 0) { router.push("/products"); return; }
    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      const ref = await addDoc(collection(db, "orders"), {
        orderNumber,
        userId:        user!.id,
        userName:      user!.name,
        userEmail:     user!.email,
        status:        "pending",
        items:         items.map((i) => ({
          productId:   i.productId,
          name:        i.name,
          image:       i.image,
          quantity:    i.quantity,
          unitPrice:   i.price,
          totalPrice:  i.price * i.quantity,
          variantName: i.variantName || "",
          unit:        i.unit,
        })),
        subtotal,
        deliveryCharge,
        discount:      0,
        total,
        paymentMethod: selPay,
        paymentStatus: selPay === "cod" ? "unpaid" : "pending",
        address:       selAddr,
        createdAt:     serverTimestamp(),
        updatedAt:     serverTimestamp(),
      });

      // Add notification
      await addDoc(collection(db, "notifications", user!.id, "items"), {
        type:      "order",
        title:     "Order Placed Successfully",
        message:   `Your order ${orderNumber} has been placed.`,
        link:      `/dashboard/orders/${ref.id}`,
        isRead:    false,
        createdAt: serverTimestamp(),
      });

      setOrderId(ref.id);
      clearCart();
      setStep(2);
    } catch {
      toast.error("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && step !== 2) {
    return (
      <div className="container-main py-16 text-center">
        <p className="text-dark-400 mb-4">Your cart is empty.</p>
        <Link href="/products" className="btn-primary inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container-main py-8 max-w-5xl">

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                "transition-all",
                i < step  ? "bg-green-500 text-white" :
                i === step ? "bg-primary-600 text-white" :
                "bg-dark-200 text-dark-500"
              )}>
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:block",
                i === step ? "text-primary-700" : "text-dark-400"
              )}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight size={16} className="text-dark-300" />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Address ── */}
        {step === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display text-xl font-bold text-dark-900 flex items-center gap-2">
                <MapPin size={20} className="text-primary-600" />
                Delivery Address
              </h2>

              {/* Saved addresses */}
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelAddr(addr)}
                  className={cn(
                    "card p-4 cursor-pointer transition-all",
                    selAddr?.id === addr.id
                      ? "border-primary-500 bg-primary-50"
                      : "hover:border-dark-300"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-dark-800 text-sm">
                        {addr.fullName}
                        {addr.isDefault && (
                          <span className="ml-2 badge-blue badge text-2xs">Default</span>
                        )}
                      </p>
                      <p className="text-xs text-dark-500 mt-1">
                        {addr.fullAddress}, {addr.thana}, {addr.district}, {addr.division}
                      </p>
                      <p className="text-xs text-dark-400 mt-0.5 flex items-center gap-1">
                        <Phone size={11} /> {addr.phone}
                      </p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      selAddr?.id === addr.id
                        ? "border-primary-600 bg-primary-600"
                        : "border-dark-300"
                    )}>
                      {selAddr?.id === addr.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new address */}
              {!showNewAddr ? (
                <button
                  onClick={() => setShowNewAddr(true)}
                  className="w-full py-3 border-2 border-dashed border-dark-200
                             rounded-xl text-sm text-dark-400 hover:border-primary-300
                             hover:text-primary-600 transition-all flex items-center
                             justify-center gap-2"
                >
                  <Plus size={16} /> Add New Address
                </button>
              ) : (
                <div className="card p-5 space-y-4">
                  <p className="font-semibold text-dark-800 text-sm">New Address</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Full Name</label>
                      <input type="text" value={newAddr.fullName}
                        onChange={(e) => setNewAddr((a) => ({ ...a, fullName: e.target.value }))}
                        className="input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input type="tel" value={newAddr.phone}
                        onChange={(e) => setNewAddr((a) => ({ ...a, phone: e.target.value }))}
                        className="input" placeholder="01XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="label">Division</label>
                      <select value={newAddr.division}
                        onChange={(e) => setNewAddr((a) => ({ ...a, division: e.target.value }))}
                        className="input">
                        {["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barisal","Rangpur","Mymensingh"]
                          .map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">District</label>
                      <input type="text" value={newAddr.district}
                        onChange={(e) => setNewAddr((a) => ({ ...a, district: e.target.value }))}
                        className="input" placeholder="District" />
                    </div>
                    <div>
                      <label className="label">Thana / Upazila</label>
                      <input type="text" value={newAddr.thana}
                        onChange={(e) => setNewAddr((a) => ({ ...a, thana: e.target.value }))}
                        className="input" placeholder="Thana" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Full Address</label>
                    <textarea value={newAddr.fullAddress} rows={2}
                      onChange={(e) => setNewAddr((a) => ({ ...a, fullAddress: e.target.value }))}
                      className="input resize-none" placeholder="House, Road, Area..." />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowNewAddr(false)} className="btn-secondary btn-sm">
                      Cancel
                    </button>
                    <button onClick={saveNewAddress} className="btn-primary btn-sm">
                      Save Address
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (!selAddr) { toast.error("Select a delivery address"); return; }
                  setStep(1);
                }}
                className="btn-primary w-full justify-center btn-lg"
              >
                Continue to Payment <ChevronRight size={18} />
              </button>
            </div>

            {/* Order mini summary */}
            <OrderSummaryCard items={items} subtotal={subtotal}
              deliveryCharge={deliveryCharge} total={total} />
          </div>
        )}

        {/* ── Step 1: Payment ── */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display text-xl font-bold text-dark-900 flex items-center gap-2">
                <CreditCard size={20} className="text-primary-600" />
                Payment Method
              </h2>

              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelPay(method.id)}
                  className={cn(
                    "card p-4 cursor-pointer transition-all flex items-center gap-4",
                    selPay === method.id
                      ? "border-primary-500 bg-primary-50"
                      : "hover:border-dark-300"
                  )}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-dark-800 text-sm">{method.label}</p>
                    <p className="text-xs text-dark-400">{method.desc}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0",
                    selPay === method.id
                      ? "border-primary-600 bg-primary-600"
                      : "border-dark-300"
                  )}>
                    {selPay === method.id && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* bKash instruction */}
              {selPay === "bkash" && (
                <div className="card p-4 bg-pink-50 border-pink-200">
                  <p className="text-sm font-semibold text-pink-800 mb-1">bKash Payment</p>
                  <p className="text-xs text-pink-700">
                    After placing order, send payment to: <strong>01XXXXXXXXX</strong> (Merchant).
                    Use order number as reference.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">
                  Back
                </button>
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="btn-primary flex-1 justify-center btn-lg"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                  ) : (
                    <>Place Order · {formatPrice(total)}</>
                  )}
                </button>
              </div>
            </div>

            <OrderSummaryCard items={items} subtotal={subtotal}
              deliveryCharge={deliveryCharge} total={total} address={selAddr} />
          </div>
        )}

        {/* ── Step 2: Confirmation ── */}
        {step === 2 && (
          <div className="max-w-lg mx-auto text-center">
            <div className="card p-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                               justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-dark-900 mb-2">
                Order Placed!
              </h2>
              <p className="text-dark-500 text-sm mb-6">
                Your order has been placed successfully.
                We will contact you shortly for confirmation.
              </p>

              {selPay !== "cod" && (
                <div className="card p-4 bg-yellow-50 border-yellow-200 mb-6 text-left">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    Payment Required
                  </p>
                  <p className="text-xs text-yellow-700">
                    Please complete your {PAYMENT_METHODS.find((m) => m.id === selPay)?.label} payment
                    of {formatPrice(total)} using your order number as reference.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Link
                  href={`/dashboard/orders${orderId ? `/${orderId}` : ""}`}
                  className="btn-primary w-full justify-center"
                >
                  View Order Details
                </Link>
                <Link href="/products" className="btn-secondary w-full justify-center">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function OrderSummaryCard({
  items, subtotal, deliveryCharge, total, address
}: any) {
  return (
    <div className="card p-5 space-y-4 h-fit">
      <p className="font-display font-bold text-dark-900">Order Summary</p>

      {/* Items */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.map((item: any) => (
          <div key={`${item.productId}-${item.variantName}`}
            className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-50 flex-shrink-0">
              <img src={item.image || "/images/placeholder.png"}
                alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-dark-700 line-clamp-1">{item.name}</p>
              <p className="text-xs text-dark-400">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <p className="text-xs font-semibold text-dark-800 flex-shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-dark-100 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-dark-500">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-dark-500">Delivery</span>
          <span className={deliveryCharge === 0 ? "text-green-600 font-medium" : "font-medium"}>
            {deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-dark-900 pt-1 border-t border-dark-100">
          <span>Total</span>
          <span className="text-primary-700 text-lg">{formatPrice(total)}</span>
        </div>
      </div>

      {address && (
        <div className="border-t border-dark-100 pt-3">
          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">
            Delivering to
          </p>
          <p className="text-xs text-dark-700 font-medium">{address.fullName}</p>
          <p className="text-xs text-dark-500">
            {address.fullAddress}, {address.thana}, {address.district}
          </p>
        </div>
      )}
    </div>
  );
}
