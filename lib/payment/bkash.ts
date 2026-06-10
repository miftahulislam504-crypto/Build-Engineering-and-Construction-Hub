// lib/payment/bkash.ts
// bKash Tokenized Payment API Integration
// Docs: https://developer.bka.sh/docs

const BKASH_BASE_URL = process.env.BKASH_BASE_URL ||
  "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

const BKASH_APP_KEY    = process.env.BKASH_APP_KEY    || "";
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET || "";
const BKASH_USERNAME   = process.env.BKASH_USERNAME   || "";
const BKASH_PASSWORD   = process.env.BKASH_PASSWORD   || "";

// ─────────────────────────────────────────
// STEP 1 — Get Token
// ─────────────────────────────────────────
export async function getBkashToken(): Promise<string> {
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Accept":        "application/json",
      "username":      BKASH_USERNAME,
      "password":      BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key:    BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    }),
  });

  const data = await res.json();
  if (!data.id_token) {
    throw new Error(`bKash token error: ${data.statusMessage || "Unknown error"}`);
  }
  return data.id_token;
}

// ─────────────────────────────────────────
// STEP 2 — Create Payment
// ─────────────────────────────────────────
export interface BkashCreatePaymentParams {
  amount:      number;
  orderNumber: string;
  callbackURL: string;
}

export interface BkashCreatePaymentResult {
  paymentID:   string;
  bkashURL:    string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
}

export async function createBkashPayment(
  params: BkashCreatePaymentParams
): Promise<BkashCreatePaymentResult> {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Accept":        "application/json",
      "Authorization": token,
      "X-App-Key":     BKASH_APP_KEY,
    },
    body: JSON.stringify({
      mode:               "0011",
      payerReference:     params.orderNumber,
      callbackURL:        params.callbackURL,
      amount:             String(params.amount),
      currency:           "BDT",
      intent:             "sale",
      merchantInvoiceNumber: params.orderNumber,
    }),
  });

  const data = await res.json();
  if (data.statusCode !== "0000") {
    throw new Error(`bKash create error: ${data.statusMessage}`);
  }
  return data;
}

// ─────────────────────────────────────────
// STEP 3 — Execute Payment
// ─────────────────────────────────────────
export interface BkashExecuteResult {
  paymentID:         string;
  trxID:             string;
  transactionStatus: string;
  amount:            string;
  currency:          string;
  customerMsisdn:    string;
  merchantInvoiceNumber: string;
}

export async function executeBkashPayment(
  paymentID: string
): Promise<BkashExecuteResult> {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Accept":        "application/json",
      "Authorization": token,
      "X-App-Key":     BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID }),
  });

  const data = await res.json();
  if (data.statusCode !== "0000") {
    throw new Error(`bKash execute error: ${data.statusMessage}`);
  }
  return data;
}

// ─────────────────────────────────────────
// STEP 4 — Query Payment Status
// ─────────────────────────────────────────
export async function queryBkashPayment(paymentID: string) {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": token,
      "X-App-Key":     BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID }),
  });

  return res.json();
}

// ─────────────────────────────────────────
// STEP 5 — Refund
// ─────────────────────────────────────────
export async function refundBkashPayment(
  paymentID: string,
  trxID:     string,
  amount:    number,
  reason:    string
) {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/refund`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": token,
      "X-App-Key":     BKASH_APP_KEY,
    },
    body: JSON.stringify({
      paymentID,
      trxID,
      amount:   String(amount),
      currency: "BDT",
      reason,
    }),
  });

  return res.json();
}
