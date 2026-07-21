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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayCount, completedCount, totalAssigned, inspections] = await Promise.all([
      prisma.inspection.count({
        where: { inspectorId: session.user.id, createdAt: { gte: today } },
      }),
      prisma.inspection.count({
        where: { inspectorId: session.user.id, finalOffer: { not: null } },
      }),
      prisma.inspection.count({
        where: { inspectorId: session.user.id },
      }),
      prisma.inspection.findMany({
        where: { inspectorId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          sellerLead: { select: { make: true, model: true, variant: true, vehicleNumber: true } },
          approvedBy: { select: { name: true } },
        },
      }),
    ])

    const inProgressCount = await prisma.sellerLead.count({
      where: {
        inspection: { inspectorId: session.user.id },
        status: "SUBMITTED",
      },
    })

    const pendingCount = totalAssigned - completedCount

    return NextResponse.json({
      success: true,
      todayCount,
      completedCount,
      inProgressCount,
      pendingCount: Math.max(0, pendingCount),
      avgTime: 0,
      avgRating: 0,
      qualityScore: completedCount > 0 ? Math.round((completedCount / Math.max(totalAssigned, 1)) * 100) : 0,
      recentInspections: inspections,
    })
  } catch (error) {
    console.error("[inspector-stats] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
