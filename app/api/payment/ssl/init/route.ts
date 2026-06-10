// app/api/payment/ssl/init/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initSSLPayment } from "@/lib/payment/sslcommerz";

export async function POST(req: NextRequest) {
  try {
    const {
      amount, orderNumber,
      customerName, customerEmail,
      customerPhone, customerAddress,
    } = await req.json();

    if (!amount || !orderNumber) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const appURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await initSSLPayment({
      amount,
      orderNumber,
      customerName:    customerName    || "Customer",
      customerEmail:   customerEmail   || "customer@example.com",
      customerPhone:   customerPhone   || "01700000000",
      customerAddress: customerAddress || "Dhaka, Bangladesh",
      successURL: `${appURL}/api/payment/ssl/success`,
      failURL:    `${appURL}/api/payment/ssl/fail`,
      cancelURL:  `${appURL}/api/payment/ssl/cancel`,
      ipnURL:     `${appURL}/api/payment/ssl/ipn`,
    });

    return NextResponse.json({
      success:        true,
      gatewayURL:     result.GatewayPageURL,
      sessionKey:     result.sessionkey,
    });
  } catch (error: any) {
    console.error("SSLCommerz init error:", error);
    return NextResponse.json(
      { error: error.message || "Payment init failed" },
      { status: 500 }
    );
  }
}
