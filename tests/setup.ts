import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto"

process.env.DATABASE_URL = "postgresql://postgres@localhost:5432/veltrik_test"
process.env.NEXTAUTH_SECRET = "test-secret-brutal-" + randomUUID()
process.env.NEXTAUTH_URL = "http://localhost:3000"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
process.env.GOOGLE_CLIENT_ID = "test"
process.env.GOOGLE_CLIENT_SECRET = "test"
process.env.RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxx"
process.env.RAZORPAY_KEY_SECRET = "test_secret"
process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test"

export const prisma = new PrismaClient()

const TABLES = [
  "messages", "conversations", "wishlists", "activity_logs",
  "payments", "bookings", "buyer_leads", "listings",
  "inspections", "seller_leads", "users",
]

beforeEach(async () => {
  for (const t of TABLES) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${t}"`)
  }
})

afterAll(async () => {
  await prisma.$disconnect()
})
