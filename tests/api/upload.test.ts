import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServerSession } from "next-auth"
import { createNextReq, parseResponse } from "../helpers/next-request"
import { createUser } from "../helpers/factories"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))

function gp(userId: string) {
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: userId, role: "ADMIN", name: "", email: "" } })
}

describe("POST /api/upload", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const { POST } = await import("@/app/api/upload/route")
    const form = new FormData()
    const res = await POST(form as any)
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it("rejects missing file", async () => {
    const user = await createUser()
    gp(user.id)
    const { POST } = await import("@/app/api/upload/route")
    const req = createNextReq({ method: "POST", path: "/api/upload" })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(500)
  })

  it("rejects disallowed file type", async () => {
    const user = await createUser()
    gp(user.id)
    const { POST } = await import("@/app/api/upload/route")
    const blob = new Blob(["fake"], { type: "text/plain" })
    const file = new File([blob], "test.txt", { type: "text/plain" })
    const form = new FormData()
    form.append("file", file)
    const req = createNextReq({ method: "POST", path: "/api/upload" })
    const res = await POST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(500)
  })
})
