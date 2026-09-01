import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import Papa from "papaparse";

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
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        landDetails: true,
        payments: {
          where: { status: "SUCCESS" },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedData = users.map((user) => {
      const latestSuccessfulPayment =
        user.payments.length > 0 ? user.payments[0] : null;

      return {
        "Farmer ID": `\t${user.farmerId}`,
        "Name (English)": user.nameEnglish,
        "Name (Marathi)": user.nameMarathi,
        "Mobile Number": user.mobileNumber,
        Address: user.address,
        "Registration Date": user.createdAt.toISOString().split("T")[0],
        "Payment Status": latestSuccessfulPayment
          ? "SUCCESS"
          : "PENDING/FAILED",
        "Payment ID": latestSuccessfulPayment?.razorpayPaymentId || "N/A",
        "Order ID": latestSuccessfulPayment?.razorpayOrderId || "N/A",
        "Payment Date": latestSuccessfulPayment
          ? latestSuccessfulPayment.updatedAt.toISOString().split("T")[0]
          : "N/A",
        "Land Details": user.landDetails
          .map(
            (ld) =>
              `Village: ${ld.village}, Taluka: ${ld.taluka}, District: ${ld.district}, State: ${ld.state}, Gat: ${ld.groupNumber}, Area: ${ld.area} Ha`
          )
          .join(" | "),
      };
    });

    const csv = Papa.unparse(formattedData);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to export users.", details: message },
      { status: 500 }
    );
  }
}
