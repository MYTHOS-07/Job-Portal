import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

import { apiRateLimiter } from "../middlewares/rate-limit.middleware.js";
import { notFoundMiddleware } from "../middlewares/not-found.middleware.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";

import authRoutes from "../routes/auth.route.js";

export const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Request logging
app.use((req, _res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.originalUrl,
  });

  next();
});

// API rate limiting
app.use("/api", apiRateLimiter);

// API health check
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Portal API is running",
    timestamp: new Date().toISOString(),
  });
});

// Register feature routes here as you implement them.
// for v1
app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/jobs", jobRoutes);
// app.use("/api/v1/companies", companyRoutes);
// app.use("/api/v1/applications", applicationRoutes);
// app.use("/api/v1/admin", adminRoutes);

// Unknown routes
app.use(notFoundMiddleware);

// Error handler must be last
app.use(errorMiddleware);

export default app;
