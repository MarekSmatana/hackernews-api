import { extendType, nonNull, objectType, stringArg } from "nexus"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { APP_SECRET, SALT_LENGTH } from "../utils/auth"

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token")
    t.nonNull.field("user", {
      type: "User",
    })
  },
})

export const AuthMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("signUp", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        name: nonNull(stringArg()),
      },
      async resolve(_, { email, name, password: plainTextPassword }, context) {
        const password = await bcrypt.hash(plainTextPassword, SALT_LENGTH)
        const user = await context.prisma.user.create({
          data: {
            name,
            email,
            password,
          },
        })
        const token = jwt.sign(
          {
            userId: user.id,
          },
          APP_SECRET
        )

        return {
          token,
          user,
        }
      },
    })
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_, { email, password: plainTextPassword }, context) {
        const user = await context.prisma.user.findUnique({
          where: { email: email },
        })
        if (!user) {
          throw new Error("User not found.")
        }

        const isPasswordValid = await bcrypt.compare(
          plainTextPassword,
          user.password
        )
        if (!isPasswordValid) {
          throw new Error("Invalid password.")
        }

        const token = jwt.sign({ userId: user.id }, APP_SECRET)
        return {
          user,
          token,
        }
      },
    })
  },
})
