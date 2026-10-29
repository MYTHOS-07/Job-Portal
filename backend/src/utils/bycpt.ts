import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const hashRefreshToken = async (refreshToken: string) => {
  return await bcrypt.hash(refreshToken, 10);
};

export const compareHash = async (word: string, wordHashed: string) => {
  return await bcrypt.compare(word, wordHashed);
};
