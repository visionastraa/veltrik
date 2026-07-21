// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"

vi.mock("@/lib/slots", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as any),
    generateTimeSlots: vi.fn(() => [
      { label: "10:00 - 11:00", value: "10:00", available: true },
      { label: "11:00 - 12:00", value: "11:00", available: true },
      { label: "14:00 - 15:00", value: "14:00", available: false },
    ]),
  }
})

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => React.createElement("button", props, children),
}))

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => React.createElement("span", { className }, children),
}))

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => React.createElement("label", props, children),
}))

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => React.createElement("input", props),
}))

describe("BookingCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders date input and time slots", async () => {
    const { BookingCalendar } = await import("@/components/BookingCalendar")
    render(React.createElement(BookingCalendar, { onSelectSlot: vi.fn() }))
    expect(screen.getByText("Select Booking Date")).toBeDefined()
    expect(screen.getByText((c) => c.includes("Available Time Slots"))).toBeDefined()
  })

  it("calls onSelectSlot when an available slot is clicked", async () => {
    const onSelectSlot = vi.fn()
    const { BookingCalendar } = await import("@/components/BookingCalendar")
    render(React.createElement(BookingCalendar, { onSelectSlot }))
    const slotBtn = screen.getByText("10:00")
    fireEvent.click(slotBtn)
    expect(onSelectSlot).toHaveBeenCalledOnce()
  })

  it("does not call onSelectSlot for unavailable slot", async () => {
    const onSelectSlot = vi.fn()
    const { BookingCalendar } = await import("@/components/BookingCalendar")
    render(React.createElement(BookingCalendar, { onSelectSlot }))
    const slotBtn = screen.getByText("14:00")
    fireEvent.click(slotBtn)
    expect(onSelectSlot).not.toHaveBeenCalled()
  })
})
