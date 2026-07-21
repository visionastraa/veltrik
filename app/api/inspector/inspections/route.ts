import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "INSPECTOR") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const inspections = await prisma.inspection.findMany({
      where: { inspectorId: session.user.id },
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: inspections })
  } catch (error) {
    console.error("[inspector-inspections] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch inspections" }, { status: 500 })
  }
}
