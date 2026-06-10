// checkout/page.tsx এ এই placeOrder function টা replace করো
// ─────────────────────────────────────────
// PAYMENT FLOW:
//
// COD / bKash Manual:
//   → Order Firestore-এ save → confirmation page
//
// bKash Tokenized:
//   → /api/payment/bkash/create → bKash URL → redirect
//   → Callback: /api/payment/bkash/callback → order update
//
// SSLCommerz (Card):
//   → /api/payment/ssl/init → GatewayURL → redirect
//   → Success: /api/payment/ssl/success → order update
// ─────────────────────────────────────────

// checkout/page.tsx এর placeOrder function replace করো এটা দিয়ে:

async function placeOrder() {
  if (!selAddr) { toast.error("Select a delivery address"); return; }
  if (items.length === 0) { router.push("/products"); return; }
  setLoading(true);

  try {
    const orderNumber = generateOrderNumber();

    // ── Save order to Firestore ──
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
      paymentStatus: "unpaid",
      address:       selAddr,
      createdAt:     serverTimestamp(),
      updatedAt:     serverTimestamp(),
    });

    // ── Notification ──
    await addDoc(collection(db, "notifications", user!.id, "items"), {
      type:      "order",
      title:     "Order Placed Successfully",
      message:   `Your order ${orderNumber} has been placed.`,
      link:      `/dashboard/orders/${ref.id}`,
      isRead:    false,
      createdAt: serverTimestamp(),
    });

    clearCart();

    // ── Payment Gateway Redirect ──
    if (selPay === "bkash") {
      // bKash tokenized
      const res = await fetch("/api/payment/bkash/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: total, orderNumber }),
      });
      const data = await res.json();
      if (data.bkashURL) {
        window.location.href = data.bkashURL;
        return;
      }
      toast.error("bKash payment initiation failed");
      return;
    }

    if (selPay === "sslcommerz") {
      // SSLCommerz card payment
      const res = await fetch("/api/payment/ssl/init", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          amount,
          orderNumber,
          customerName:    user!.name,
          customerEmail:   user!.email,
          customerPhone:   selAddr.phone,
          customerAddress: `${selAddr.fullAddress}, ${selAddr.district}`,
        }),
      });
      const data = await res.json();
      if (data.gatewayURL) {
        window.location.href = data.gatewayURL;
        return;
      }
      toast.error("Card payment initiation failed");
      return;
    }

    // COD / Nagad / Rocket → show confirmation
    setOrderId(ref.id);
    setStep(2);

  } catch (err) {
    console.error(err);
    toast.error("Order failed. Please try again.");
  } finally {
    setLoading(false);
  }
}

// ─────────────────────────────────────────
// .env.local এ এই variables add করো:
// ─────────────────────────────────────────
/*
# bKash
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
*/
