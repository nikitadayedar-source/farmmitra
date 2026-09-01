import { NextResponse } from "next/server";
import { PrismaClient, AdminRole } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

interface JwtPayload {
  adminId: string;
  role: AdminRole;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
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
    const { payload } = await jwtVerify(token, secret);
    const decodedPayload = payload as unknown as JwtPayload;

    if (decodedPayload.role !== AdminRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission." },
        { status: 403 }
      );
    }

    const { adminId } = await context.params;

    if (decodedPayload.adminId === adminId) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    await prisma.admin.delete({
      where: { id: adminId },
    });

    return NextResponse.json(
      { message: "Admin deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "JWTExpired") {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete admin." },
      { status: 500 }
    );
  }
}
