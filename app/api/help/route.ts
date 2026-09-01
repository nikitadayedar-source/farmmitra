import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, subject, description } = await request.json();

    if (!email || !subject || !description) {
      return NextResponse.json(
        { error: "Email, subject, and description are required." },
        { status: 400 }
      );
    }

    const newHelpRequest = await prisma.helpRequest.create({
      data: {
        email,
        subject,
        description,
      },
    });

    return NextResponse.json(
      { message: "Help request submitted successfully!", data: newHelpRequest },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error submitting help request:", message);
    return NextResponse.json(
      { error: "An internal server error occurred.", message },
      { status: 500 }
    );
  }
}
