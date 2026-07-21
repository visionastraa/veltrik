import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const [totalLeads, totalListings, totalInspections, revenueResult, recentActivity, recentListings] = await Promise.all([
      prisma.sellerLead.count(),
      prisma.listing.count({ where: { status: "AVAILABLE" } }),
      prisma.inspection.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      }),
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { inspection: { include: { sellerLead: true } } },
      }),
    ])

    return NextResponse.json({
      success: true,
      totalLeads,
      totalListings,
      totalInspections,
      totalRevenue: revenueResult._sum.amount || 0,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        description: a.description,
        createdAt: a.createdAt,
        type: "info" as const,
      })),
      recentListings: recentListings.map((l) => ({
        id: l.id,
        title: `${l.inspection?.sellerLead?.year} ${l.inspection?.sellerLead?.make} ${l.inspection?.sellerLead?.model}`,
        price: l.price,
        status: l.status,
        createdAt: l.createdAt,
      })),
    })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
