import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createListing, createPayment, createSellerLead } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn(), default: {} }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(userId: string, role: string) {
  vi.mocked(getServerSession).mockImplementation(() =>
    Promise.resolve({ user: { id: userId, role } })
  )
}

let adminUser: any

beforeEach(async () => {
  adminUser = await createUser({ role: "ADMIN", email: "admin-stats@test.com" })
})

describe("Admin Stats API", () => {
  describe("GET /api/admin/stats", () => {
    it("returns stats for admin users", async () => {
      await createListing({ price: 200000 })
      await createPayment({ userId: adminUser.id, amount: 50000, status: "paid" })
      gp(adminUser.id, "ADMIN")

      const { GET } = await import("@/app/api/admin/stats/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.totalListings).toBe(1)
      expect(data.totalLeads).toBe(1)
      expect(data.totalRevenue).toBe(50000)
    })

    it("rejects non-admin users", async () => {
      const buyer = await createUser({ role: "BUYER", email: "buyer-stats@test.com" })
      gp(buyer.id, "BUYER")

      const { GET } = await import("@/app/api/admin/stats/route")
      const res = await GET()
      const { status } = await parseResponse(res)
      expect(status).toBe(403)
    })

    it("rejects unauthenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      const { GET } = await import("@/app/api/admin/stats/route")
      const res = await GET()
      const { status } = await parseResponse(res)
      expect(status).toBe(403)
    })
  })
})
