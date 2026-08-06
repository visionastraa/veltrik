export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpHost = process.env.SMTP_HOST
    if (!smtpHost) {
      console.warn("[mailer] SMTP not configured. Skipping email to", payload.to)
      return { success: false, error: "SMTP not configured" }
    }

    const nodemailer = await import("nodemailer")
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_USER || "noreply@veltrik.com",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[mailer] Failed to send email:", message)
    return { success: false, error: message }
  }
}

export function buildWelcomeEmail(name: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:auto"><h1>Welcome to Veltrik, ${name}!</h1><p>You're now ready to buy or sell EVs on India's trusted marketplace.</p></div>`
}

export function buildBookingConfirmationEmail(name: string, vehicle: string, date: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:auto"><h1>Booking Confirmed</h1><p>Hi ${name},</p><p>Your test drive for <strong>${vehicle}</strong> on <strong>${date}</strong> is confirmed.</p></div>`
}

export function buildPaymentReceiptEmail(name: string, amount: number, orderId: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:auto"><h1>Payment Receipt</h1><p>Hi ${name},</p><p>Your payment of ₹${(amount / 100).toLocaleString("en-IN")} for order <strong>${orderId}</strong> was successful.</p></div>`
}
