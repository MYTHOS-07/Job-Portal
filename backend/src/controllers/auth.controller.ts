import { Request, RequestHandler, Response } from "express";
import authService from "../service/auth.service.js";
import { LoginInput, RegisterInput } from "../validators/auth.validator.js";
import { env } from "../config/env.js";

/**
 * Register a new user.
 *
 * @route   POST /api/v1/auth/register
 * @access  Public
 *
 * @description Creates a new user account and returns authentication data with a access token.
 *
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 *
 * @body
 * - name {string} User's full name
 * - email {string} User's email address
 * - password {string} User's password
 *
 * @returns {Promise<void>} registered User data with access and refresh tokens
 *
 * @response 201 User registered successfully
 * @response 400 Invalid request data
 * @response 409 Email already exists
 * @response 500 Internal server error
 *
 * @throws {ApiError} If registration fails
 *
 * @sideEffects
 * - Creates a new user document
 * - Hashes password
 * - Generates access token
 * - Generates refresh token
 * - Sets authentication cookies
 * - Sends welcome email
 */

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body as RegisterInput);

  return res
    .status(201)
    .cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      message: "User registered successfully",
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        accessToken: result.accessToken,
      },
    });
};

/**
 * Authenticate a user and create a session.
 *
 * @route   POST /api/v1/auth/login
 * @access  Public
 *
 * @description Verifies user credentials and returns authentication tokens.
 *
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 *
 * @body
 * - email {string} User's email address
 * - password {string} User's password
 *
 * @returns {Promise<void>} logged-in user data with access and refresh tokens
 *
 * @response 200 Login successful
 * @response 400 Invalid request data
 * @response 401 Invalid email or password
 * @response 404 User not found
 * @response 500 Internal server error
 *
 * @throws {ApiError} If authentication fails
 *
 * @sideEffects
 * - Generates access token
 * - Generates refresh token
 * - Sets authentication cookies
 * - Updates last login timestamp (if implemented)
 */
export const login: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const result = await authService.login(email, password);

  return res
    .status(200)
    .cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      message: "Login successful",
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        accessToken: result.accessToken,
      },
    });
};

/**
 * Create a new access and refresh token for a user.
 *
 * @route   POST /api/v1/auth/refresh-token
 * @access  Private
 *
 * @description Validates the refresh-token cookie and returns new access and refresh tokens.
 *
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 *
 * @headers
 * - Cookie: refreshToken {string} User's refresh token
 *
 * @returns {Promise<void>} access and refresh tokens
 *
 * @response 200 token refresh successful
 * @response 401 Unauthorized
 * @response 404 User not found
 * @response 500 Internal server error
 *
 * @throws {ApiError} unauthorized if refresh token is missing or invalid
 *
 * @sideEffects
 * - Generates access token
 * - Generates refresh token
 * - Sets authentication cookies
 */

export const refreshToken: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new Error("Unauthorized");
  }

  const result = await authService.refreshToken(refreshToken);

  return res
    .status(200)
    .cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      message: "Token refresh successful",
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        accessToken: result.accessToken,
      },
    });
};

/**
 * Returns the profile of the authenticated user.
 *
 * @method      GET
 * @route       /api/v1/auth/me
 * @access      Private
 * @middleware  authMiddleware - verifies access token and attaches user to req.user
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 *
 * @remarks
 * Headers:
 * - AccessToken: Bearer <access_token>
 *
 * @returns {Promise<void>} User profile data
 *
 * @response 200 User profile retrieved successfully
 * @response 401 Authentication required or invalid token
 * @response 403 Access denied
 * @response 500 Internal server error
 *
 * @throws {ApiError} Authentication or server error
 */

const getCurrentUser: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user as string;

  const result = await authService.getCurrentUser(user);

  return res.status(200).json({
    message: "user profile retrieved successfully",
    data: {
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
      },
    },
  });
};

/**
 * Log out the currently authenticated user.
 *
 * @method      POST
 * @route       /api/v1/auth/logout
 * @access      Private
 * @middleware  authenticate - verifies access token and attaches user data to req.user
 *
 * @param {Request} req - Express request object containing authenticated user information.
 * @param {Response} res - Express response object.
 *
 * @remarks
 * Requirements:
 * - Valid access token must be provided in the Authorization header.
 *
 * Header:
 * - Authorization: Bearer <access_token>
 *
 * Side Effects:
 * - Removes the stored refresh token from the database.
 * - Clears the refresh token cookie from the client.
 * - Invalidates the current refresh token session.
 *
 * @returns {Promise<void>} Successfully logs out the user and clears authentication data.
 *
 * @response 200 Logout successful.
 * @response 401 Authentication required or invalid access token.
 * @response 403 Access denied.
 * @response 500 Internal server error.
 *
 * @throws {ApiError} Thrown when authentication fails or an unexpected server error occurs.
 */

const logout: RequestHandler = async (req, res) => {
  const userId = req.user as string;

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  await authService.logout(userId, token);

  return res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({
      message: "User logout successful",
    });
};

export default { register, login, refreshToken, getCurrentUser, logout };
