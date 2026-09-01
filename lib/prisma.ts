// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// This prevents Prisma from creating new connections on every hot reload in development.
declare global {
  var prisma: PrismaClient | undefined;
}

// This creates a single, shared instance of the PrismaClient.
// It checks if an instance already exists on the global object, and if not, creates a new one.
// This is the recommended pattern for using Prisma with Next.js.
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
