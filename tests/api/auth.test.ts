import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "../setup"
import { createNextReq, parseResponse } from "../helpers/next-request"
import bcrypt from "bcryptjs"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve(null)),
}))

vi.mock("@/lib/mailer", () => ({
  sendEmail: vi.fn(() => Promise.resolve({ success: true })),
  buildWelcomeEmail: vi.fn((name: string) => `<html>Welcome ${name}</html>`),
  buildBookingConfirmationEmail: vi.fn(() => "<html>Confirmed</html>"),
  buildPaymentReceiptEmail: vi.fn(() => "<html>Receipt</html>"),
}))

describe("POST /api/auth/register", () => {
  it("registers a new buyer user", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    const req = createNextReq({
      method: "POST",
      path: "/api/auth/register",
      body: { name: "New User", email: "new@test.com", password: "password123", role: "BUYER" },
    })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.name).toBe("New User")
    expect(data.user.email).toBe("new@test.com")
    expect(data.user.role).toBe("BUYER")

    const dbUser = await prisma.user.findUnique({ where: { email: "new@test.com" } })
    expect(dbUser).not.toBeNull()
    expect(dbUser?.password).not.toBe("password123") // must be hashed
    const valid = await bcrypt.compare("password123", dbUser!.password!)
    expect(valid).toBe(true)
  })

  it("registers a seller user", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    const req = createNextReq({
      method: "POST",
      path: "/api/auth/register",
      body: { name: "Seller User", email: "seller@test.com", password: "password123", role: "SELLER" },
    })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)

    expect(status).toBe(200)
    expect(data.user.role).toBe("SELLER")
  })

  it("rejects missing name", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    const req = createNextReq({
      method: "POST",
      path: "/api/auth/register",
      body: { email: "noname@test.com", password: "password123" },
    })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)

    expect(status).toBe(400)
    expect(data.error).toContain("Name")
  })

  it("rejects missing email", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    const req = createNextReq({
      method: "POST",
      path: "/api/auth/register",
      body: { name: "No Email", password: "password123" },
    })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)

    expect(status).toBe(400)
    expect(data.error).toContain("email")
  })

  it("rejects missing password", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    const req = createNextReq({
      method: "POST",
      path: "/api/auth/register",
      body: { name: "No Password", email: "nopass@test.com" },
    })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)

    expect(status).toBe(400)
    expect(data.error).toContain("password")
  })

  it("rejects duplicate email", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    await prisma.user.create({
      data: { name: "Existing", email: "dup@test.com", password: "hash", role: "BUYER" },
    })

    const req = createNextReq({
      method: "POST",
      path: "/api/auth/register",
      body: { name: "Duplicate", email: "dup@test.com", password: "password123" },
    })
    const res = await POST(req)
    const { status, data } = await parseResponse(res)

    expect(status).toBe(409)
    expect(data.error).toContain("already in use")
  })

  it("defaults to BUYER role when role is not SELLER", async () => {
    const { POST } = await import("@/app/api/auth/register/route")
    const req = createNextReq({
      method: "POST",
      path: "/api/auth/register",
      body: { name: "Default Buyer", email: "default@test.com", password: "password123", role: "ADMIN" },
    })
    const res = await POST(req)
    const { data } = await parseResponse(res)

    // Role ADMIN is not "SELLER", so defaults to BUYER
    expect(data.user.role).toBe("BUYER")
  })
})
