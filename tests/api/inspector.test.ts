import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { prisma } from "../setup"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser, createSellerLead, createInspection } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(userId: string, role = "INSPECTOR") {
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: userId, role, name: "", email: "" } })
}

describe("Inspector API", () => {
  let inspector: any
  beforeEach(async () => {
    inspector = await createUser({ role: "INSPECTOR", email: `inspector-${Date.now()}@test.com` })
  })

  describe("GET /api/inspector/leads", () => {
    it("returns leads for inspector", async () => {
      await createSellerLead({ status: "SCHEDULED" })
      await createSellerLead({ status: "SUBMITTED" })
      gp(inspector.id)
      const { GET } = await import("@/app/api/inspector/leads/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data.length).toBe(2)
    })

    it("rejects non-inspector users", async () => {
      const buyer = await createUser({ role: "BUYER" })
      gp(buyer.id, "BUYER")
      const { GET } = await import("@/app/api/inspector/leads/route")
      const res = await GET()
      const { status } = await parseResponse(res)
      expect(status).toBe(403)
    })
  })

  describe("GET /api/inspector/leads/[id]", () => {
    it("returns a single lead", async () => {
      const lead = await createSellerLead()
      gp(inspector.id)
      const { GET } = await import("@/app/api/inspector/leads/[id]/route")
      const req = createNextReq({ method: "GET", path: `/api/inspector/leads/${lead.id}` })
      const res = await GET(req, { params: Promise.resolve({ id: lead.id }) })
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data.id).toBe(lead.id)
    })

    it("returns 404 for non-existent lead", async () => {
      gp(inspector.id)
      const { GET } = await import("@/app/api/inspector/leads/[id]/route")
      const req = createNextReq({ method: "GET", path: "/api/inspector/leads/nonexistent" })
      const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) })
      const { status } = await parseResponse(res)
      expect(status).toBe(404)
    })
  })

  describe("GET /api/inspector/inspections", () => {
    it("returns inspections assigned to the inspector", async () => {
      await createInspection({ inspectorId: inspector.id })
      await createInspection({ inspectorId: inspector.id })
      gp(inspector.id)
      const { GET } = await import("@/app/api/inspector/inspections/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data.length).toBe(2)
      for (const insp of data.data) {
        expect(insp.inspectorId).toBe(inspector.id)
      }
    })
  })

  describe("GET /api/inspector/inspections/[id]", () => {
    it("returns a single inspection", async () => {
      const inspection = await createInspection({ inspectorId: inspector.id })
      gp(inspector.id)
      const { GET } = await import("@/app/api/inspector/inspections/[id]/route")
      const req = createNextReq({ method: "GET", path: `/api/inspector/inspections/${inspection.id}` })
      const res = await GET(req, { params: Promise.resolve({ id: inspection.id }) })
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.data.id).toBe(inspection.id)
    })
  })

  describe("GET /api/inspector/stats", () => {
    it("returns stats for the inspector", async () => {
      await createInspection({ inspectorId: inspector.id })
      gp(inspector.id)
      const { GET } = await import("@/app/api/inspector/stats/route")
      const res = await GET()
      const { status, data } = await parseResponse(res)
      expect(status).toBe(200)
      expect(data.todayCount).toBeTypeOf("number")
      expect(data.completedCount).toBeTypeOf("number")
      expect(data.pendingCount).toBeTypeOf("number")
    })
  })
})
