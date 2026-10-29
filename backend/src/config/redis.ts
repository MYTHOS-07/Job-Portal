import { Redis } from "ioredis";
import { env } from "./env.js";

/**
 * Shared Redis client.
 */
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
});

/**
 * Log Redis connection errors.
 */
redis.on("error", (error: Error) => {
  console.error("Redis error:", error.message);
});

/**
 * Connect to Redis and verify connectivity.
 */
export async function connectRedis(): Promise<void> {
  await redis.connect();
  await redis.ping();

  console.log("Redis connected successfully");
}
