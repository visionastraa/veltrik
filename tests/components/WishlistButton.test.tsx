// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"

vi.mock("lucide-react", () => ({
  Heart: () => React.createElement("svg", { "data-testid": "heart-icon" }),
}))

vi.mock("framer-motion", () => ({
  motion: {
    button: React.forwardRef((props: any, ref: any) =>
      React.createElement("button", { ...props, ref })
    ),
    span: (props: any) => React.createElement("span", props),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ onClick, children, className }: any) =>
    React.createElement("button", { onClick, className }, children),
}))

describe("WishlistButton", () => {
  it("renders active (filled) state when wishlisted", async () => {
    const { WishlistButton } = await import("@/components/ui/WishlistButton")
    render(React.createElement(WishlistButton, { isWishlisted: true, onToggle: vi.fn() }))
    expect(screen.getByTestId("heart-icon")).toBeDefined()
  })

  it("renders inactive state when not wishlisted", async () => {
    const { WishlistButton } = await import("@/components/ui/WishlistButton")
    render(React.createElement(WishlistButton, { isWishlisted: false, onToggle: vi.fn() }))
    expect(screen.getByTestId("heart-icon")).toBeDefined()
  })

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn()
    const { WishlistButton } = await import("@/components/ui/WishlistButton")
    render(React.createElement(WishlistButton, { isWishlisted: false, onToggle }))
    screen.getByRole("button").click()
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
