import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

async function main() {
  const { prisma } = await import("../lib/prisma");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Seed Inspectors
  console.log("Seeding test inspectors...");
  const inspectorEmails = ["alice@veltrik.com", "bob@veltrik.com", "charlie@veltrik.com"];
  const inspectors = [];

  for (const email of inspectorEmails) {
    const name = `Inspector ${email.split("@")[0].toUpperCase()}`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: passwordHash,
        role: "INSPECTOR",
      },
      create: {
        name,
        email,
        password: passwordHash,
        role: "INSPECTOR",
      },
    });
    inspectors.push(user);
    console.log(`Created/Ensured inspector: ${user.name} (${user.email})`);
  }

  // 2. Seed a Seller User
  console.log("Seeding seller user...");
  const seller = await prisma.user.upsert({
    where: { email: "seller@veltrik.com" },
    update: {
      role: "SELLER",
    },
    create: {
      name: "Ramesh Kumar",
      email: "seller@veltrik.com",
      phone: "9876543210",
      password: passwordHash,
      role: "SELLER",
    },
  });

  // 3. Seed SellerLeads & Bookings for Today
  console.log("Seeding leads and bookings...");
  const today = new Date();
  
  const leadData = [
    { brand: "Ola", model: "S1 Pro Gen 2", year: 2023, askingPrice: 120000, hour: 10, minute: 0 },
    { brand: "Ather", model: "450X", year: 2022, askingPrice: 110000, hour: 12, minute: 30 },
    { brand: "TVS", model: "iQube S", year: 2023, askingPrice: 95000, hour: 15, minute: 0 },
  ];

  for (const data of leadData) {
    // Create SellerLead
    const lead = await prisma.sellerLead.create({
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year,
        askingPrice: data.askingPrice,
        status: "SCHEDULED",
        photos: "[]",
        sellerId: seller.id,
      },
    });

    const scheduledAt = new Date(today);
    scheduledAt.setHours(data.hour, data.minute, 0, 0);

    // Create Booking
    await prisma.booking.create({
      data: {
        type: "SELLER_INSPECTION",
        scheduledAt,
        status: "confirmed",
        userId: seller.id,
        sellerLeadId: lead.id,
      },
    });

    console.log(`Created ${data.brand} ${data.model} booking at ${data.hour}:${data.minute === 0 ? "00" : data.minute}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });