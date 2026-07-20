import { describe, it, expect } from "vitest"
import { generateTimeSlots, getMinDate, getMaxDate } from "@/lib/slots"

describe("slots", () => {
  describe("generateTimeSlots", () => {
    it("returns 9 slots for a full day (9-5 = 8 hours x 1 slot/hour)", () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const slots = generateTimeSlots(tomorrow)
      expect(slots.length).toBe(9)
    })

    it("each slot has label, value, and available", () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const slots = generateTimeSlots(tomorrow)
      for (const slot of slots) {
        expect(slot).toHaveProperty("label")
        expect(slot).toHaveProperty("value")
        expect(slot).toHaveProperty("available")
        expect(typeof slot.label).toBe("string")
        expect(typeof slot.value).toBe("string")
        expect(slot.available).toBe(true)
      }
    })

    it("uses correct time format: HH:MM - HH:MM", () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const slots = generateTimeSlots(tomorrow)
      expect(slots[0].label).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/)
    })

    it("filters past slots for today", () => {
      const now = new Date()
      const lateHour = now.getHours() + 2
      // Only test this if it's before 4PM (so at least some slots remain)
      if (now.getHours() < 16) {
        const slots = generateTimeSlots(now, 60, now.getHours() - 1, Math.min(now.getHours() + 3, 18))
        // Past slots should be filtered out
        for (const slot of slots) {
          const slotHour = parseInt(slot.value.split(":")[0])
          expect(slotHour).toBeGreaterThanOrEqual(now.getHours())
        }
      }
    })

    it("respects custom duration", () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const slots30 = generateTimeSlots(tomorrow, 30)
      expect(slots30.length).toBeGreaterThan(9)
    })

    it("respects custom start/end hours", () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const slots = generateTimeSlots(tomorrow, 60, 10, 13)
      expect(slots.length).toBe(3)
      expect(slots[0].label).toContain("10:")
      expect(slots[2].label).toContain("12:")
    })

    it("returns empty array if endHour <= startHour", () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const slots = generateTimeSlots(tomorrow, 60, 14, 12)
      expect(slots.length).toBe(0)
    })
  })

  describe("getMinDate", () => {
    it("returns tomorrow's date in YYYY-MM-DD format", () => {
      const min = getMinDate()
      expect(min).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const expected = tomorrow.toISOString().split("T")[0]
      expect(min).toBe(expected)
    })
  })

  describe("getMaxDate", () => {
    it("returns date 30 days from now in YYYY-MM-DD format", () => {
      const max = getMaxDate()
      expect(max).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const future = new Date()
      future.setDate(future.getDate() + 30)
      const expected = future.toISOString().split("T")[0]
      expect(max).toBe(expected)
    })
  })
})
