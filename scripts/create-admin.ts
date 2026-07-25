import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@veltrik.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Demo Admin",
      email: "admin@veltrik.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  console.log("Created Admin user:", admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
