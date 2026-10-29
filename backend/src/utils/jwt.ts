import jwt, { JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";

// generate access and refresh tokens for a user
export const generateTokens = (userId: string) => {
  // access token: unique jti so it can be blacklisted on logout
  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn:
      (env.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
      "15m",
    jwtid: randomUUID(),
  });

  // refresh token
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn:
      (env.JWT_REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
      "7d",
  });

  return { accessToken, refreshToken };
};

// verify the access or refresh token and return its payload
export const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
};
