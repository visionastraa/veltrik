import { describe, it, expect } from "vitest"
import { parseSearchQuery, SEARCH_SUGGESTIONS } from "@/lib/search-parser"

describe("search-parser", () => {
  describe("parseSearchQuery", () => {
    it("extracts brand from query", () => {
      const result = parseSearchQuery("Tesla Model 3")
      expect(result.brand).toBe("Tesla")
    })

    it("extracts body type", () => {
      const result = parseSearchQuery("SUV under 25L")
      expect(result.bodyType).toBe("SUV")
    })

    it("extracts max price with 'under' keyword", () => {
      const result = parseSearchQuery("under 25L")
      expect(result.maxPrice).toBe(2500000)
    })

    it("extracts max price with 'below' keyword", () => {
      const result = parseSearchQuery("below 20 lakhs")
      expect(result.maxPrice).toBe(2000000)
    })

    it("extracts max price with numeric format (raw rupees)", () => {
      const result = parseSearchQuery("max 2000000")
      // 2000000 is >= 100, so it's treated as raw rupees
      expect(result.maxPrice).toBe(2000000)
    })

    it("extracts min price with 'above' keyword", () => {
      const result = parseSearchQuery("above 10L")
      expect(result.minPrice).toBe(1000000)
    })

    it("extracts min price with 'over' keyword", () => {
      const result = parseSearchQuery("over 15 lakhs")
      expect(result.minPrice).toBe(1500000)
    })

    it("extracts battery percentage with 'battery above' syntax", () => {
      const result = parseSearchQuery("battery above 80%")
      expect(result.minBattery).toBe(80)
    })

    it("extracts battery with percentage after number", () => {
      const result = parseSearchQuery("80% battery")
      expect(result.minBattery).toBe(80)
    })

    it("sets minBattery=80 for 'long range'", () => {
      const result = parseSearchQuery("long range SUV")
      expect(result.minBattery).toBe(80)
    })

    it("extracts year from query", () => {
      const result = parseSearchQuery("2024 BMW")
      expect(result.year).toBe(2024)
    })

    it("extracts year with 'year' prefix", () => {
      const result = parseSearchQuery("year 2023")
      expect(result.year).toBe(2023)
    })

    it("sets sortBy to price_low for 'cheapest'", () => {
      const result = parseSearchQuery("cheapest sedan")
      expect(result.sortBy).toBe("price_low")
    })

    it("sets sortBy to price_high for 'expensive'", () => {
      const result = parseSearchQuery("expensive SUV")
      expect(result.sortBy).toBe("price_high")
    })

    it("sets sortBy to battery for 'best battery'", () => {
      const result = parseSearchQuery("best battery EV")
      expect(result.sortBy).toBe("battery")
    })

    it("sets sortBy to newest by default", () => {
      const result = parseSearchQuery("Tesla")
      expect(result.sortBy).toBe("newest")
    })

    it("cleans text by removing parsed tokens", () => {
      const result = parseSearchQuery("Tesla under 25L SUV")
      expect(result.text.toLowerCase()).not.toContain("under")
      expect(result.text.toLowerCase()).not.toContain("25l")
    })

    it("handles empty query gracefully", () => {
      const result = parseSearchQuery("")
      expect(result.brand).toBe("")
      expect(result.bodyType).toBe("")
      expect(result.maxPrice).toBeNull()
      expect(result.minPrice).toBeNull()
    })

    it("handles complex query with multiple filters", () => {
      const result = parseSearchQuery("Tesla SUV under 30L battery above 80% 2024 cheapest")
      expect(result.brand).toBe("Tesla")
      expect(result.bodyType).toBe("SUV")
      expect(result.maxPrice).toBe(3000000)
      expect(result.minPrice).toBe(8000000)
      expect(result.year).toBe(2024)
      expect(result.sortBy).toBe("price_low")
    })

    it("handles case-insensitive brand matching", () => {
      const result = parseSearchQuery("tesla model 3")
      expect(result.brand).toBe("Tesla")
    })

    it("handles 'upto' keyword for max price", () => {
      const result = parseSearchQuery("upto 20L")
      expect(result.maxPrice).toBe(2000000)
    })

    it("handles 'up to' keyword for max price", () => {
      const result = parseSearchQuery("up to 12L")
      expect(result.maxPrice).toBe(1200000)
    })

    it("handles 'from' keyword for min price", () => {
      const result = parseSearchQuery("from 8L")
      expect(result.minPrice).toBe(800000)
    })
  })

  describe("SEARCH_SUGGESTIONS", () => {
    it("contains expected suggestions", () => {
      const suggestions = SEARCH_SUGGESTIONS.map((s) => s.label)
      expect(suggestions).toContain("Tesla under 25L")
      expect(suggestions).toContain("Long range SUV")
    })

    it("each suggestion has label and query", () => {
      for (const s of SEARCH_SUGGESTIONS) {
        expect(s).toHaveProperty("label")
        expect(s).toHaveProperty("query")
        expect(typeof s.label).toBe("string")
        expect(typeof s.query).toBe("string")
      }
    })
  })
})
