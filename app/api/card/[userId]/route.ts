import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const userWithDetails = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        landDetails: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!userWithDetails) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const hasSuccessfulPayment = userWithDetails.payments.some(
      (payment) => payment.status === "SUCCESS"
    );

    if (!hasSuccessfulPayment) {
      return NextResponse.json(
        { error: "Payment not completed for this user." },
        { status: 403 }
      );
    }

    return NextResponse.json(userWithDetails, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch user card data:", error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "An internal server error occurred.", message },
      { status: 500 }
    );
  }
}
