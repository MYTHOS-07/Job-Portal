import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

/**
 * PostgreSQL adapter used by Prisma.
 */
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

/**
 * Shared Prisma client instance.
 */
export const prisma = new PrismaClient({
  adapter,
});

/**
 * Establishes the database connection.
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();

  console.log("PostgreSQL connected successfully");
}