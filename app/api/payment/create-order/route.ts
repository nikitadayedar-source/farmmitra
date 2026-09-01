import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { error: "User ID and amount are required." },
        { status: 400 }
      );
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${userId}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json(
        { error: "Failed to create Razorpay order." },
        { status: 500 }
      );
    }

    await prisma.payment.create({
      data: {
        userId: userId,
        razorpayOrderId: order.id,
        status: "FAILED",
      },
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    console.error("--- Razorpay Order Creation Failed ---");
    console.error(error);

    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      {
        error: "An internal server error occurred while creating the order.",
        details: message,
      },
      { status: 500 }
    );
  }
}
