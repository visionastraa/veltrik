import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId, amount } = await request.json()

    // Razorpay integration placeholder
    // In production, use razorpay npm package
    const orderId = `order_${Date.now()}`

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
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}
