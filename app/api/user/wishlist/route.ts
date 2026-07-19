import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Simple wishlist stored as JSON in a metadata field
// In production, use a dedicated Wishlist model

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activityLogs: true },
    })

    // Get wishlist from activity logs
    const wishlistLog = user?.activityLogs.find((l) => l.action === "WISHLIST")
    const vehicleIds = (wishlistLog?.metadata as { vehicleIds?: string[] } | null)?.vehicleIds || []

    if (vehicleIds.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const vehicles = await prisma.listing.findMany({
      where: { id: { in: vehicleIds } },
      include: { inspection: { include: { sellerLead: true } } },
    })

    return NextResponse.json({ success: true, data: vehicles })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { vehicleId } = await request.json()

    // Get current wishlist
    const existing = await prisma.activityLog.findFirst({
      where: { userId: session.user.id, action: "WISHLIST" },
    })

    const currentIds = (existing?.metadata as { vehicleIds?: string[] } | null)?.vehicleIds || []
    const newIds = currentIds.includes(vehicleId)
      ? currentIds.filter((id: string) => id !== vehicleId)
      : [...currentIds, vehicleId]

    if (existing) {
      await prisma.activityLog.update({
        where: { id: existing.id },
        data: { metadata: { vehicleIds: newIds } },
      })
    } else {
      await prisma.activityLog.create({
        data: {
          action: "WISHLIST",
          description: "User wishlist",
          userId: session.user.id,
          metadata: { vehicleIds: newIds },
        },
      })
    }

    return NextResponse.json({ success: true, vehicleIds: newIds })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 })
  }
}
