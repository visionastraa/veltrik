import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { createNextReq, parseResponse, expectPaginated } from "../helpers/next-request"
import { createUser, createSellerLead, createBuyerLead } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(userId: string, role = "ADMIN") {
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: userId, role, name: "", email: "" } })
}

function unauth() {
  vi.mocked(getServerSession).mockResolvedValue(null)
}

describe("Admin Leads API", () => {
  let adminUser: any
  beforeEach(async () => {
    adminUser = await createUser({ role: "ADMIN", email: `admin-leads-${Date.now()}@test.com` })
  })

  describe("GET /api/admin/leads/seller", () => {
    it("returns paginated seller leads", async () => {
      await createSellerLead({ make: "Ola" })
      await createSellerLead({ make: "Ather" })
      gp(adminUser.id)
      const { GET } = await import("@/app/api/admin/leads/seller/route")
      const req = createNextReq({ method: "GET", path: "/api/admin/leads/seller" })
      const res = await GET(req)
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expectPaginated(data)
      expect(data.data.length).toBe(2)
    })

    it("filters by status", async () => {
      await createSellerLead({ make: "Ola", status: "SUBMITTED" })
      await createSellerLead({ make: "Ather", status: "SCHEDULED" })
      gp(adminUser.id)
      const { GET } = await import("@/app/api/admin/leads/seller/route")
      const req = createNextReq({ method: "GET", path: "/api/admin/leads/seller?status=SCHEDULED" })
      const res = await GET(req)
      const { data } = await parseResponse(res)
      expect(data.data.length).toBe(1)
      expect(data.data[0].status).toBe("SCHEDULED")
    })

    it("rejects non-admin users", async () => {
      const buyer = await createUser({ role: "BUYER" })
      gp(buyer.id, "BUYER")
      const { GET } = await import("@/app/api/admin/leads/seller/route")
      const req = createNextReq({ method: "GET", path: "/api/admin/leads/seller" })
      const res = await GET(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(403)
    })
  })

  describe("GET /api/admin/leads/buyer", () => {
    it("returns paginated buyer leads", async () => {
      await createBuyerLead()
      await createBuyerLead()
      gp(adminUser.id)
      const { GET } = await import("@/app/api/admin/leads/buyer/route")
      const req = createNextReq({ method: "GET", path: "/api/admin/leads/buyer" })
      const res = await GET(req)
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expectPaginated(data)
      expect(data.data.length).toBe(2)
    })

    it("filters by status", async () => {
      await createBuyerLead({ status: "LEAD_VISIT_SCHEDULED" })
      await createBuyerLead({ status: "FOLLOW_UP_REQUIRED" })
      gp(adminUser.id)
      const { GET } = await import("@/app/api/admin/leads/buyer/route")
      const req = createNextReq({ method: "GET", path: "/api/admin/leads/buyer?status=FOLLOW_UP_REQUIRED" })
      const res = await GET(req)
      const { data } = await parseResponse(res)
      expect(data.data.length).toBe(1)
      expect(data.data[0].status).toBe("FOLLOW_UP_REQUIRED")
    })
  })
})
