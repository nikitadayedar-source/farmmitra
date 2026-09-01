import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join("/");
    const lastDotIndex = publicIdWithExtension.lastIndexOf(".");
    return lastDotIndex === -1
      ? publicIdWithExtension
      : publicIdWithExtension.substring(0, lastDotIndex);
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
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
    const userId = (await params).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        landDetails: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to fetch user details.", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
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
    const userId = (await params).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cloudinaryUrl: true },
    });
    if (user && user.cloudinaryUrl) {
      const publicId = getPublicIdFromUrl(user.cloudinaryUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "User deleted successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";

    if (
      error instanceof Error &&
      "code" in error &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "User not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete user.", details: message },
      { status: 500 }
    );
  }
}
