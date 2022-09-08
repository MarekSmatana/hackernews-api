import { PrismaClient } from "@prisma/client"

const prismaClient = new PrismaClient()

async function main() {
  const newLink = await prismaClient.link.create({
    data: {
      description: "Liiiiit",
      url: "dubai.lit",
    },
  })
  const allLinks = await prismaClient.link.findMany()
  console.log("allLinks", allLinks)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prismaClient.$disconnect()
  })
