import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("Wiping all existing database data...")
  
  // Wipe everything
  await prisma.notificationLog.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.buyerLead.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.inspection.deleteMany()
  await prisma.sellerLead.deleteMany()
  await prisma.user.deleteMany()

  console.log("Database wiped clean.\n")
  console.log("Seeding base users...")

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.create({
    data: { name: "Admin Setup", email: "admin@veltrik.com", password: adminPassword, role: "ADMIN" },
  })

  const sellerPassword = await bcrypt.hash("seller123", 12)
  const seller = await prisma.user.create({
    data: { name: "Demo Seller", email: "seller@veltrik.com", password: sellerPassword, role: "SELLER" },
  })

  const buyerPassword = await bcrypt.hash("buyer123", 12)
  const buyer = await prisma.user.create({
    data: { name: "Demo Buyer", email: "buyer@veltrik.com", password: buyerPassword, role: "BUYER" },
  })

  const inspectorPassword = await bcrypt.hash("inspector123", 12)
  const inspector = await prisma.user.create({
    data: { name: "Demo Inspector", email: "inspector@veltrik.com", password: inspectorPassword, role: "INSPECTOR" },
  })

  console.log("Created: Admin, Seller, Buyer, Inspector\n")
  console.log("Seeding EV Scooters...")

  // Define scooters with placeholder local image paths
  const scooters = [
    { 
      make: "Ather", model: "450X", variant: "Pro", year: 2023, kmDriven: 8500, 
      expectedPrice: 120000, finalOffer: 115000, batteryHealth: 98, batteryCharge: 80, batteryVoltage: 50,
      description: "Excellent condition Ather 450X. Warp mode works perfectly.",
      image: "ather.jpg"
    },
    { 
      make: "Ola", model: "S1 Pro", variant: "Gen 2", year: 2024, kmDriven: 3200, 
      expectedPrice: 135000, finalOffer: 130000, batteryHealth: 99, batteryCharge: 95, batteryVoltage: 54,
      description: "Almost new Ola S1 Pro Gen 2. Hyper mode is insanely fast.",
      image: "ola.jpg"
    },
    { 
      make: "TVS", model: "iQube", variant: "S", year: 2022, kmDriven: 14000, 
      expectedPrice: 95000, finalOffer: 90000, batteryHealth: 92, batteryCharge: 75, batteryVoltage: 48,
      description: "Reliable family EV scooter. Great storage and comfortable ride.",
      image: "tvs.jpg"
    },
    { 
      make: "Bajaj", model: "Chetak", variant: "Premium", year: 2023, kmDriven: 6000, 
      expectedPrice: 110000, finalOffer: 105000, batteryHealth: 96, batteryCharge: 88, batteryVoltage: 48,
      description: "Classic design, solid metal body. Very premium feel.",
      image: "bajaj.jpg"
    },
    { 
      make: "Hero Electric", model: "Optima", variant: "CX", year: 2022, kmDriven: 18000, 
      expectedPrice: 55000, finalOffer: 50000, batteryHealth: 88, batteryCharge: 100, batteryVoltage: 48,
      description: "Budget friendly daily commuter. Lightweight and easy to handle.",
      image: "hero.jpg"
    }
  ]

  for (const s of scooters) {
    // Check if the image exists, otherwise fallback to placeholder
    const imagePath = `/uploads/${s.image}`;
    const fullPath = path.join(process.cwd(), 'public', 'uploads', s.image);
    const photos = fs.existsSync(fullPath) ? [imagePath] : [`/api/placeholder/800/600?text=${encodeURIComponent(s.make + ' ' + s.model)}`];

    // Create SellerLead
    const lead = await prisma.sellerLead.create({
      data: {
        userId: seller.id,
        make: s.make,
        model: s.model,
        variant: s.variant,
        vehicleNumber: `MH02EV${Math.floor(1000 + Math.random() * 9000)}`,
        year: s.year,
        kmDriven: s.kmDriven,
        expectedPrice: s.expectedPrice,
        description: s.description,
        warrantyStatus: "Active",
        photos: JSON.stringify(photos),
        status: "ACQUIRED",
      },
    })

    // Create Inspection
    const inspection = await prisma.inspection.create({
      data: {
        sellerLeadId: lead.id,
        inspectorId: inspector.id,
        ageYears: new Date().getFullYear() - s.year,
        ageMonths: Math.floor(Math.random() * 12),
        kmDriven: s.kmDriven,
        batteryHealth: s.batteryHealth,
        batteryCharge: s.batteryCharge,
        batteryVoltage: s.batteryVoltage,
        bodyDamage: "None",
        accidentHistory: "None",
        warrantyStatus: "Active",
        testDriveRating: 9,
        testDriveNotes: `Test drive smooth. No abnormal noises.`,
        finalOffer: s.finalOffer,
        approvedById: admin.id,
        approvedAt: new Date(),
        inspectionComplete: true,
      },
    })

    // Create Listing
    await prisma.listing.create({
      data: {
        inspectionId: inspection.id,
        title: `${s.year} ${s.make} ${s.model} ${s.variant}`,
        price: s.finalOffer,
        photos: JSON.stringify(photos),
        status: "AVAILABLE",
        publishedAt: new Date(),
      },
    })

    console.log(`Listed EV Scooter: ${s.year} ${s.make} ${s.model} - ₹${s.finalOffer.toLocaleString()}`)
  }

  console.log("\nDone! Database is seeded purely with EV Scooters.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
