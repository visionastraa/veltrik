import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { parseResponse } from "../helpers/next-request"
import { createUser, createSellerLead, createBuyerLead } from "../helpers/factories"

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
      await createSellerLead({ status: "ACQUIRED" })
      await createSellerLead({ status: "SCHEDULED" })
      await createBuyerLead({ listingId: null })
      gp(adminUser.id, "ADMIN")

      const { GET } = await import("@/app/api/admin/stats/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.stats.acquiredThisMonth).toBe(1)
      expect(data.stats.activeListings).toBe(0)
      expect(data.stats.pendingInspections).toBe(1)
      expect(data.stats.buyerLeads).toBe(1)
      expect(data.stats.followUpRequired).toBe(0)
      expect(Array.isArray(data.activity)).toBe(true)
    })

    it("rejects non-admin users", async () => {
      const buyer = await createUser({ role: "BUYER", email: "buyer-stats@test.com" })
      gp(buyer.id, "BUYER")

      const { GET } = await import("@/app/api/admin/stats/route")
      const res = await GET()
      const { status } = await parseResponse(res)
      expect(status).toBe(401)
    })

    it("rejects unauthenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      const { GET } = await import("@/app/api/admin/stats/route")
      const res = await GET()
      const { status } = await parseResponse(res)
      expect(status).toBe(401)
    })
  })
})
