import { describe, it, expect } from "vitest"
import {
  calculateFollowupDate,
  getDefaultFollowupSchedule,
  scheduleFollowups,
} from "@/lib/followup"

describe("followup", () => {
  describe("calculateFollowupDate", () => {
    it("calculates +1 day for day1 interval", () => {
      const base = new Date("2026-01-01T12:00:00Z")
      const result = calculateFollowupDate(base, "day1")
      expect(result.toISOString().split("T")[0]).toBe("2026-01-02")
    })

    it("calculates +7 days for week1 interval", () => {
      const base = new Date("2026-01-01T12:00:00Z")
      const result = calculateFollowupDate(base, "week1")
      expect(result.toISOString().split("T")[0]).toBe("2026-01-08")
    })

    it("calculates +30 days for month1 interval", () => {
      const base = new Date("2026-01-01T12:00:00Z")
      const result = calculateFollowupDate(base, "month1")
      expect(result.toISOString().split("T")[0]).toBe("2026-01-31")
    })

    it("uses 7 days as default for unknown interval", () => {
      const base = new Date("2026-01-01T12:00:00Z")
      const result = calculateFollowupDate(base, "invalid" as any)
      // Default interval is 7
      expect(result.toISOString().split("T")[0]).toBe("2026-01-08")
    })

    it("returns date + default 7 days for unrecognized interval (immediate not in FOLLOWUP_INTERVALS)", () => {
      const base = new Date("2026-01-01T12:00:00Z")
      const result = calculateFollowupDate(base, "immediate")
      expect(result.toISOString().split("T")[0]).toBe("2026-01-08")
    })

    it("does not mutate the original date", () => {
      const base = new Date("2026-01-01T12:00:00Z")
      const baseCopy = new Date(base)
      calculateFollowupDate(base, "week1")
      expect(base.getTime()).toBe(baseCopy.getTime())
    })
  })

  describe("getDefaultFollowupSchedule", () => {
    it("returns 3 followups for buyer type", () => {
      const schedule = getDefaultFollowupSchedule("lead-1", "buyer")
      expect(schedule.length).toBe(3)
      expect(schedule[0].note).toContain("Initial follow-up")
      expect(schedule[1].note).toContain("Second follow-up")
      expect(schedule[2].note).toContain("Final follow-up")
    })

    it("returns 3 followups for seller type", () => {
      const schedule = getDefaultFollowupSchedule("lead-2", "seller")
      expect(schedule.length).toBe(3)
    })

    it("all items have required fields", () => {
      const schedule = getDefaultFollowupSchedule("lead-3", "buyer")
      for (const s of schedule) {
        expect(s).toHaveProperty("leadId")
        expect(s).toHaveProperty("type")
        expect(s).toHaveProperty("scheduledAt")
        expect(s.scheduledAt).toBeInstanceOf(Date)
        expect(isNaN(s.scheduledAt.getTime())).toBe(false)
      }
    })

    it("increments dates properly", () => {
      const schedule = getDefaultFollowupSchedule("lead-4", "buyer")
      expect(schedule[1].scheduledAt.getTime()).toBeGreaterThan(schedule[0].scheduledAt.getTime())
      expect(schedule[2].scheduledAt.getTime()).toBeGreaterThan(schedule[1].scheduledAt.getTime())
    })

    it("buyer follow-ups have correct leadId", () => {
      const schedule = getDefaultFollowupSchedule("lead-buyer-001", "buyer")
      for (const s of schedule) {
        expect(s.leadId).toBe("lead-buyer-001")
      }
    })
  })

  describe("scheduleFollowups", () => {
    it("returns success for valid schedules", async () => {
      const future = new Date()
      future.setDate(future.getDate() + 30)
      const result = await scheduleFollowups([{
        leadId: "lead-1",
        type: "buyer",
        scheduledAt: future,
      }])
      expect(result).toEqual({ success: true })
    })

    it("warns about past dates but still returns success", async () => {
      const past = new Date("2020-01-01")
      const result = await scheduleFollowups([{
        leadId: "lead-past",
        type: "seller",
        scheduledAt: past,
      }])
      expect(result).toEqual({ success: true })
    })

    it("handles empty array gracefully", async () => {
      const result = await scheduleFollowups([])
      expect(result).toEqual({ success: true })
    })
  })
})
