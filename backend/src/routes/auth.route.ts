import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = Router();

/**
 * @swagger
 * api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 */
router.post("/register", validateBody(registerSchema), authController.register);

/**
 * @swagger
 * api/v1/auth/login:
 *   post:
 *     summary: Authenticate a user
 */
router.post("/login", validateBody(loginSchema), authController.login);

/**
 * @swagger
 * api/v1/auth/refresh-token:
 *   get:
 *     summary: Refresh the access token
 */
router.get("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * api/v1/auth/me:
 *   get:
 *     summary: Get the current user's profile
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @swagger
 * api/v1/auth/logout:
 *   post:
 *     summary: Logout the current user
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @swagger
 * api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 */
// router.post("/forgot-password", authController.forgotPassword);


export default router;
