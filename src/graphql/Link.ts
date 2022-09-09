import { Prisma } from "@prisma/client"
import {
  arg,
  enumType,
  extendType,
  idArg,
  inputObjectType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus"

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
})

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort })
    t.field("url", { type: Sort })
    t.field("createdAt", { type: Sort })
  },
})

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.string("description")
    t.nonNull.string("url")
    t.nonNull.dateTime("createdAt")
    t.field("postedBy", {
      type: "User",
      resolve(parent, _, context) {
        return context.prisma.link
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .postedBy()
      },
    })
    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve({ id }, _, { prisma }) {
        return prisma.link.findUnique({ where: { id } }).voters()
      },
    })
  },
})

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link })
    t.nonNull.int("count")
    t.id("id")
  },
})

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
      },
      async resolve(_, { filter, skip, take, orderBy }, context) {
        const where = filter
          ? {
              OR: [
                {
                  description: { contains: filter },
                },
                {
                  url: { contains: filter },
                },
              ],
            }
          : {}

        const links = await context.prisma.link.findMany({
          where,
          skip: skip ?? undefined,
          take: take ?? undefined,
          orderBy:
            (orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>) ??
            undefined,
        })
        const count = await context.prisma.link.count({ where })
        const id = `main-feed:${JSON.stringify({
          filter,
          skip,
          take,
          orderBy,
        })}`

        return {
          id,
          links,
          count,
        }
      },
    })
    t.nullable.field("link", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve(_, { id }, context) {
        return context.prisma.link.findFirst({ where: { id: Number(id) } })
      },
    })
  },
})

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve(_, { description, url }, { prisma, userId }) {
        if (!userId) {
          throw new Error("Cannot post without logging in.")
        }

        const newLink = prisma.link.create({
          data: {
            url,
            description,
            postedBy: {
              connect: {
                id: userId,
              },
            },
          },
        })

        return newLink
      },
    })
    t.nullable.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
        url: stringArg(),
        description: stringArg(),
      },
      resolve(_, { id, url, description }, context) {
        const updatedLink = context.prisma.link.update({
          data: {
            url: url ?? undefined,
            description: description ?? undefined,
          },
          where: {
            id: Number(id),
          },
        })

        return updatedLink
      },
    })
    t.nullable.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve(_, { id }, context) {
        const deletedLink = context.prisma.link.delete({
          where: { id: Number(id) },
        })

        return deletedLink
      },
    })
  },
})
