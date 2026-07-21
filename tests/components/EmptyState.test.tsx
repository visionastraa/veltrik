// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"

vi.mock("lucide-react", () => ({
  Inbox: () => React.createElement("svg", { "data-testid": "inbox-icon" }),
}))
vi.mock("framer-motion", () => ({
  motion: { div: (props: any) => React.createElement("div", props), span: (props: any) => React.createElement("span", props) },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}))
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => React.createElement("button", props, children),
}))

describe("EmptyState", () => {
  it("renders title and description", async () => {
    const { EmptyState } = await import("@/components/ui/EmptyState")
    render(React.createElement(EmptyState, { title: "Test Title", description: "Test Description" }))
    expect(screen.getByText("Test Title")).toBeDefined()
    expect(screen.getByText("Test Description")).toBeDefined()
  })

  it("renders action button when provided", async () => {
    const { EmptyState } = await import("@/components/ui/EmptyState")
    render(React.createElement(EmptyState, {
      title: "Empty",
      description: "Nothing here",
      action: { label: "Click Me", onClick: () => {} },
    }))
    expect(screen.getByText("Click Me")).toBeDefined()
  })

  it("renders without action when not provided", async () => {
    const { EmptyState } = await import("@/components/ui/EmptyState")
    const { container } = render(React.createElement(EmptyState, { title: "Empty", description: "Nothing here" }))
    expect(screen.getByTestId("inbox-icon")).toBeDefined()
  })
})
