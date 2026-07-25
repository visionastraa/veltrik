import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "inspector@veltrik.com" }
  })
  console.log("Inspector exists?", !!user)
}
main().finally(() => prisma.$disconnect())
