// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"

vi.mock("next/image", () => ({
  default: (props: any) => React.createElement("img", { ...props, fill: undefined }),
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => React.createElement("a", { href }, children),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => React.createElement("button", props, children),
}))

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => React.createElement("span", { className }, children),
}))

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => React.createElement("div", { className }, children),
}))

vi.mock("@/components/ui/WishlistButton", () => ({
  WishlistButton: ({ isWishlisted, onToggle }: any) =>
    React.createElement("button", {
      "data-testid": "wishlist-btn",
      "data-wishlisted": String(isWishlisted),
      onClick: onToggle,
    }, isWishlisted ? "❤️" : "🤍"),
}))

describe("VehicleCard", () => {
  it("renders title and price", async () => {
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v1", title: "Ola S1 Pro", price: 150000 }))
    expect(screen.getByText("Ola S1 Pro")).toBeDefined()
    expect(screen.getByText("₹1.50 Lakh")).toBeDefined()
  })

  it("shows battery health badge", async () => {
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v2", title: "Ather 450X", price: 120000, batteryHealth: 92 }))
    expect(screen.getByText("92% Health")).toBeDefined()
  })

  it("shows warranty badge when applicable", async () => {
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v3", title: "Test EV", price: 200000, warrantyStatus: "ACTIVE WARRANTY" }))
    expect(screen.getByText("Warranty")).toBeDefined()
  })

  it("shows RESERVED overlay", async () => {
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v4", title: "Reserved EV", price: 180000, status: "RESERVED" }))
    expect(screen.getByText("Reserved")).toBeDefined()
  })

  it("shows SOLD overlay", async () => {
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v5", title: "Sold EV", price: 180000, status: "SOLD" }))
    expect(screen.getByText("Sold")).toBeDefined()
  })

  it("renders WishlistButton and calls onWishlistToggle", async () => {
    const onToggle = vi.fn()
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v6", title: "Wishlist EV", price: 160000, isWishlisted: false, onWishlistToggle: onToggle }))
    const btn = screen.getByTestId("wishlist-btn")
    expect(btn).toBeDefined()
    expect(btn.getAttribute("data-wishlisted")).toBe("false")
    fireEvent.click(btn)
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it("renders km driven", async () => {
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v7", title: "Mileage EV", price: 140000, kmDriven: 5000 }))
    expect(screen.getByText("5,000 km")).toBeDefined()
  })

  it("renders year", async () => {
    const { VehicleCard } = await import("@/components/VehicleCard")
    render(React.createElement(VehicleCard, { id: "v8", title: "Old EV", price: 100000, year: 2022 }))
    expect(screen.getByText("2022 Model")).toBeDefined()
  })
})
