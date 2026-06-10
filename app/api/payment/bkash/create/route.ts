// app/api/payment/bkash/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createBkashPayment } from "@/lib/payment/bkash";

export async function POST(req: NextRequest) {
  try {
    const { amount, orderNumber } = await req.json();

    if (!amount || !orderNumber) {
      return NextResponse.json(
        { error: "amount and orderNumber are required" },
        { status: 400 }
      );
    }

    const appURL    = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackURL = `${appURL}/api/payment/bkash/callback`;

    const result = await createBkashPayment({
      amount,
      orderNumber,
      callbackURL,
    });

    return NextResponse.json({
      success:   true,
      paymentID: result.paymentID,
      bkashURL:  result.bkashURL,
    });
  } catch (error: any) {
    console.error("bKash create error:", error);
    return NextResponse.json(
      { error: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
