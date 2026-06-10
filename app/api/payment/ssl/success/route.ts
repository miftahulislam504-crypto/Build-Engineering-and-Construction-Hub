// app/api/payment/ssl/success/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateSSLPayment } from "@/lib/payment/sslcommerz";
import { db } from "@/lib/firebase";
import {
  collection, query, where, getDocs,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";

export async function POST(req: NextRequest) {
  const appURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const formData   = await req.formData();
    const valId      = formData.get("val_id")      as string;
    const tranId     = formData.get("tran_id")     as string;
    const amount     = formData.get("amount")      as string;
    const bankTranId = formData.get("bank_tran_id")as string;

    if (!valId || !tranId) {
      return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
    }

    // Validate the payment
    const isValid = await validateSSLPayment(valId, Number(amount), tranId);

    if (isValid) {
      // Update order status
      const ordersSnap = await getDocs(
        query(collection(db, "orders"), where("orderNumber", "==", tranId))
      );

      if (!ordersSnap.empty) {
        const orderDoc = ordersSnap.docs[0];
        await updateDoc(doc(db, "orders", orderDoc.id), {
          paymentStatus: "paid",
          transactionId: bankTranId,
          updatedAt:     serverTimestamp(),
        });
      }

      return NextResponse.redirect(
        `${appURL}/dashboard/orders?payment=success`
      );
    }

    return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
  } catch (error) {
    console.error("SSL success error:", error);
    return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
  }
}
