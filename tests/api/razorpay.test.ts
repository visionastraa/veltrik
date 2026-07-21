import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { prisma } from "../setup"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createBooking, createPayment } from "../helpers/factories"
import crypto from "crypto"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

vi.mock("razorpay", () => {
  const MockRazorpay = vi.fn(function MockRazorpay() {
    return {
      orders: { create: vi.fn((opts: any) => Promise.resolve({ id: `order_mock_${Date.now()}`, amount: opts.amount, currency: opts.currency, receipt: opts.receipt })) },
    }
  })
  return { default: MockRazorpay }
})

function gp(userId: string, role: string) {
  vi.mocked(getServerSession).mockImplementation(() =>
    Promise.resolve({ user: { id: userId, role } })
  )
}

let buyerUser: any, booking: any

beforeEach(async () => {
  buyerUser = await createUser({ role: "BUYER", email: "razor-buyer@test.com" })
  booking = await createBooking({ userId: buyerUser.id })
})

describe("Razorpay API", () => {
  describe("POST /api/razorpay/create-order", () => {
    it("creates a Razorpay order and Payment record", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/razorpay/create-order/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/create-order", body: { bookingId: booking.id, amount: 150000 } })
      const res = await POST(req)
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.orderId).toContain("order_mock_")
      expect(data.amount).toBe(150000)
    })

    it("rejects invalid amount", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/razorpay/create-order/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/create-order", body: { bookingId: booking.id, amount: 0 } })
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })

    it("rejects missing bookingId", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/razorpay/create-order/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/create-order", body: { amount: 150000 } })
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })
  })

  describe("POST /api/razorpay/verify", () => {
    it("verifies payment with valid signature", async () => {
      await createPayment({ userId: buyerUser.id, razorpayOrderId: "order_test_verify", amount: 100000, status: "created" })
      const secret = "test_secret"
      const razorpayPaymentId = "pay_test_123456"
      const expectedSig = crypto.createHmac("sha256", secret).update(`order_test_verify|${razorpayPaymentId}`).digest("hex")
      gp(buyerUser.id, "BUYER")

      const { POST } = await import("@/app/api/razorpay/verify/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/verify", body: { razorpayOrderId: "order_test_verify", razorpayPaymentId, razorpaySignature: expectedSig } })
      const res = await POST(req)
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.payment.status).toBe("paid")
    })

    it("rejects invalid payment signature", async () => {
      await createPayment({ userId: buyerUser.id, razorpayOrderId: "order_test_bad", amount: 100000, status: "created" })
      gp(buyerUser.id, "BUYER")

      const { POST } = await import("@/app/api/razorpay/verify/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/verify", body: { razorpayOrderId: "order_test_bad", razorpayPaymentId: "pay_bad", razorpaySignature: "a".repeat(64) } })
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })

    it("rejects missing payment fields", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/razorpay/verify/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/verify", body: { razorpayOrderId: "order_1" } })
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })
  })

  describe("POST /api/razorpay/webhook", () => {
    it("processes payment.captured event", async () => {
      await createPayment({ userId: buyerUser.id, razorpayOrderId: "order_wh_1", amount: 50000, status: "created", bookingId: booking.id })
      const payload = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_wh_123", order_id: "order_wh_1" } } } })
      const webhookSecret = "whsec_test"
      const signature = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex")

      const { POST } = await import("@/app/api/razorpay/webhook/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/webhook", headers: { "x-razorpay-signature": signature } })
      const textSpy = vi.spyOn(req, "text").mockResolvedValue(payload)
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(200)

      const updated = await prisma.payment.findUnique({ where: { razorpayOrderId: "order_wh_1" } })
      expect(updated?.status).toBe("paid")
      textSpy.mockRestore()
    })

    it("processes payment.failed event", async () => {
      await createPayment({ userId: buyerUser.id, razorpayOrderId: "order_wh_fail", amount: 50000, status: "created" })
      const payload = JSON.stringify({ event: "payment.failed", payload: { payment: { entity: { id: "pay_wh_fail", order_id: "order_wh_fail" } } } })
      const signature = crypto.createHmac("sha256", "whsec_test").update(payload).digest("hex")

      const { POST } = await import("@/app/api/razorpay/webhook/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/webhook", headers: { "x-razorpay-signature": signature } })
      const textSpy = vi.spyOn(req, "text").mockResolvedValue(payload)
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(200)

      const payments = await prisma.payment.findMany({ where: { razorpayOrderId: "order_wh_fail" } })
      for (const p of payments) expect(p.status).toBe("failed")
      textSpy.mockRestore()
    })

    it("rejects invalid webhook signature", async () => {
      const { POST } = await import("@/app/api/razorpay/webhook/route")
      const req = createNextReq({ method: "POST", path: "/api/razorpay/webhook", headers: { "x-razorpay-signature": "a".repeat(64) } })
      const textSpy = vi.spyOn(req, "text").mockResolvedValue('{"event":"payment.captured"}')
      const res = await POST(req)
      const { status } = await parseResponse(res)
      textSpy.mockRestore()
      expect(status).toBe(400)
    })
  })
})
