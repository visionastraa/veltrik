// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

vi.mock("framer-motion", () => ({
  motion: {
    div: (props: any) => React.createElement("div", props),
    span: (props: any) => React.createElement("span", props),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}))

describe("MessageThread", () => {
  it("renders sent and received messages", async () => {
    const { MessageThread } = await import("@/components/messages/MessageThread")
    const messages = [
      { id: "1", content: "Hello!", senderId: "me", createdAt: "2026-01-01T10:00:00.000Z", read: true },
      { id: "2", content: "Hi there!", senderId: "them", createdAt: "2026-01-01T10:01:00.000Z", read: true },
    ]
    render(React.createElement(MessageThread, { messages, currentUserId: "me" }))
    expect(screen.getByText("Hello!")).toBeDefined()
    expect(screen.getByText("Hi there!")).toBeDefined()
  })

  it("shows empty state when no messages", async () => {
    const { MessageThread } = await import("@/components/messages/MessageThread")
    render(React.createElement(MessageThread, { messages: [], currentUserId: "me" }))
    expect(screen.getByText("No messages yet. Start the conversation!")).toBeDefined()
  })

  it("renders messages in correct order", async () => {
    const { MessageThread } = await import("@/components/messages/MessageThread")
    const messages = [
      { id: "1", content: "First", senderId: "them", createdAt: "2026-01-01T10:00:00.000Z", read: false },
      { id: "2", content: "Second", senderId: "me", createdAt: "2026-01-01T10:01:00.000Z", read: true },
      { id: "3", content: "Third", senderId: "them", createdAt: "2026-01-01T10:02:00.000Z", read: false },
    ]
    render(React.createElement(MessageThread, { messages, currentUserId: "me" }))
    const elements = screen.getAllByText(/First|Second|Third/)
    expect(elements[0].textContent).toBe("First")
    expect(elements[1].textContent).toBe("Second")
    expect(elements[2].textContent).toBe("Third")
  })
})
