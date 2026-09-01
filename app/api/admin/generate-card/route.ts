import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

interface LandDetailInput {
  village: string;
  taluka: string;
  district: string;
  state: string;
  groupNumber: string;
  area: number;
}

export async function POST(req: Request) {
  try {
    const cookiesStore = await cookies();
    const token = cookiesStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
    await jwtVerify(token, secret);
  } catch (error) {
    console.error("Admin token verification failed:", error);
    return NextResponse.json(
      { error: "Invalid or expired token." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const farmerId = formData.get("farmerId") as string;
    const mobileNumber = formData.get("mobileNumber") as string;
    const nameEnglish = formData.get("nameEnglish") as string;
    const nameMarathi = formData.get("nameMarathi") as string;
    const address = formData.get("address") as string;
    const imageFile = formData.get("image") as File | null;
    const landDetailsString = formData.get("landDetails") as string;
    const landDetails: LandDetailInput[] = landDetailsString
      ? JSON.parse(landDetailsString)
      : [];

    if (
      !farmerId ||
      !mobileNumber ||
      !nameEnglish ||
      !nameMarathi ||
      !address
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let cloudinaryUrl: string | null = null;
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await new Promise<UploadApiResponse | undefined>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "users" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        }
      );
      cloudinaryUrl = uploadResult?.secure_url ?? null;
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          farmerId,
          mobileNumber,
          nameEnglish,
          nameMarathi,
          address,
          cloudinaryUrl,
        },
      });

      if (landDetails.length > 0) {
        const landDetailsData = landDetails.map((land) => ({
          ...land,
          userId: createdUser.id,
        }));
        await tx.landDetail.createMany({ data: landDetailsData });
      }

      await tx.payment.create({
        data: {
          userId: createdUser.id,
          status: "SUCCESS",
          razorpayOrderId: `ADMIN_GEN_${createdUser.farmerId}_${Date.now()}`,
          razorpayPaymentId: `ADMIN_GEN_${Date.now()}`,
        },
      });

      return createdUser;
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Error in generate-card route:", error);

    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as {
        code?: string;
        meta?: { target?: string[] };
      };
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          {
            error: `A user with this ${prismaError.meta?.target?.join(
              ", "
            )} already exists.`,
          },
          { status: 409 }
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to create user.", details: message },
      { status: 500 }
    );
  }
}
