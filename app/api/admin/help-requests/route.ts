import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
    await jwtVerify(token, secret);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  try {
    const helpRequests = await prisma.helpRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(helpRequests, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to fetch help requests.", details: message },
      { status: 500 }
    );
  }
}
