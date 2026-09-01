import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
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

export async function DELETE(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Start date and end date are required." },
      { status: 400 }
    );
  }

  try {
    const usersToDelete = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        cloudinaryUrl: true,
      },
    });

    const publicIdsToDelete = usersToDelete
      .map((user) =>
        user.cloudinaryUrl ? getPublicIdFromUrl(user.cloudinaryUrl) : null
      )
      .filter((id): id is string => id !== null);

    if (publicIdsToDelete.length > 0) {
      await cloudinary.api.delete_resources(publicIdsToDelete);
    }

    const deleteResult = await prisma.user.deleteMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    return NextResponse.json(
      {
        message: "Users within the date range deleted successfully.",
        deletedCount: deleteResult.count,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to delete users.", details: message },
      { status: 500 }
    );
  }
}
