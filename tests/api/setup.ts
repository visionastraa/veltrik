import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "../setup"
import { createUser, createListing, createSellerLead, createInspection, createBuyerLead } from "../helpers/factories"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: "test-admin-id", role: "ADMIN", name: "Admin", email: "admin@test.com" },
  })),
  default: {},
}))

vi.mock("@/lib/socket-emitter", () => ({
  emitToUser: vi.fn(),
  emitToListing: vi.fn(),
  emitToConversation: vi.fn(),
}))

vi.mock("@/lib/mailer", () => ({
  sendEmail: vi.fn(() => Promise.resolve({ success: true })),
  buildWelcomeEmail: vi.fn((name: string) => `<html>Welcome ${name}</html>`),
  buildBookingConfirmationEmail: vi.fn((name: string, vehicle: string, date: string) =>
    `<html>Confirmed ${name} ${vehicle} ${date}</html>`),
  buildPaymentReceiptEmail: vi.fn((name: string, amount: number, orderId: string) =>
    `<html>Receipt ${name} ${amount} ${orderId}</html>`),
}))

vi.mock("next-auth/providers/credentials", () => ({ default: vi.fn() }))
vi.mock("next-auth/providers/google", () => ({ default: vi.fn() }))

let adminUser: any, buyerUser: any, sellerUser: any, inspectorUser: any

beforeEach(async () => {
  adminUser = await createUser({ role: "ADMIN", email: "admin@test.com" })
  buyerUser = await createUser({ role: "BUYER", email: "buyer@test.com" })
  sellerUser = await createUser({ role: "SELLER", email: "seller@test.com" })
  inspectorUser = await createUser({ role: "INSPECTOR", email: "inspector@test.com" })
})

export function setMockSession(user: any) {
  const nextAuth = require("next-auth")
  nextAuth.getServerSession = vi.fn(() => Promise.resolve({
    user: { id: user.id, role: user.role, name: user.name, email: user.email },
  }))
}

export { adminUser, buyerUser, sellerUser, inspectorUser }
