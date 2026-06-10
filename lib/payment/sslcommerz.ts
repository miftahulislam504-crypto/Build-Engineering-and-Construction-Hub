// lib/payment/sslcommerz.ts
// SSLCommerz Payment Gateway Integration
// Docs: https://developer.sslcommerz.com

const STORE_ID       = process.env.SSLCOMMERZ_STORE_ID       || "";
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || "";
const IS_LIVE        = process.env.SSLCOMMERZ_IS_LIVE === "true";

const BASE_URL = IS_LIVE
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

// ─────────────────────────────────────────
// INIT PAYMENT
// ─────────────────────────────────────────
export interface SSLInitParams {
  amount:       number;
  orderNumber:  string;
  customerName: string;
  customerEmail:string;
  customerPhone:string;
  customerAddress: string;
  successURL:   string;
  failURL:      string;
  cancelURL:    string;
  ipnURL:       string;
}

export interface SSLInitResult {
  status:       string;
  GatewayPageURL: string;
  sessionkey:   string;
  desc:         string;
}

export async function initSSLPayment(
  params: SSLInitParams
): Promise<SSLInitResult> {
  const formData = new URLSearchParams({
    store_id:          STORE_ID,
    store_passwd:      STORE_PASSWORD,
    total_amount:      String(params.amount),
    currency:          "BDT",
    tran_id:           params.orderNumber,
    success_url:       params.successURL,
    fail_url:          params.failURL,
    cancel_url:        params.cancelURL,
    ipn_url:           params.ipnURL,
    cus_name:          params.customerName,
    cus_email:         params.customerEmail,
    cus_phone:         params.customerPhone,
    cus_add1:          params.customerAddress,
    cus_city:          "Dhaka",
    cus_country:       "Bangladesh",
    shipping_method:   "NO",
    product_name:      "Construction Materials",
    product_category:  "Construction",
    product_profile:   "general",
    multi_card_name:   "mastercard,visacard,amexcard",
  });

  const res = await fetch(`${BASE_URL}/gwprocess/v4/api.php`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    formData.toString(),
  });

  const data = await res.json();

  if (data.status !== "SUCCESS") {
    throw new Error(`SSLCommerz init error: ${data.failedreason || "Unknown"}`);
  }

  return data;
}

// ─────────────────────────────────────────
// VALIDATE PAYMENT (IPN / Success callback)
// ─────────────────────────────────────────
export async function validateSSLPayment(
  valId: string,
  amount: number,
  tranId: string
): Promise<boolean> {
  const res = await fetch(
    `${BASE_URL}/validator/api/validationserverAPI.php` +
    `?val_id=${valId}&store_id=${STORE_ID}` +
    `&store_passwd=${STORE_PASSWORD}&format=json`
  );

  const data = await res.json();

  return (
    data.status        === "VALID"    &&
    data.tran_id       === tranId     &&
    Math.abs(Number(data.amount) - amount) < 1
  );
}

// ─────────────────────────────────────────
// REFUND
// ─────────────────────────────────────────
export async function refundSSLPayment(
  bankTranId: string,
  amount:     number,
  reason:     string
) {
  const res = await fetch(
    `${BASE_URL}/developer/api/merchantTransIDvalidationAPI.php` +
    `?bank_tran_id=${bankTranId}` +
    `&store_id=${STORE_ID}` +
    `&store_passwd=${STORE_PASSWORD}` +
    `&refund_amount=${amount}` +
    `&refund_remarks=${encodeURIComponent(reason)}` +
    `&format=json`
  );
  return res.json();
}
