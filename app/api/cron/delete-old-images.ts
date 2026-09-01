import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

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

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const usersToDeleteImagesFor = await prisma.user.findMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo,
        },
        cloudinaryUrl: {
          not: null,
        },
      },
    });

    if (usersToDeleteImagesFor.length === 0) {
      return NextResponse.json({ message: "No old images to delete." });
    }

    const deletionPromises = [];
    const successfullyDeletedUserIds: string[] = [];

    for (const user of usersToDeleteImagesFor) {
      if (user.cloudinaryUrl) {
        const publicId = getPublicIdFromUrl(user.cloudinaryUrl);
        if (publicId) {
          deletionPromises.push(cloudinary.uploader.destroy(publicId));
          successfullyDeletedUserIds.push(user.id);
        }
      }
    }

    await Promise.all(deletionPromises);

    if (successfullyDeletedUserIds.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: successfullyDeletedUserIds,
          },
        },
        data: {
          cloudinaryUrl: null,
        },
      });
    }

    return NextResponse.json({
      message: "Cleanup successful.",
      deleted_count: successfullyDeletedUserIds.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "An internal server error occurred during cron job.", message },
      { status: 500 }
    );
  }
}
