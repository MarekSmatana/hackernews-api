import jwt from "jsonwebtoken"

export const SALT_LENGTH = 10
export const APP_SECRET = "MyLiiitSecret"

export interface AuthTokenPayload {
  userId: number
}

export function decodeAuthHeader(authHeader: string): AuthTokenPayload {
  const token = authHeader.replace("Bearer ", "")

  if (!token) {
    throw new Error("No token found.")
  }

  return jwt.verify(token, APP_SECRET) as AuthTokenPayload
}
