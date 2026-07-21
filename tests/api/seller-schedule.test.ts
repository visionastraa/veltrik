import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { prisma } from "../setup"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createSellerLead } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(userId: string) {
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: userId, role: "SELLER", name: "", email: "" } })
}

describe("POST /api/seller/schedule", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const { POST } = await import("@/app/api/seller/schedule/route")
    const req = createNextReq({ method: "POST", path: "/api/seller/schedule", body: {} })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it("requires sellerLeadId and scheduledAt", async () => {
    const user = await createUser()
    gp(user.id)
    const { POST } = await import("@/app/api/seller/schedule/route")
    const req = createNextReq({ method: "POST", path: "/api/seller/schedule", body: {} })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it("blocks Sunday scheduling", async () => {
    const user = await createUser()
    gp(user.id)
    const lead = await createSellerLead()
    const sunday = new Date("2026-07-19T11:00:00") // July 19 2026 is a Sunday
    const { POST } = await import("@/app/api/seller/schedule/route")
    const req = createNextReq({ method: "POST", path: "/api/seller/schedule", body: { sellerLeadId: lead.id, scheduledAt: sunday.toISOString() } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it("blocks scheduling outside operating hours", async () => {
    const user = await createUser()
    gp(user.id)
    const lead = await createSellerLead()
    const afterHours = new Date("2026-07-22T19:00:00")
    const { POST } = await import("@/app/api/seller/schedule/route")
    const req = createNextReq({ method: "POST", path: "/api/seller/schedule", body: { sellerLeadId: lead.id, scheduledAt: afterHours.toISOString() } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it("blocks scheduling before 10:00 AM", async () => {
    const user = await createUser()
    gp(user.id)
    const lead = await createSellerLead()
    const early = new Date("2026-07-22T08:00:00")
    const { POST } = await import("@/app/api/seller/schedule/route")
    const req = createNextReq({ method: "POST", path: "/api/seller/schedule", body: { sellerLeadId: lead.id, scheduledAt: early.toISOString() } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it("creates a valid schedule", async () => {
    const user = await createUser()
    gp(user.id)
    const lead = await createSellerLead()
    const validDate = new Date("2026-07-22T14:00:00")
    const { POST } = await import("@/app/api/seller/schedule/route")
    const req = createNextReq({ method: "POST", path: "/api/seller/schedule", body: { sellerLeadId: lead.id, scheduledAt: validDate.toISOString() } })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    const updated = await prisma.sellerLead.findUnique({ where: { id: lead.id } })
    expect(updated?.status).toBe("SCHEDULED")
  })
})
