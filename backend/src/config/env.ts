import "dotenv/config";
import { z } from "zod";

/**
 * Environment variable schema and validation rules.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

  MAIL_HOST: z.string().default(""),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_USER: z.string().default(""),
  MAIL_PASSWORD: z.string().default(""),
  MAIL_FROM: z.string().default(""),
});

/**
 * Validate environment variables at startup.
 */
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * Validated application configuration.
 */
export const env = parsedEnv.data;
