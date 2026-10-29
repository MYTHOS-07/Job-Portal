import { NextFunction, Request, RequestHandler, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";

export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Extract the token from the request headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token (you would typically use a JWT library here)
    const decoded = verifyToken(token, env.JWT_ACCESS_SECRET);

    const isBlacklisted = await redis.get(`blacklist:${decoded.jti}`);

    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token revoked",
      });
    }

    // Attach the decoded user information to the request object
    req.user = decoded.userId;

    // Call the next middleware
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
