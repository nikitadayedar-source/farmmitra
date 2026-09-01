import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
    await jwtVerify(token, secret);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  try {
    const [totalUsers, successfulPayments, helpRequests] = await Promise.all([
      prisma.user.count(),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
      prisma.helpRequest.count(),
    ]);

    return NextResponse.json(
      {
        totalUsers,
        successfulPayments,
        helpRequests,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats.", details: message },
      { status: 500 }
    );
  }
}
