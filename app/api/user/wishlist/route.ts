import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
          include: { inspection: { include: { sellerLead: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const data = wishlistItems.map((w) => w.listing)

    return NextResponse.json({ success: true, data })
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

    const existing = await prisma.wishlist.findFirst({
      where: { userId: session.user.id, listingId: vehicleId },
    })

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } })
      return NextResponse.json({ success: true, wishlisted: false })
    }

    await prisma.wishlist.create({
      data: { userId: session.user.id, listingId: vehicleId },
    })

    return NextResponse.json({ success: true, wishlisted: true })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 })
  }
}
