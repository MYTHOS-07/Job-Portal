import type { RequestHandler } from "express";

/**
 * Catch-all route handler for unmatched requests.
 *
 * This middleware is executed only when no preceding route
 * or middleware has handled the incoming request.
 *
 * Returns a standardized 404 response containing the HTTP
 * method and requested path to aid debugging.
 *
 * This middleware should be registered after all application
 * routes and before the global error handler.
 */
export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,

    /**
     * Include the requested method and path so clients and
     * developers can quickly identify the missing endpoint.
     */
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
