import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createListing } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(userId: string, role: string) {
  vi.mocked(getServerSession).mockImplementation(() =>
    Promise.resolve({ user: { id: userId, role } })
  )
}

let buyerUser: any, listing1: any, listing2: any

beforeEach(async () => {
  buyerUser = await createUser({ role: "BUYER", email: "wl-buyer@test.com" })
  listing1 = await createListing({ price: 100000 })
  listing2 = await createListing({ price: 200000 })
})

describe("Wishlist API", () => {
  describe("GET /api/user/wishlist", () => {
    it("returns empty wishlist for user with no favorites", async () => {
      gp(buyerUser.id, "BUYER")
      const { GET } = await import("@/app/api/user/wishlist/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data).toEqual([])
    })

    it("returns wishlist items for user", async () => {
      const { prisma } = await import("../setup")
      await prisma.wishlist.create({ data: { userId: buyerUser.id, listingId: listing1.id } })
      await prisma.wishlist.create({ data: { userId: buyerUser.id, listingId: listing2.id } })
      gp(buyerUser.id, "BUYER")

      const { GET } = await import("@/app/api/user/wishlist/route")
      const res = await GET()
      const { data } = await parseResponse(res)
      expect(data.data.length).toBe(2)
    })

    it("rejects unauthenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      const { GET } = await import("@/app/api/user/wishlist/route")
      const res = await GET()
      const { status } = await parseResponse(res)
      expect(status).toBe(401)
    })
  })

  describe("POST /api/user/wishlist (toggle)", () => {
    it("adds item to wishlist", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/user/wishlist/route")
      const req = createNextReq({ method: "POST", path: "/api/user/wishlist", body: { vehicleId: listing1.id } })
      const res = await POST(req)
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.wishlisted).toBe(true)
    })

    it("removes item from wishlist on second toggle", async () => {
      const { prisma } = await import("../setup")
      await prisma.wishlist.create({ data: { userId: buyerUser.id, listingId: listing1.id } })
      gp(buyerUser.id, "BUYER")

      const { POST } = await import("@/app/api/user/wishlist/route")
      const req = createNextReq({ method: "POST", path: "/api/user/wishlist", body: { vehicleId: listing1.id } })
      const res = await POST(req)
      const { data } = await parseResponse(res)
      expect(data.wishlisted).toBe(false)
    })

    it("enforces unique constraint (toggle off after add)", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/user/wishlist/route")
      const req1 = createNextReq({ method: "POST", path: "/api/user/wishlist", body: { vehicleId: listing1.id } })
      await POST(req1)
      const req2 = createNextReq({ method: "POST", path: "/api/user/wishlist", body: { vehicleId: listing1.id } })
      const res2 = await POST(req2)
      const { data } = await parseResponse(res2)
      expect(data.wishlisted).toBe(false)
    })
  })
})
