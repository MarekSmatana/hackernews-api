import { PrismaClient } from "@prisma/client"
import { Request } from "express"
import { decodeAuthHeader } from "./utils/auth"

export interface Context {
  prisma: PrismaClient
  userId?: number
}

export const prisma = new PrismaClient()

export const context = ({ req }: { req: Request }): Context => {
  const authPayload =
    req && req.headers.authorization
      ? decodeAuthHeader(req.headers.authorization)
      : null

  return {
    prisma,
    userId: authPayload?.userId,
  }
}
