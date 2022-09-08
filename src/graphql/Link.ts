import {
  extendType,
  idArg,
  nonNull,
  nullable,
  objectType,
  stringArg,
} from "nexus"
import { NexusGenObjects } from "../../nexus-typegen"

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.string("description")
    t.nonNull.string("url")
  },
})

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return context.prisma.link.findMany()
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
      resolve(_, { description, url }, context) {
        const newLink = context.prisma.link.create({
          data: {
            url,
            description,
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
