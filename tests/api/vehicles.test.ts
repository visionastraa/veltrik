import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { prisma } from "../setup"
import { createNextReq, parseResponse, expectPaginated } from "../helpers/next-request"
import { createUser, createListing, createSellerLead, createInspection } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("@/lib/socket-emitter", () => ({ emitToUser: vi.fn(), emitToListing: vi.fn(), emitToConversation: vi.fn() }))

function gp(id: string, role: string) {
  vi.mocked(getServerSession).mockImplementation(() =>
    Promise.resolve({ user: { id, role, name: "", email: "" } })
  )
}

describe("GET /api/vehicles", () => {
  it("returns paginated listings", async () => {
    await createListing({ price: 100000 })
    await createListing({ price: 150000 })
    await createListing({ price: 200000 })

    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles" })
    const res = await GET(req)
    const { status, data } = await parseResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expectPaginated(data)
    expect(data.data.length).toBe(3)
    expect(data.total).toBe(3)
  })

  it("filters by brand", async () => {
    await createListing()
    const lead = await createSellerLead({ make: "Ather" })
    const insp = await createInspection({ sellerLeadId: lead.id })
    await createListing({ inspectionId: insp.id, title: "Ather 450X" })

    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles?brand=Ola" })
    const res = await GET(req)
    const { data } = await parseResponse(res)

    for (const listing of data.data) {
      expect(listing.inspection.sellerLead.make).toBe("Ola")
    }
  })

  it("filters by price range", async () => {
    await createListing({ price: 50000 })
    await createListing({ price: 100000 })
    await createListing({ price: 200000 })

    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({
      method: "GET",
      path: "/api/vehicles?minPrice=80000&maxPrice=150000",
    })
    const res = await GET(req)
    const { data } = await parseResponse(res)

    expect(data.data.length).toBe(1)
    expect(data.data[0].price).toBe(100000)
  })

  it("filters by search query", async () => {
    const lead = await createSellerLead({ make: "Ather" })
    const insp = await createInspection({ sellerLeadId: lead.id })
    await createListing({ inspectionId: insp.id, title: "Ather 450X" })

    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles?search=Ather" })
    const res = await GET(req)
    const { data } = await parseResponse(res)

    expect(data.data.length).toBe(1)
  })

  it("paginates correctly", async () => {
    for (let i = 0; i < 5; i++) {
      await createListing({ price: 100000 + i })
    }

    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles?page=1&limit=2" })
    const res = await GET(req)
    const { data } = await parseResponse(res)

    expect(data.data.length).toBe(2)
    expect(data.page).toBe(1)
    expect(data.limit).toBe(2)
    expect(data.total).toBe(5)
    expect(data.totalPages).toBe(3)
  })

  it("sorts by price ascending", async () => {
    await createListing({ price: 300000 })
    await createListing({ price: 100000 })
    await createListing({ price: 200000 })

    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles?sortBy=price_low" })
    const res = await GET(req)
    const { data } = await parseResponse(res)

    const prices = data.data.map((l: any) => l.price)
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b))
  })

  it("sorts by price descending", async () => {
    await createListing({ price: 100000 })
    await createListing({ price: 300000 })
    await createListing({ price: 200000 })

    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles?sortBy=price_high" })
    const res = await GET(req)
    const { data } = await parseResponse(res)

    const prices = data.data.map((l: any) => l.price)
    expect(prices).toEqual([...prices].sort((a: number, b: number) => b - a))
  })

  it("returns empty array when no listings exist", async () => {
    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles" })
    const res = await GET(req)
    const { data } = await parseResponse(res)

    expect(data.data).toEqual([])
    expect(data.total).toBe(0)
  })

  it("handles invalid page gracefully", async () => {
    const { GET } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles?page=-1&limit=abc" })
    const res = await GET(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})

describe("POST /api/vehicles", () => {
  it("creates a new listing", async () => {
    const inspection = await createInspection()
    const { POST } = await import("@/app/api/vehicles/route")
    const req = createNextReq({
      method: "POST", path: "/api/vehicles",
      body: { inspectionId: inspection.id, title: "Test EV", price: 150000, photos: ["/photo1.jpg"] },
    })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.title).toBe("Test EV")
    expect(data.data.price).toBe(150000)
  })

  it("fails with missing required fields", async () => {
    const { POST } = await import("@/app/api/vehicles/route")
    const req = createNextReq({ method: "POST", path: "/api/vehicles", body: { title: "No inspection" } })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})

describe("GET /api/vehicles/[id]", () => {
  it("returns a single listing with full relations", async () => {
    const listing = await createListing({ price: 175000 })
    const { GET } = await import("@/app/api/vehicles/[id]/route")
    const req = createNextReq({ method: "GET", path: `/api/vehicles/${listing.id}` })
    const res = await GET(req, { params: Promise.resolve({ id: listing.id }) })
    const { status, data } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe(listing.id)
    expect(data.data.price).toBe(175000)
  })

  it("returns 404 for non-existent listing", async () => {
    const { GET } = await import("@/app/api/vehicles/[id]/route")
    const req = createNextReq({ method: "GET", path: "/api/vehicles/nonexistent" })
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) })
    const { status, data } = await parseResponse(res)
    expect(status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toContain("not found")
  })
})

describe("PUT /api/vehicles/[id]", () => {
  it("updates a listing", async () => {
    const listing = await createListing({ price: 100000 })
    const { PUT } = await import("@/app/api/vehicles/[id]/route")
    const req = createNextReq({ method: "PUT", path: `/api/vehicles/${listing.id}`, body: { price: 200000, title: "Updated EV" } })
    const res = await PUT(req, { params: Promise.resolve({ id: listing.id }) })
    const { status, data } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.data.price).toBe(200000)
    expect(data.data.title).toBe("Updated EV")
  })

  it("fails for non-existent listing", async () => {
    const { PUT } = await import("@/app/api/vehicles/[id]/route")
    const req = createNextReq({ method: "PUT", path: "/api/vehicles/nonexistent", body: { title: "Ghost" } })
    const res = await PUT(req, { params: Promise.resolve({ id: "nonexistent" }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})

describe("DELETE /api/vehicles/[id]", () => {
  it("deletes a listing", async () => {
    const listing = await createListing()
    const { DELETE } = await import("@/app/api/vehicles/[id]/route")
    const req = createNextReq({ method: "DELETE", path: `/api/vehicles/${listing.id}` })
    const res = await DELETE(req, { params: Promise.resolve({ id: listing.id }) })
    const { status, data } = await parseResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    const deleted = await prisma.listing.findUnique({ where: { id: listing.id } })
    expect(deleted).toBeNull()
  })

  it("fails for non-existent listing", async () => {
    const { DELETE } = await import("@/app/api/vehicles/[id]/route")
    const req = createNextReq({ method: "DELETE", path: "/api/vehicles/nonexistent" })
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})
