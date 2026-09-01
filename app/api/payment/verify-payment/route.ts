import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error(
        "CRITICAL: RAZORPAY_KEY_SECRET is not defined on the server."
      );
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment details." },
        { status: 400 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await prisma.payment.update({
        where: {
          razorpayOrderId: razorpay_order_id,
        },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "SUCCESS",
        },
      });
      return NextResponse.json(
        { message: "Payment verified successfully." },
        { status: 200 }
      );
    } else {
      await prisma.payment.update({
        where: {
          razorpayOrderId: razorpay_order_id,
        },
        data: {
          status: "FAILED",
        },
      });
      return NextResponse.json(
        { error: "Invalid payment signature." },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error verifying payment:", message);
    return NextResponse.json(
      { error: "An internal server error occurred.", message },
      { status: 500 }
    );
  }
}
