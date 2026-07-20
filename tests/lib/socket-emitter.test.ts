import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
  mockFetch.mockResolvedValue({ ok: true })
})

describe("socket-emitter", () => {
  it("emitToUser calls fetch with correct payload", async () => {
    const { emitToUser } = await import("@/lib/socket-emitter")
    await emitToUser("user-1", "notification:new", { title: "Test" })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain("/emit")
    expect(opts.method).toBe("POST")
    expect(opts.headers["Content-Type"]).toBe("application/json")
    const body = JSON.parse(opts.body)
    expect(body.type).toBe("user")
    expect(body.userId).toBe("user-1")
    expect(body.event).toBe("notification:new")
  })

  it("emitToListing calls fetch with listing type", async () => {
    const { emitToListing } = await import("@/lib/socket-emitter")
    await emitToListing("listing-1", "listing:status-change", { status: "RESERVED" })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.type).toBe("listing")
    expect(body.listingId).toBe("listing-1")
    expect(body.event).toBe("listing:status-change")
  })

  it("emitToConversation calls fetch with conversation type", async () => {
    const { emitToConversation } = await import("@/lib/socket-emitter")
    await emitToConversation("conv-1", "message:new", { content: "Hello" })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.type).toBe("conversation")
    expect(body.conversationId).toBe("conv-1")
  })

  it("handles fetch failure gracefully (does not throw)", async () => {
    mockFetch.mockRejectedValue(new Error("Connection refused"))
    const { emitToUser } = await import("@/lib/socket-emitter")

    await expect(emitToUser("user-1", "event", {})).resolves.toBeUndefined()
  })

  it("handles non-ok response gracefully", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    const { emitToUser } = await import("@/lib/socket-emitter")

    await expect(emitToUser("user-1", "event", {})).resolves.toBeUndefined()
  })
})
