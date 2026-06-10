// app/api/payment/ssl/fail/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const appURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
}

export async function GET(req: NextRequest) {
  const appURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appURL}/checkout?payment=failed`);
}
