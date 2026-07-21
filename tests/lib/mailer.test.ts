import { describe, it, expect, vi } from "vitest"
import { sendEmail, buildWelcomeEmail, buildBookingConfirmationEmail, buildPaymentReceiptEmail } from "@/lib/mailer"

describe("mailer", () => {
  describe("buildWelcomeEmail", () => {
    it("returns HTML with user name", () => {
      const html = buildWelcomeEmail("John")
      expect(html).toContain("John")
      expect(html).toContain("Welcome")
      expect(html).toContain("Veltrik")
    })
  })

  describe("buildBookingConfirmationEmail", () => {
    it("returns HTML with vehicle and date", () => {
      const html = buildBookingConfirmationEmail("Jane", "Ola S1 Pro", "1 Jan 2026")
      expect(html).toContain("Jane")
      expect(html).toContain("Ola S1 Pro")
      expect(html).toContain("1 Jan 2026")
      expect(html).toContain("Confirmed")
    })
  })

  describe("buildPaymentReceiptEmail", () => {
    it("returns HTML with amount and order ID", () => {
      const html = buildPaymentReceiptEmail("Bob", 15000000, "order_123")
      expect(html).toContain("Bob")
      expect(html).toContain("150,000")
      expect(html).toContain("order_123")
    })
  })

  describe("sendEmail (SMTP)", () => {
    it("returns success false with message when SMTP not configured", async () => {
      process.env.SMTP_HOST = ""
      const result = await sendEmail({
        to: "test@test.com",
        subject: "Test",
        html: "<p>Test</p>",
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain("SMTP not configured")
    })

    it("returns success false when SMTP host is undefined", async () => {
      delete process.env.SMTP_HOST
      const result = await sendEmail({
        to: "test@test.com",
        subject: "Test",
        html: "<p>Test</p>",
      })
      expect(result.success).toBe(false)
    })
  })
})
