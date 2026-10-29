import { Router } from "express";
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.utils.js";

const router = Router();

/**
 * @POST /api/auth/register
 */

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const isUserExists = await userModel.findOne({ email });

  if (isUserExists) {
    return res.status(400).json({
      message: "User already exists",
      errors: [
        {
          field: "email",
          message: "Email is already registered",
        },
      ],
    });
  }

  const user = await userModel.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
  });

  const { accessToken, refreshToken } = generateTokens({ userId: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
    })
    .json({
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      accessToken,
    });
});

/**
 * @GET /api/auth/me
 */

router.get("/me", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = verifyAccessToken(accessToken);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized, Invalid token or expired access token" });
  }
});

/**
 * @POST /api/auth/refresh
 */

router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized, No refresh token" });
  }
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized, User not found" });
    }

    if (refreshToken !== user.refreshToken) {
      user.refreshToken = null;

      await user.save();

      return res
        .status(401)
        .json({ message: "Unauthorized,refresh token mismatch" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user._id,
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
      })
      .json({
        message: "Tokens refreshed successfully",
        accessToken,
      });
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized, Invalid token or expired refresh token",
    });
  }
});

/**
 * @POST /api/auth/login
 */

router.post("/login", (req, res) => {
  res.send("Login route");
});

export default router;
