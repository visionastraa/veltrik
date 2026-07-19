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

    const { listingId, buyerLeadId, scheduledAt } = await request.json()

    const booking = await prisma.booking.create({
      data: {
        type: "BUYER_VISIT",
        listingId,
        buyerLeadId,
        scheduledAt: new Date(scheduledAt),
        userId: session.user.id,
        status: "confirmed",
      },
      include: { listing: true },
    })

    return NextResponse.json({ success: true, booking })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}
