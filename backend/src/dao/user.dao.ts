import { prisma } from "../config/database.js";

// User input interface for type safety
interface CreateUserInput {
  name: string;
  email: string;
}

class UserDAO {
  // Find a unique user by ID
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  // Find a unique user by email
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Create a new user record
  async createUser(input: CreateUserInput, passwordHash: string) {
    return prisma.user.create({
      data: {
        ...input,
        passwordHash,
      },
    });
  }

  // Update a user's refresh token
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}

// Export as a singleton instance
export default new UserDAO();
