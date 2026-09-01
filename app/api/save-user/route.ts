import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import prisma from "@/lib/prisma";
import { farmerFormSchema } from "@/lib/validations"; // Import the Zod schema

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const formDataObject = Object.fromEntries(formData.entries());
    const validationResult = farmerFormSchema.safeParse(formDataObject);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid form data.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      farmerId,
      mobileNumber,
      nameEnglish,
      nameMarathi,
      address,
      landDetails,
    } = validationResult.data;
    const imageFile = formData.get("image") as File | null;

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
          area: land.area,
          userId: createdUser.id,
        }));
        await tx.landDetail.createMany({ data: landDetailsData });
      }

      return createdUser;
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Error in save-user route:", error);

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
