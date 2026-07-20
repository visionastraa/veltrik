import { describe, it, expect } from "vitest"
import { BRANDS, MODELS_BY_BRAND, BODY_TYPES, getModelsByBrand } from "@/lib/brandModels"

describe("brandModels", () => {
  describe("BRANDS", () => {
    it("contains known EV brands", () => {
      expect(BRANDS).toContain("Ola Electric")
      expect(BRANDS).toContain("Ather Energy")
      expect(BRANDS).toContain("TVS Motor")
      expect(BRANDS).toContain("Hero MotoCorp")
    })

    it("is a readonly array", () => {
      const brands: readonly string[] = BRANDS
      expect(Array.isArray(brands)).toBe(true)
    })

    it("contains exactly 8 brands", () => {
      expect(BRANDS.length).toBe(8)
    })
  })

  describe("BODY_TYPES", () => {
    it("contains Scooter, Motorcycle, Moped", () => {
      expect(BODY_TYPES).toContain("Scooter")
      expect(BODY_TYPES).toContain("Motorcycle")
      expect(BODY_TYPES).toContain("Moped")
    })
  })

  describe("MODELS_BY_BRAND", () => {
    it("has entries for every brand", () => {
      for (const brand of BRANDS) {
        expect(MODELS_BY_BRAND[brand]).toBeDefined()
        expect(MODELS_BY_BRAND[brand].length).toBeGreaterThan(0)
      }
    })

    it("Ola Electric has S1 variants", () => {
      const models = MODELS_BY_BRAND["Ola Electric"]
      expect(models).toContain("S1 Pro")
      expect(models).toContain("S1 Air")
      expect(models).toContain("S1 X")
    })

    it("Ather Energy has 450X, 450S, Rizta", () => {
      const models = MODELS_BY_BRAND["Ather Energy"]
      expect(models).toContain("450X")
      expect(models).toContain("450S")
      expect(models).toContain("Rizta")
    })
  })

  describe("getModelsByBrand", () => {
    it("returns models for known brand", () => {
      const models = getModelsByBrand("Ola Electric")
      expect(models).toEqual(["S1 Air", "S1 Pro", "S1 X"])
    })

    it("returns empty array for unknown brand", () => {
      expect(getModelsByBrand("NonExistentBrand")).toEqual([])
    })

    it("returns empty array for empty string", () => {
      expect(getModelsByBrand("")).toEqual([])
    })
  })
})
