import { describe, it, expect, beforeEach } from "vitest"

describe("useCompareStore (Zustand)", () => {
  beforeEach(async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.setState({ ids: [] })
  })

  it("starts with empty ids array", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    expect(useCompareStore.getState().ids).toEqual([])
  })

  it("adds an id", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.getState().add("v1")
    expect(useCompareStore.getState().ids).toEqual(["v1"])
  })

  it("removes an id", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.getState().add("v1")
    useCompareStore.getState().remove("v1")
    expect(useCompareStore.getState().ids).toEqual([])
  })

  it("prevents adding more than 4 ids", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.getState().add("v1")
    useCompareStore.getState().add("v2")
    useCompareStore.getState().add("v3")
    useCompareStore.getState().add("v4")
    useCompareStore.getState().add("v5")
    expect(useCompareStore.getState().ids).toHaveLength(4)
  })

  it("prevents adding duplicate id", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.getState().add("v1")
    useCompareStore.getState().add("v1")
    expect(useCompareStore.getState().ids).toEqual(["v1"])
  })

  it("clears all ids", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.getState().add("v1")
    useCompareStore.getState().add("v2")
    useCompareStore.getState().clear()
    expect(useCompareStore.getState().ids).toEqual([])
  })

  it("checks membership with has()", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.getState().add("v1")
    expect(useCompareStore.getState().has("v1")).toBe(true)
    expect(useCompareStore.getState().has("v999")).toBe(false)
  })

  it("toggles id (add then remove)", async () => {
    const { useCompareStore } = await import("@/hooks/use-compare")
    useCompareStore.getState().toggle("v1")
    expect(useCompareStore.getState().has("v1")).toBe(true)
    useCompareStore.getState().toggle("v1")
    expect(useCompareStore.getState().has("v1")).toBe(false)
  })
})
