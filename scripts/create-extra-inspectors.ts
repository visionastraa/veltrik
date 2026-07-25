import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("inspector123", 12)

  const inspector2 = await prisma.user.upsert({
    where: { email: "mike.inspector@veltrik.com" },
    update: {},
    create: {
      name: "Mike (Inspector)",
      email: "mike.inspector@veltrik.com",
      password: password,
      role: "INSPECTOR",
    },
  })
  
  const inspector3 = await prisma.user.upsert({
    where: { email: "sarah.inspector@veltrik.com" },
    update: {},
    create: {
      name: "Sarah (Inspector)",
      email: "sarah.inspector@veltrik.com",
      password: password,
      role: "INSPECTOR",
    },
  })

  console.log("Created Inspectors:");
  console.log(inspector2.name, inspector2.email);
  console.log(inspector3.name, inspector3.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
