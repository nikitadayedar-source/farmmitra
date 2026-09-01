import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

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
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("searchQuery");

    const whereClause: Prisma.UserWhereInput = {};
    if (searchQuery) {
      whereClause.farmerId = {
        contains: searchQuery,
        mode: "insensitive",
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nameEnglish: true,
        farmerId: true,
        landDetails: {
          select: { district: true },
          take: 1,
        },
        // Include the most recent payment record for each user
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedUsers = users.map((user) => {
      const latestStatus = user.payments[0]?.status || "FAILED";

      return {
        id: user.id,
        name: user.nameEnglish,
        farmerId: user.farmerId,
        district: user.landDetails[0]?.district || "N/A",
        paymentStatus: latestStatus,
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to fetch users.", details: message },
      { status: 500 }
    );
  }
}
