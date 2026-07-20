import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createListing, createBuyerLead } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))
vi.mock("@/lib/mailer", () => ({
  sendEmail: vi.fn(() => Promise.resolve({ success: true })),
  buildWelcomeEmail: vi.fn(() => ""),
  buildBookingConfirmationEmail: vi.fn(() => "<html>Confirmed</html>"),
  buildPaymentReceiptEmail: vi.fn(() => ""),
}))

function gp(userId: string, role: string) {
  vi.mocked(getServerSession).mockImplementation(() =>
    Promise.resolve({ user: { id: userId, role } })
  )
}

let buyerUser: any, listing: any, buyerLead: any

beforeEach(async () => {
  buyerUser = await createUser({ role: "BUYER", email: "booking-buyer@test.com" })
  listing = await createListing({ status: "AVAILABLE" })
  buyerLead = await createBuyerLead({ userId: buyerUser.id, listingId: listing.id })
})

describe("POST /api/buyer/book", () => {
  it("creates a booking and marks listing as RESERVED", async () => {
    gp(buyerUser.id, "BUYER")
    const { POST } = await import("@/app/api/buyer/book/route")
    const req = createNextReq({ method: "POST", path: "/api/buyer/book", body: { listingId: listing.id, buyerLeadId: buyerLead.id, scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString() } })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.booking.status).toBe("confirmed")
    const updatedListing = await (await import("../setup")).prisma.listing.findUnique({ where: { id: listing.id } })
    expect(updatedListing?.status).toBe("RESERVED")
  })

  it("rejects booking on already RESERVED listing", async () => {
    await (await import("../setup")).prisma.listing.update({ where: { id: listing.id }, data: { status: "RESERVED" } })
    gp(buyerUser.id, "BUYER")
    const { POST } = await import("@/app/api/buyer/book/route")
    const req = createNextReq({ method: "POST", path: "/api/buyer/book", body: { listingId: listing.id, buyerLeadId: buyerLead.id, scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString() } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(409)
  })

  it("rejects booking on SOLD listing", async () => {
    await (await import("../setup")).prisma.listing.update({ where: { id: listing.id }, data: { status: "SOLD" } })
    gp(buyerUser.id, "BUYER")
    const { POST } = await import("@/app/api/buyer/book/route")
    const req = createNextReq({ method: "POST", path: "/api/buyer/book", body: { listingId: listing.id, buyerLeadId: buyerLead.id, scheduledAt: new Date().toISOString() } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(409)
  })

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const { POST } = await import("@/app/api/buyer/book/route")
    const req = createNextReq({ method: "POST", path: "/api/buyer/book", body: { listingId: listing.id, buyerLeadId: buyerLead.id, scheduledAt: new Date().toISOString() } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it("rejects invalid listing ID", async () => {
    gp(buyerUser.id, "BUYER")
    const { POST } = await import("@/app/api/buyer/book/route")
    const req = createNextReq({ method: "POST", path: "/api/buyer/book", body: { listingId: "nonexistent", buyerLeadId: buyerLead.id, scheduledAt: new Date().toISOString() } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(409)
  })
})
