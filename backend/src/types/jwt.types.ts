export interface JwtPayload {
  userId: string;
  jti: string;
  exp: number;
  iat: number;
}