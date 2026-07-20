import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn (classname merge utility)", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "block")).toBe("base block")
    expect(cn("base", null, undefined, "visible")).toBe("base visible")
  })

  it("resolves tailwind conflicts (later wins)", () => {
    expect(cn("px-3", "px-4")).toBe("px-4")
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500")
    expect(cn("text-sm", "text-lg")).toBe("text-lg")
  })

  it("handles object syntax", () => {
    expect(cn({ "flex": true, "hidden": false })).toBe("flex")
  })

  it("handles array syntax", () => {
    expect(cn(["px-2", "py-1"], "rounded")).toBe("px-2 py-1 rounded")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})
