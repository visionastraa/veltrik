import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { emitToUser } from "@/lib/socket-emitter"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing payment fields" }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json({ success: false, error: "Razorpay not configured" }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex")

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature)
    )

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 })
    }

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

    await prisma.activityLog.create({
      data: {
        action: "Payment Completed",
        description: `Payment of ₹${(payment.amount).toLocaleString()} completed`,
        userId: session.user.id,
        metadata: JSON.stringify({ paymentId: payment.id, razorpayPaymentId }),
      },
    })

    emitToUser(session.user.id, "notification:new", {
      type: "payment",
      title: "Payment Successful",
      message: `Payment of ₹${(payment.amount).toLocaleString()} completed successfully.`,
    })

    return NextResponse.json({ success: true, payment })
  } catch (error) {
    console.error("[razorpay] verify error:", error)
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}
