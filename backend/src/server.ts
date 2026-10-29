import "dotenv/config";

import { app } from "./app/app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma, connectDatabase } from "./config/database.js";
import { redis, connectRedis } from "./config/redis.js";

/**
 * Active HTTP server instance.
 *
 * Assigned after the application successfully starts listening
 * for incoming requests. Used during graceful shutdown to stop
 * accepting new connections and finish processing existing ones.
 */
let server: ReturnType<typeof app.listen> | undefined;

/**
 * Prevents shutdown logic from executing multiple times when
 * several termination signals are received in quick succession.
 */
let shuttingDown = false;

/**
 * Bootstraps the application.
 *
 * Startup flow:
 * 1. Connect to PostgreSQL via Prisma.
 * 2. Connect to Redis.
 * 3. Start the HTTP server.
 * 4. Configure server-level timeout settings.
 * 5. Register server error handlers.
 *
 * If any startup step fails, all opened resources are cleaned up
 * before the process exits.
 *
 * @returns {Promise<void>} Resolves when startup completes.
 */
async function startServer(): Promise<void> {
  try {
    // Connect infrastructure before accepting requests.
    await connectDatabase();
    await connectRedis();

    server = app.listen(env.PORT, () => {
      logger.info("HTTP server started", {
        url: `http://localhost:${env.PORT}`,
        environment: env.NODE_ENV,
      });
    });

    /**
     * Protection against slowloris-style connections and
     * excessively long-running requests.
     */
    server.headersTimeout = 10_000;
    server.requestTimeout = 30_000;
    server.keepAliveTimeout = 5_000;

    /**
     * Handles unexpected HTTP server errors.
     */
    server.on("error", (error: Error) => {
      logger.error("HTTP server error", {
        message: error.message,
      });

      process.exitCode = 1;
    });
  } catch (error) {
    logger.error("Server startup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    await Promise.allSettled([prisma.$disconnect(), redis.quit()]);

    process.exitCode = 1;
  }
}

/**
 * Gracefully shuts down the application.
 *
 * The shutdown sequence:
 * 1. Stop accepting new HTTP connections.
 * 2. Allow active requests to complete.
 * 3. Disconnect Prisma from the database.
 * 4. Close the Redis connection.
 *
 * This function is idempotent and will execute only once,
 * regardless of how many termination signals are received.
 *
 * @param {string} signal Process signal that triggered shutdown.
 * @returns {Promise<void>} Resolves when cleanup is complete.
 */

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("Shutting down server", { signal });

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await Promise.all([prisma.$disconnect(), redis.quit()]);

    logger.info("Server shut down successfully");
  } catch (error) {
    logger.error("Error during shutdown", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    process.exitCode = 1;
  }
}

/**
 * Handle Ctrl+C interruptions from the terminal.
 */
process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

/**
 * Handle termination requests from process managers,
 * containers, and orchestration platforms such as Docker
 * and Kubernetes.
 */
process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

/**
 * Application entry point.
 *
 * Begins infrastructure initialization and starts the
 * HTTP server.
 */
void startServer();
