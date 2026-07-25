import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("inspector123", 12)
  const inspector = await prisma.user.update({
    where: { email: "inspector@veltrik.com" },
    data: { password: hashedPassword }
  })
  console.log("Updated Inspector password for:", inspector.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
