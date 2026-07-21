// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? React.createElement("div", { "data-testid": "dialog" }, children) : null,
  DialogContent: ({ children }: any) => React.createElement("div", null, children),
  DialogHeader: ({ children }: any) => React.createElement("div", null, children),
  DialogTitle: ({ children }: any) => React.createElement("h2", null, children),
  DialogDescription: ({ children }: any) => React.createElement("p", null, children),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, disabled, ...props }: any) =>
    React.createElement("button", { onClick, type, disabled, ...props }, children),
}))

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => React.createElement("input", { ...props, autoComplete: undefined }),
}))

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => React.createElement("label", props, children),
}))

vi.mock("@/components/BrandModelSelector", () => ({
  BrandModelSelector: () => React.createElement("div", { "data-testid": "brand-selector" }, "Brand Selector"),
}))

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe("LeadCaptureModal", () => {
  it("renders nothing when closed", async () => {
    const { LeadCaptureModal } = await import("@/components/LeadCaptureModal")
    const { container } = render(React.createElement(LeadCaptureModal, {
      open: false, onOpenChange: vi.fn(),
    }))
    expect(container.innerHTML).toBe("")
  })

  it("renders form when open", async () => {
    const { LeadCaptureModal } = await import("@/components/LeadCaptureModal")
    render(React.createElement(LeadCaptureModal, {
      open: true, onOpenChange: vi.fn(),
    }))
    expect(screen.getByText("Express Interest in Electric Vehicle")).toBeDefined()
  })

  it("shows vehicle title when provided", async () => {
    const { LeadCaptureModal } = await import("@/components/LeadCaptureModal")
    render(React.createElement(LeadCaptureModal, {
      open: true, onOpenChange: vi.fn(), vehicleTitle: "Ola S1 Pro",
    }))
    expect(screen.getByText("Express Interest in Ola S1 Pro")).toBeDefined()
  })

  it("renders form fields", async () => {
    const { LeadCaptureModal } = await import("@/components/LeadCaptureModal")
    render(React.createElement(LeadCaptureModal, {
      open: true, onOpenChange: vi.fn(),
    }))
    expect(screen.getByText("Full Name")).toBeDefined()
    expect(screen.getByText("Email Address")).toBeDefined()
    expect(screen.getByText("Mobile Phone")).toBeDefined()
    expect(screen.getByText("Submit Lead")).toBeDefined()
  })

  it("shows brand selector when no listingId", async () => {
    const { LeadCaptureModal } = await import("@/components/LeadCaptureModal")
    render(React.createElement(LeadCaptureModal, {
      open: true, onOpenChange: vi.fn(),
    }))
    expect(screen.getByTestId("brand-selector")).toBeDefined()
  })

  it("hides brand selector when listingId provided", async () => {
    const { LeadCaptureModal } = await import("@/components/LeadCaptureModal")
    render(React.createElement(LeadCaptureModal, {
      open: true, onOpenChange: vi.fn(), listingId: "list-1",
    }))
    expect(screen.queryByTestId("brand-selector")).toBeNull()
  })

  it("shows Get OTP button", async () => {
    const { LeadCaptureModal } = await import("@/components/LeadCaptureModal")
    render(React.createElement(LeadCaptureModal, {
      open: true, onOpenChange: vi.fn(),
    }))
    expect(screen.getByText("Get OTP")).toBeDefined()
  })
})
