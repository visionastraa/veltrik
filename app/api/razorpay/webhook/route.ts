import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const text = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret || !signature) {
      return NextResponse.json({ success: false, error: "Webhook not configured" }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(text)
      .digest("hex")

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 })
    }

    const payload = JSON.parse(text)
    const event = payload.event

    if (event === "payment.captured") {
      const paymentData = payload.payload.payment.entity
      const orderId = paymentData.order_id

      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      })

      if (payment && payment.status !== "paid") {
        await prisma.payment.update({
          where: { razorpayOrderId: orderId },
          data: {
            razorpayPaymentId: paymentData.id,
            status: "paid",
          },
        })

        if (payment.bookingId) {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "paid" },
          })
        }
      }
    }

    if (event === "payment.failed") {
      const paymentData = payload.payload.payment.entity
      const orderId = paymentData.order_id

      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "failed" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[razorpay] webhook error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}
