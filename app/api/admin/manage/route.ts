import { NextResponse } from "next/server";
import { PrismaClient, AdminRole } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
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
    await jwtVerify(token, secret);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(admins, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch admins." },
      { status: 500 }
    );
  }
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

    const { username, password, role } = await request.json();
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Username, password, and role are required." },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this username already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    const { password: _, ...adminToReturn } = newAdmin;
    return NextResponse.json(adminToReturn, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "JWTExpired") {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create admin." },
      { status: 500 }
    );
  }
}
