import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { prisma } from "../setup"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createConversation, createMessage, createListing } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(userId: string, role: string) {
  vi.mocked(getServerSession).mockImplementation(() =>
    Promise.resolve({ user: { id: userId, role } })
  )
}

let buyerUser: any, sellerUser: any, listing: any

beforeEach(async () => {
  buyerUser = await createUser({ role: "BUYER", email: "msg-buyer@test.com" })
  sellerUser = await createUser({ role: "SELLER", email: "msg-seller@test.com" })
  listing = await createListing()
})

describe("Messages API", () => {
  describe("GET /api/messages/conversations", () => {
    it("lists conversations for the current user", async () => {
      const conv = await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id, listingId: listing.id })
      await createMessage({ conversationId: conv.id, senderId: buyerUser.id })
      gp(buyerUser.id, "BUYER")

      const { GET } = await import("@/app/api/messages/conversations/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.length).toBe(1)
      expect(data.data[0].id).toBe(conv.id)
    })

    it("shows conversations where user is seller", async () => {
      await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id, listingId: listing.id })
      gp(sellerUser.id, "SELLER")

      const { GET } = await import("@/app/api/messages/conversations/route")
      const res = await GET()
      const { data } = await parseResponse(res)
      expect(data.data.length).toBe(1)
      expect(data.data[0].otherUser.id).toBe(buyerUser.id)
    })

    it("returns empty array when no conversations", async () => {
      gp(buyerUser.id, "BUYER")
      const { GET } = await import("@/app/api/messages/conversations/route")
      const res = await GET()
      const { data } = await parseResponse(res)
      expect(data.data).toEqual([])
    })
  })

  describe("POST /api/messages/conversations", () => {
    it("creates a new conversation", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/messages/conversations/route")
      const req = createNextReq({
        method: "POST", path: "/api/messages/conversations",
        body: { listingId: listing.id, sellerId: sellerUser.id, message: "Hi, interested" },
      })
      const res = await POST(req)
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data.id).toBeDefined()

      const conv = await prisma.conversation.findUnique({
        where: { id: data.data.id }, include: { messages: true },
      })
      expect(conv?.messages.length).toBe(1)
      expect(conv?.messages[0].content).toBe("Hi, interested")
    })

    it("reuses existing conversation", async () => {
      const existing = await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id, listingId: listing.id })
      gp(buyerUser.id, "BUYER")

      const { POST } = await import("@/app/api/messages/conversations/route")
      const req = createNextReq({
        method: "POST", path: "/api/messages/conversations",
        body: { listingId: listing.id, sellerId: sellerUser.id },
      })
      const res = await POST(req)
      const { data } = await parseResponse(res)
      expect(data.data.id).toBe(existing.id)
    })

    it("requires listingId and sellerId", async () => {
      gp(buyerUser.id, "BUYER")
      const { POST } = await import("@/app/api/messages/conversations/route")
      const req = createNextReq({ method: "POST", path: "/api/messages/conversations", body: { message: "hello" } })
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })

    it("rejects unauthenticated", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      const { POST } = await import("@/app/api/messages/conversations/route")
      const req = createNextReq({
        method: "POST", path: "/api/messages/conversations",
        body: { listingId: listing.id, sellerId: sellerUser.id },
      })
      const res = await POST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(401)
    })
  })

  describe("GET /api/messages/conversations/[id]", () => {
    it("returns conversation with messages", async () => {
      const conv = await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id })
      await createMessage({ conversationId: conv.id, senderId: buyerUser.id, content: "Hello" })
      await createMessage({ conversationId: conv.id, senderId: sellerUser.id, content: "Hi!" })
      gp(buyerUser.id, "BUYER")

      const { GET } = await import("@/app/api/messages/conversations/[id]/route")
      const req = createNextReq({ method: "GET", path: `/api/messages/conversations/${conv.id}` })
      const res = await GET(req, { params: Promise.resolve({ id: conv.id }) })
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data.messages.length).toBe(2)
      expect(data.data.otherUser.id).toBe(sellerUser.id)
    })

    it("rejects access by non-participant", async () => {
      const conv = await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id })
      const stranger = await createUser({ role: "BUYER", email: "stranger@test.com" })
      gp(stranger.id, "BUYER")

      const { GET } = await import("@/app/api/messages/conversations/[id]/route")
      const req = createNextReq({ method: "GET", path: `/api/messages/conversations/${conv.id}` })
      const res = await GET(req, { params: Promise.resolve({ id: conv.id }) })
      const { status } = await parseResponse(res)
      expect(status).toBe(403)
    })

    it("returns 404 for non-existent conversation", async () => {
      gp(buyerUser.id, "BUYER")
      const { GET } = await import("@/app/api/messages/conversations/[id]/route")
      const req = createNextReq({ method: "GET", path: "/api/messages/conversations/nonexistent" })
      const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) })
      const { status } = await parseResponse(res)
      expect(status).toBe(404)
    })
  })

  describe("POST /api/messages/conversations/[id]", () => {
    it("sends a message in conversation", async () => {
      const conv = await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id })
      gp(buyerUser.id, "BUYER")

      const { POST } = await import("@/app/api/messages/conversations/[id]/route")
      const req = createNextReq({ method: "POST", path: `/api/messages/conversations/${conv.id}`, body: { content: "Test" } })
      const res = await POST(req, { params: Promise.resolve({ id: conv.id }) })
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data.content).toBe("Test")

      const msgs = await prisma.message.findMany({ where: { conversationId: conv.id } })
      expect(msgs.length).toBe(1)
      expect(msgs[0].content).toBe("Test")
    })

    it("rejects empty content", async () => {
      const conv = await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id })
      gp(buyerUser.id, "BUYER")

      const { POST } = await import("@/app/api/messages/conversations/[id]/route")
      const req = createNextReq({ method: "POST", path: `/api/messages/conversations/${conv.id}`, body: { content: "" } })
      const res = await POST(req, { params: Promise.resolve({ id: conv.id }) })
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })

    it("rejects non-participant", async () => {
      const conv = await createConversation({ buyerId: buyerUser.id, sellerId: sellerUser.id })
      const stranger = await createUser({ role: "BUYER", email: "stranger2@test.com" })
      gp(stranger.id, "BUYER")

      const { POST } = await import("@/app/api/messages/conversations/[id]/route")
      const req = createNextReq({ method: "POST", path: `/api/messages/conversations/${conv.id}`, body: { content: "Hello" } })
      const res = await POST(req, { params: Promise.resolve({ id: conv.id }) })
      const { status } = await parseResponse(res)
      expect(status).toBe(403)
    })
  })
})
