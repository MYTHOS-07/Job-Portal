import rateLimit from "express-rate-limit";

/**
 * Global API rate limiter.
 *
 * Protects the application from abuse, brute-force attacks,
 * excessive traffic, and accidental request floods by limiting
 * how many requests a client can make within a fixed time window.
 *
 * Configuration:
 * - Time window: 15 minutes
 * - Maximum requests: 100 per IP address
 * - Uses modern RateLimit response headers
 * - Disables legacy X-RateLimit headers
 *
 * This middleware is typically applied globally or to
 * sensitive routes such as authentication endpoints.
 */
export const apiRateLimiter = rateLimit({
  /**
   * Length of the rate-limiting window in milliseconds.
   *
   * 15 minutes = 900,000 ms
   */
  windowMs: 15 * 60 * 1000,

  /**
   * Maximum number of requests allowed from a single IP
   * during the configured time window.
   */
  limit: 100,

  /**
   * Send standardized RateLimit headers as defined by the
   * latest draft specification.
   */
  standardHeaders: "draft-8",

  /**
   * Disable legacy X-RateLimit-* headers.
   */
  legacyHeaders: false,

  /**
   * Response sent when a client exceeds the allowed
   * request limit.
   */
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
