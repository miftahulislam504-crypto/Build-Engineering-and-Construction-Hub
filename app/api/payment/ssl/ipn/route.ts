// app/api/payment/ssl/ipn/route.ts
// Instant Payment Notification — server-to-server verification
import { NextRequest, NextResponse } from "next/server";
import { validateSSLPayment } from "@/lib/payment/sslcommerz";
import { db } from "@/lib/firebase";
import {
  collection, query, where, getDocs,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const formData   = await req.formData();
    const valId      = formData.get("val_id")      as string;
    const tranId     = formData.get("tran_id")     as string;
    const amount     = formData.get("amount")      as string;
    const bankTranId = formData.get("bank_tran_id")as string;
    const status     = formData.get("status")      as string;

    if (status !== "VALID" && status !== "VALIDATED") {
      return NextResponse.json({ message: "Invalid status" });
    }

    const isValid = await validateSSLPayment(valId, Number(amount), tranId);

    if (isValid) {
      const ordersSnap = await getDocs(
        query(collection(db, "orders"), where("orderNumber", "==", tranId))
      );
      if (!ordersSnap.empty) {
        await updateDoc(doc(db, "orders", ordersSnap.docs[0].id), {
          paymentStatus: "paid",
          transactionId: bankTranId,
          updatedAt:     serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ message: "IPN received" });
  } catch (error) {
    console.error("IPN error:", error);
    return NextResponse.json({ message: "IPN error" }, { status: 500 });
  }
}
