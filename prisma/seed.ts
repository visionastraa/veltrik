import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Load environment variables relative to this script's directory
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

async function main() {
  // Dynamically import prisma so that environment variables are already loaded
  const { prisma } = await import("../lib/prisma");

  const passwordHash = await bcrypt.hash("password123", 10);

  const inspectors = [
    {
      name: "Inspector Alice",
      email: "alice@veltrik.com",
      password: passwordHash,
      role: "INSPECTOR" as const,
    },
    {
      name: "Inspector Bob",
      email: "bob@veltrik.com",
      password: passwordHash,
      role: "INSPECTOR" as const,
    },
    {
      name: "Inspector Charlie",
      email: "charlie@veltrik.com",
      password: passwordHash,
      role: "INSPECTOR" as const,
    },
  ];

  console.log("Seeding test inspectors...");

  for (const inspector of inspectors) {
    const user = await prisma.user.upsert({
      where: { email: inspector.email },
      update: {
        password: passwordHash,
        role: "INSPECTOR",
      },
      create: inspector,
    });
    console.log(`Created/Ensured inspector: ${user.name} (${user.email})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });