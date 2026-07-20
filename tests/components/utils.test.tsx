import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { cn } from "@/lib/utils"

// Test the underlying utility since component rendering requires heavy mocking
describe("cn utility (used by all components)", () => {
  it("produces correct class strings for shadcn Button combos", () => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium",
      "bg-primary text-primary-foreground hover:bg-primary/90",
      "h-10 px-4 py-2",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
    )
    expect(classes).toContain("inline-flex")
    expect(classes).toContain("bg-primary")
    expect(classes).toContain("disabled:opacity-50")
  })

  it("merges conflicting classes with later winning", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
    expect(cn("m-2", "m-4")).toBe("m-4")
  })

  it("handles conditional classes", () => {
    const isActive = true
    const isDisabled = false
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active")
  })

  it("handles undefined and null safely", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b")
  })
})
