import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock users...");

  const passwords = {
    admin: await bcrypt.hash("admin123", 10),
    inspector: await bcrypt.hash("inspector123", 10),
    buyer: await bcrypt.hash("buyer123", 10),
  };

  await prisma.user.upsert({
    where: { email: "admin@veltrik.com" },
    update: { password: passwords.admin, role: "ADMIN" },
    create: {
      email: "admin@veltrik.com",
      name: "Admin User",
      password: passwords.admin,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "inspector@veltrik.com" },
    update: { password: passwords.inspector, role: "INSPECTOR" },
    create: {
      email: "inspector@veltrik.com",
      name: "Inspector John",
      password: passwords.inspector,
      role: "INSPECTOR",
    },
  });

  await prisma.user.upsert({
    where: { email: "buyer@veltrik.com" },
    update: { password: passwords.buyer, role: "BUYER" },
    create: {
      email: "buyer@veltrik.com",
      name: "Buyer Bob",
      password: passwords.buyer,
      role: "BUYER",
    },
  });

  console.log("Mock users seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
