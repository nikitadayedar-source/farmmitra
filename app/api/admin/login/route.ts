import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
    const alg = "HS256";

    const jwt = await new SignJWT({ adminId: admin.id, role: admin.role })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);
    const cookiesStore = await cookies();
    cookiesStore.set("auth_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ message: "Login successful!" }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Admin login error:", message);
    return NextResponse.json(
      { error: "An internal server error occurred.", message },
      { status: 500 }
    );
  }
}
