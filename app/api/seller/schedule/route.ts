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

    const { sellerLeadId, scheduledAt } = await request.json()

    if (!sellerLeadId || !scheduledAt) {
      return NextResponse.json({ success: false, error: "sellerLeadId and scheduledAt are required" }, { status: 400 })
    }

    const targetDate = new Date(scheduledAt)

    // 1. Block Sundays (getDay() === 0)
    if (targetDate.getDay() === 0) {
      return NextResponse.json({ success: false, error: "Inspections are not available on Sundays" }, { status: 400 })
    }

    // 2. Block times before 10:00 and after 17:30
    const hours = targetDate.getHours()
    const minutes = targetDate.getMinutes()
    const timeInMinutes = hours * 60 + minutes
    if (timeInMinutes < 10 * 60 || timeInMinutes > 17 * 60 + 30) {
      return NextResponse.json({ success: false, error: "Inspection slots are only available between 10:00 AM and 5:30 PM" }, { status: 400 })
    }

    // 3. Workshop capacity check (max 3 per slot)
    const existingBookings = await prisma.booking.count({
      where: {
        type: "SELLER_INSPECTION",
        scheduledAt: targetDate,
        status: { not: "cancelled" },
      },
    })

    if (existingBookings >= 3) {
      return NextResponse.json({ success: false, error: "This time slot is fully booked (capacity 3/3)" }, { status: 409 })
    }

    const lead = await prisma.sellerLead.update({
      where: { id: sellerLeadId },
      data: {
        status: "SCHEDULED",
        scheduledAt: targetDate,
      },
    })

    await prisma.booking.create({
      data: {
        type: "SELLER_INSPECTION",
        sellerLeadId,
        scheduledAt: targetDate,
        userId: session.user.id,
        status: "confirmed",
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error("[seller/schedule] error:", error)
    return NextResponse.json({ success: false, error: "Failed to schedule" }, { status: 500 })
  }
}
