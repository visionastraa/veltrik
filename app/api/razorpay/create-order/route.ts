import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Razorpay from "razorpay"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId, amount } = await request.json()

    if (!bookingId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid booking ID or amount" }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      // Return a simulated order ID for development testing when Razorpay credentials are not set
      console.warn("[razorpay] RAZORPAY_KEY_ID / SECRET not configured. Returning test order.")
      const orderId = `order_dev_${Date.now()}`
      const payment = await prisma.payment.create({
        data: {
          razorpayOrderId: orderId,
          amount,
          bookingId,
          userId: session.user.id,
          status: "created",
        },
      })
      return NextResponse.json({
        success: true,
        orderId: payment.razorpayOrderId,
        amount: payment.amount,
        key: keyId || "rzp_test_mock",
      })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `booking_${bookingId}_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    const payment = await prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount,
        bookingId,
        userId: session.user.id,
        status: "created",
      },
    })

    return NextResponse.json({
      success: true,
      orderId: payment.razorpayOrderId,
      amount: payment.amount,
      key: keyId,
    })
  } catch (error) {
    console.error("[razorpay] create-order error:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}
