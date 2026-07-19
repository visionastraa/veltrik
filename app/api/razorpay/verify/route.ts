import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json()

    // In production, verify signature using crypto
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    //   .update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex')

    const payment = await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: "paid",
      },
    })

    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "paid" },
      })
    }

    return NextResponse.json({ success: true, payment })
  } catch {
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}
