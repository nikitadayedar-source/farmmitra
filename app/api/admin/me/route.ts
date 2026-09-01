import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface JwtPayload {
  adminId: string;
  role: AdminRole;
}

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
    const { payload } = await jwtVerify(token, secret);
    const decodedPayload = payload as unknown as JwtPayload;

    return NextResponse.json(
      {
        id: decodedPayload.adminId,
        role: decodedPayload.role,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid or expired token." },
      { status: 401 }
    );
  }
}
