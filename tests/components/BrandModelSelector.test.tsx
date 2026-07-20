// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => React.createElement("label", props, children),
}))

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, ...props }: any) => React.createElement("span", { className, ...props }, children),
}))

describe("BrandModelSelector", () => {
  it("renders all brand buttons", async () => {
    const { BrandModelSelector } = await import("@/components/BrandModelSelector")
    render(React.createElement(BrandModelSelector, {
      selectedBrands: [], selectedModels: [],
      onBrandsChange: vi.fn(), onModelsChange: vi.fn(),
    }))
    expect(screen.getByText("Ola Electric")).toBeDefined()
    expect(screen.getByText("Ather Energy")).toBeDefined()
  })

  it("calls onBrandsChange when brand toggled", async () => {
    const onBrandsChange = vi.fn()
    const { BrandModelSelector } = await import("@/components/BrandModelSelector")
    render(React.createElement(BrandModelSelector, {
      selectedBrands: [], selectedModels: [],
      onBrandsChange, onModelsChange: vi.fn(),
    }))
    fireEvent.click(screen.getByText("Ola Electric"))
    expect(onBrandsChange).toHaveBeenCalledWith(["Ola Electric"])
  })

  it("shows selected brands with check icon", async () => {
    const { BrandModelSelector } = await import("@/components/BrandModelSelector")
    const { container } = render(React.createElement(BrandModelSelector, {
      selectedBrands: ["Ola Electric"], selectedModels: [],
      onBrandsChange: vi.fn(), onModelsChange: vi.fn(),
    }))
    const brandButtons = container.querySelectorAll("button")
    const olaBtn = Array.from(brandButtons).find(b => b.textContent?.includes("Ola Electric"))
    expect(olaBtn?.querySelector("svg")).toBeDefined()
  })

  it("shows selected summary tags", async () => {
    const { BrandModelSelector } = await import("@/components/BrandModelSelector")
    render(React.createElement(BrandModelSelector, {
      selectedBrands: ["Ola Electric"], selectedModels: ["S1 Pro"],
      onBrandsChange: vi.fn(), onModelsChange: vi.fn(),
    }))
    expect(screen.getByText("Selected:")).toBeDefined()
    const olaBadges = screen.getAllByText("Ola Electric")
    expect(olaBadges.length).toBeGreaterThanOrEqual(2)
    const s1Badges = screen.getAllByText("S1 Pro")
    expect(s1Badges.length).toBeGreaterThanOrEqual(2)
  })

  it("removes brand from selection when clicked again", async () => {
    const onBrandsChange = vi.fn()
    const { BrandModelSelector } = await import("@/components/BrandModelSelector")
    render(React.createElement(BrandModelSelector, {
      selectedBrands: ["Ola Electric", "Ather Energy"], selectedModels: [],
      onBrandsChange, onModelsChange: vi.fn(),
    }))
    const buttons = screen.getAllByText("Ola Electric")
    fireEvent.click(buttons[0])
    expect(onBrandsChange).toHaveBeenCalledWith(["Ather Energy"])
  })
})
