import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitToUser } from "@/lib/socket-emitter"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { inspectionId, offerPrice } = await request.json()

    const inspection = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        finalOffer: offerPrice,
        approvedById: session.user.id,
        approvedAt: new Date(),
      },
      include: { sellerLead: true },
    })

    await prisma.sellerLead.update({
      where: { id: inspection.sellerLeadId },
      data: { status: "ACQUIRED" },
    })

    const listing = await prisma.listing.create({
      data: {
        inspectionId,
        title: `${inspection.sellerLead.year} ${inspection.sellerLead.make} ${inspection.sellerLead.model} ${inspection.sellerLead.variant}`,
        price: offerPrice,
        photos: inspection.sellerLead.photos,
        publishedAt: new Date(),
      },
    })

    const sellerLead = await prisma.sellerLead.findUnique({
      where: { id: inspection.sellerLeadId },
      select: { userId: true },
    })

    await prisma.activityLog.create({
      data: {
        action: "Vehicle Approved & Listed",
        description: `Approved and listed for ${offerPrice}`,
        userId: session.user.id,
        metadata: { inspectionId, listingId: listing.id },
      },
    })

    if (sellerLead?.userId) {
      emitToUser(sellerLead.userId, "notification:new", {
        type: "approved",
        title: "Vehicle Approved",
        message: `Your ${listing.title} has been approved and listed at ₹${(offerPrice / 100000).toFixed(2)}L.`,
      })
    }

    return NextResponse.json({ success: true, inspection, listing })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to approve" }, { status: 500 })
  }
}
