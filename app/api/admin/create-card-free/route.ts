import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface JwtPayload {
  adminId: string;
  role: AdminRole;
}

export async function POST(request: Request) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
    const { payload } = await jwtVerify(token, secret);
    const decodedPayload = payload as unknown as JwtPayload;

    if (decodedPayload.role !== AdminRole.SUPER_ADMIN) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You do not have permission to perform this action.",
        },
        { status: 403 }
      );
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.payment.create({
      data: {
        userId: userId,
        status: "SUCCESS",
        razorpayOrderId: `ADMIN_GENERATED_${user.farmerId}_${Date.now()}`,
        razorpayPaymentId: `ADMIN_GEN_${Date.now()}`,
      },
    });

    return NextResponse.json(
      { message: "Free card generated successfully for user." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to generate free card.", details: message },
      { status: 500 }
    );
  }
}
