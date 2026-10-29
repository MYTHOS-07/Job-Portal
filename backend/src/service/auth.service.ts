import userDao from "../dao/user.dao.js";
import { RegisterInput } from "../validators/auth.validator.js";
import { generateTokens, verifyToken } from "../utils/jwt.js";
import { compareHash, hashPassword, hashRefreshToken } from "../utils/bycpt.js";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";

// user registration Implementation
const register = async (data: RegisterInput) => {
  const { password, ...userData } = data;

  const existingUser = await userDao.findUserByEmail(userData.email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const user = await userDao.createUser(userData, await hashPassword(password));

  const { accessToken, refreshToken } = generateTokens(user.id);

  await userDao.updateRefreshToken(
    user.id,
    await hashRefreshToken(refreshToken),
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// login implementation
const login = async (email: string, password: string) => {
  const user = await userDao.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await compareHash(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  await userDao.updateRefreshToken(
    user.id,
    await hashRefreshToken(refreshToken),
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// refresh token implementation
export const refreshToken = async (refreshToken: string) => {
  const { userId } = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);

  const user = await userDao.findUserById(userId);

  if (!user || !user.refreshToken) {
    throw new Error("User not found");
  }

  const isValid = await compareHash(refreshToken, user.refreshToken);

  if (!isValid) {
    await userDao.updateRefreshToken(user.id, null);

    throw new Error("Unauthorized");
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user.id,
  );

  await userDao.updateRefreshToken(
    user.id,
    await hashRefreshToken(newRefreshToken),
  );

  return {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  };
};

// getCurrentUser implementation
const getCurrentUser = async (userId: string) => {
  const user = await userDao.findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// logout implementation
const logout = async (userId: string, accessToken?: string) => {
  const user = await userDao.findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  await userDao.updateRefreshToken(user.id, null);

  if (accessToken) {
    const payload = verifyToken(accessToken, env.JWT_ACCESS_SECRET);

    console.log(payload);

    if (payload.jti && payload.exp) {
      const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redis.set(`blacklist:${payload.jti}`, "1", "EX", expiresIn);
      }
    }
  }

  return;
};

export default { register, login, refreshToken, getCurrentUser, logout };
