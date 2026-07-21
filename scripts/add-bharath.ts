import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("inspector123", 10);

  await prisma.user.upsert({
    where: { email: "bharathsamera@gmail.com" },
    update: { password: password, role: "INSPECTOR" },
    create: {
      email: "bharathsamera@gmail.com",
      name: "Bharath",
      password: password,
      role: "INSPECTOR",
    },
  });

  console.log("User bharathsamera@gmail.com created/updated as INSPECTOR.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
