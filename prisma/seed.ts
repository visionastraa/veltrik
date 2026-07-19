import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create a seller user
  const hashedPassword = await bcrypt.hash("seller123", 12)
  const seller = await prisma.user.upsert({
    where: { email: "seller@veltrik.com" },
    update: {},
    create: {
      name: "Demo Seller",
      email: "seller@veltrik.com",
      password: hashedPassword,
      role: "SELLER",
    },
  })
  console.log("Created seller user:", seller.email)

  // Create a buyer user
  const buyerPassword = await bcrypt.hash("buyer123", 12)
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@veltrik.com" },
    update: {},
    create: {
      name: "Demo Buyer",
      email: "buyer@veltrik.com",
      password: buyerPassword,
      role: "BUYER",
    },
  })
  console.log("Created buyer user:", buyer.email)

  // Create an inspector user
  const inspectorPassword = await bcrypt.hash("inspector123", 12)
  const inspector = await prisma.user.upsert({
    where: { email: "inspector@veltrik.com" },
    update: {},
    create: {
      name: "Demo Inspector",
      email: "inspector@veltrik.com",
      password: inspectorPassword,
      role: "INSPECTOR",
    },
  })
  console.log("Created inspector user:", inspector.email)

  // Vehicle data to seed
  const vehicles = [
    { make: "Tesla", model: "Model 3", variant: "Long Range AWD", year: 2023, kmDriven: 12000, expectedPrice: 4200000, batteryHealth: 96, batteryCharge: 85, batteryVoltage: 350, finalOffer: 4150000, testDriveRating: 9, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Excellent condition, single owner, all service records available. FSD enabled." },
    { make: "Tesla", model: "Model Y", variant: "Performance", year: 2023, kmDriven: 8000, expectedPrice: 5500000, batteryHealth: 98, batteryCharge: 90, batteryVoltage: 355, finalOffer: 5400000, testDriveRating: 10, bodyDamage: "Minor scratch on rear bumper", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Brand new feel, acceleration boost included, white interior." },
    { make: "BYD", model: "Atto 3", variant: "Premium", year: 2023, kmDriven: 15000, expectedPrice: 2800000, batteryHealth: 94, batteryCharge: 78, batteryVoltage: 320, finalOffer: 2700000, testDriveRating: 8, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2027", description: "Well maintained, panoramic sunroof, 360 camera." },
    { make: "BYD", model: "Seal", variant: "Design AWD", year: 2024, kmDriven: 5000, expectedPrice: 3800000, batteryHealth: 99, batteryCharge: 92, batteryVoltage: 380, finalOffer: 3750000, testDriveRating: 9, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2029", description: "Almost new, premium sound system, ventilated seats." },
    { make: "Hyundai", model: "Ioniq 5", variant: "Long Range", year: 2022, kmDriven: 22000, expectedPrice: 3200000, batteryHealth: 91, batteryCharge: 72, batteryVoltage: 310, finalOffer: 3100000, testDriveRating: 8, bodyDamage: "None", accidentHistory: "Minor - 2022", warrantyStatus: "Active until 2027", description: "Fast charging capable, V2L feature, heads-up display." },
    { make: "Hyundai", model: "Kona Electric", variant: "Premium", year: 2022, kmDriven: 18000, expectedPrice: 2200000, batteryHealth: 89, batteryCharge: 68, batteryVoltage: 295, finalOffer: 2100000, testDriveRating: 7, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2027", description: "Compact SUV, great city car, wireless charging." },
    { make: "BMW", model: "iX1", variant: "xDrive30", year: 2023, kmDriven: 10000, expectedPrice: 5200000, batteryHealth: 97, batteryCharge: 88, batteryVoltage: 360, finalOffer: 5100000, testDriveRating: 9, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Luxury compact EV, premium leather, Harman Kardon audio." },
    { make: "Tata", model: "Nexon EV", variant: "Max", year: 2023, kmDriven: 20000, expectedPrice: 1800000, batteryHealth: 88, batteryCharge: 75, batteryVoltage: 280, finalOffer: 1700000, testDriveRating: 7, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Best value EV, 400km range, sunroof, ventilated seats." },
    { make: "MG", model: "ZS EV", variant: "Exclusive", year: 2022, kmDriven: 25000, expectedPrice: 2000000, batteryHealth: 86, batteryCharge: 70, batteryVoltage: 290, finalOffer: 1900000, testDriveRating: 7, bodyDamage: "Minor dent on left fender", accidentHistory: "None", warrantyStatus: "Active until 2027", description: "Feature loaded, panoramic roof, ADAS Level 2." },
    { make: "Mercedes", model: "EQA", variant: "300 4MATIC", year: 2023, kmDriven: 8000, expectedPrice: 6500000, batteryHealth: 97, batteryCharge: 82, batteryVoltage: 370, finalOffer: 6300000, testDriveRating: 9, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Premium luxury EV, MBUX system, ambient lighting." },
    { make: "Kia", model: "EV6", variant: "GT Line AWD", year: 2023, kmDriven: 11000, expectedPrice: 4800000, batteryHealth: 95, batteryCharge: 80, batteryVoltage: 345, finalOffer: 4700000, testDriveRating: 9, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Ultra fast charging, sporty design, vehicle-to-load." },
    { make: "Audi", model: "Q4 e-tron", variant: "50 quattro", year: 2023, kmDriven: 9000, expectedPrice: 5800000, batteryHealth: 96, batteryCharge: 85, batteryVoltage: 355, finalOffer: 5700000, testDriveRating: 9, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Premium build quality, virtual cockpit, matrix LED." },
    { make: "Tata", model: "Tiago EV", variant: "XZ+ Long Range", year: 2024, kmDriven: 3000, expectedPrice: 1200000, batteryHealth: 99, batteryCharge: 95, batteryVoltage: 260, finalOffer: 1150000, testDriveRating: 8, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2029", description: "Most affordable EV, great for city commute, connected car." },
    { make: "Mahindra", model: "XUV400", variant: "EL", year: 2023, kmDriven: 14000, expectedPrice: 1600000, batteryHealth: 90, batteryCharge: 78, batteryVoltage: 275, finalOffer: 1500000, testDriveRating: 7, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Sporty SUV, fast charging, 375km range." },
    { make: "Volvo", model: "XC40 Recharge", variant: "Twin Motor", year: 2023, kmDriven: 7000, expectedPrice: 5600000, batteryHealth: 97, batteryCharge: 88, batteryVoltage: 365, finalOffer: 5500000, testDriveRating: 9, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2028", description: "Safety first, premium interior, Google built-in." },
    { make: "Tesla", model: "Model 3", variant: "Standard Range Plus", year: 2022, kmDriven: 30000, expectedPrice: 3000000, batteryHealth: 87, batteryCharge: 72, batteryVoltage: 300, finalOffer: 2900000, testDriveRating: 8, bodyDamage: "None", accidentHistory: "None", warrantyStatus: "Active until 2027", description: "Great entry Tesla, autopilot included, low running cost." },
  ]

  for (const v of vehicles) {
    // Create seller lead
    const lead = await prisma.sellerLead.create({
      data: {
        userId: seller.id,
        make: v.make,
        model: v.model,
        variant: v.variant,
        vehicleNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(10 + Math.random() * 90)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(1000 + Math.random() * 9000)}`,
        year: v.year,
        kmDriven: v.kmDriven,
        expectedPrice: v.expectedPrice,
        description: v.description,
        warrantyStatus: v.warrantyStatus,
        photos: [`/api/placeholder/800/600?text=${encodeURIComponent(v.make + " " + v.model)}`],
        status: "ACQUIRED",
      },
    })

    // Create inspection
    const inspection = await prisma.inspection.create({
      data: {
        sellerLeadId: lead.id,
        inspectorId: inspector.id,
        ageYears: new Date().getFullYear() - v.year,
        ageMonths: Math.floor(Math.random() * 12),
        kmDriven: v.kmDriven,
        batteryHealth: v.batteryHealth,
        batteryCharge: v.batteryCharge,
        batteryVoltage: v.batteryVoltage,
        bodyDamage: v.bodyDamage,
        accidentHistory: v.accidentHistory,
        warrantyStatus: v.warrantyStatus,
        testDriveRating: v.testDriveRating,
        testDriveNotes: `Test drive completed. Vehicle performs well.`,
        finalOffer: v.finalOffer,
        approvedById: seller.id,
        approvedAt: new Date(),
      },
    })

    // Create listing
    await prisma.listing.create({
      data: {
        inspectionId: inspection.id,
        title: `${v.year} ${v.make} ${v.model} ${v.variant}`,
        price: v.finalOffer,
        photos: [`/api/placeholder/800/600?text=${encodeURIComponent(v.make + " " + v.model)}`],
        status: "AVAILABLE",
        publishedAt: new Date(),
      },
    })

    console.log(`Seeded: ${v.year} ${v.make} ${v.model} ${v.variant}`)
  }

  console.log(`\nDone! Seeded ${vehicles.length} vehicles.`)
  console.log("\nDemo accounts:")
  console.log("  Admin:     admin@veltrik.com / admin123")
  console.log("  Inspector: inspector@veltrik.com / inspector123")
  console.log("  Buyer:     buyer@veltrik.com / buyer123")
  console.log("  Seller:    seller@veltrik.com / seller123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
