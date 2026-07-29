import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "INSPECTOR") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const inspection = await prisma.inspection.findFirst({
      where: { id, inspectorId: session.user.id },
      include: {
        sellerLead: {
          select: {
            id: true, make: true, model: true, variant: true,
            vehicleNumber: true, year: true, kmDriven: true,
            expectedPrice: true, photos: true, status: true,
            user: { select: { name: true, email: true } },
          },
        },
        approvedBy: { select: { name: true, email: true } },
        listing: { select: { id: true, title: true, price: true, status: true } },
      },
    })

    if (!inspection) {
      return NextResponse.json({ success: false, error: "Inspection not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: inspection })
  } catch (error) {
    console.error("[inspector-inspection] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch inspection" }, { status: 500 })
  }
}
