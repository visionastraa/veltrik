import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { sellerLeadId, reason } = await request.json()

    await prisma.sellerLead.update({
      where: { id: sellerLeadId },
      data: { status: "REJECTED" },
    })

    await prisma.activityLog.create({
      data: {
        action: "Lead Rejected",
        description: reason || "Seller lead rejected",
        userId: session.user.id,
        metadata: { sellerLeadId },
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to reject" }, { status: 500 })
  }
}
