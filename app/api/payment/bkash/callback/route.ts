// app/api/payment/bkash/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeBkashPayment } from "@/lib/payment/bkash";
import { db } from "@/lib/firebase";
import {
  collection, query, where, getDocs,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentID = searchParams.get("paymentID");
  const status    = searchParams.get("status");

  const appURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // User cancelled
  if (status === "cancel" || status === "failure") {
    return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
  }

  if (!paymentID) {
    return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
  }

  try {
    // Execute the payment
    const result = await executeBkashPayment(paymentID);

    if (result.transactionStatus === "Completed") {
      // Find order by orderNumber (merchantInvoiceNumber)
      const ordersSnap = await getDocs(
        query(
          collection(db, "orders"),
          where("orderNumber", "==", result.merchantInvoiceNumber)
        )
      );

      if (!ordersSnap.empty) {
        const orderDoc = ordersSnap.docs[0];
        await updateDoc(doc(db, "orders", orderDoc.id), {
          paymentStatus: "paid",
          transactionId: result.trxID,
          updatedAt:     serverTimestamp(),
        });
      }

      return NextResponse.redirect(
        `${appURL}/dashboard/orders?payment=success&trxID=${result.trxID}`
      );
    }

    return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
  } catch (error) {
    console.error("bKash callback error:", error);
    return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
  }
}
