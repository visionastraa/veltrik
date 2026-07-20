import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createPayment } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(userId: string, role: string) {
  vi.mocked(getServerSession).mockImplementation(() =>
    Promise.resolve({ user: { id: userId, role } })
  )
}

let buyerUser: any

beforeEach(async () => {
  buyerUser = await createUser({ role: "BUYER", email: "orders-buyer@test.com" })
})

describe("Orders API", () => {
  describe("GET /api/user/orders", () => {
    it("returns empty array when no orders", async () => {
      gp(buyerUser.id, "BUYER")
      const { GET } = await import("@/app/api/user/orders/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data).toEqual([])
    })

    it("returns user's payment orders", async () => {
      const p1 = await createPayment({ userId: buyerUser.id, amount: 1000, status: "paid" })
      const p2 = await createPayment({ userId: buyerUser.id, amount: 2000, status: "created" })
      gp(buyerUser.id, "BUYER")

      const { GET } = await import("@/app/api/user/orders/route")
      const res = await GET()
      const { data } = await parseResponse(res)
      expect(data.data.length).toBe(2)
      const ids = data.data.map((p: any) => p.id)
      expect(ids).toContain(p1.id)
      expect(ids).toContain(p2.id)
    })

    it("does not return other users' orders", async () => {
      await createPayment({ userId: buyerUser.id, amount: 5000 })
      const otherUser = await createUser({ role: "BUYER", email: "other-orders@test.com" })
      gp(otherUser.id, "BUYER")

      const { GET } = await import("@/app/api/user/orders/route")
      const res = await GET()
      const { data } = await parseResponse(res)
      expect(data.data).toEqual([])
    })

    it("rejects unauthenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      const { GET } = await import("@/app/api/user/orders/route")
      const res = await GET()
      const { status } = await parseResponse(res)
      expect(status).toBe(401)
    })
  })
})
