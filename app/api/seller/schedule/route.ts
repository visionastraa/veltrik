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

    const lead = await prisma.sellerLead.update({
      where: { id: sellerLeadId },
      data: {
        status: "SCHEDULED",
        scheduledAt: new Date(scheduledAt),
      },
    })

    await prisma.booking.create({
      data: {
        type: "SELLER_INSPECTION",
        sellerLeadId,
        scheduledAt: new Date(scheduledAt),
        userId: session.user.id,
        status: "confirmed",
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to schedule" }, { status: 500 })
  }
}
