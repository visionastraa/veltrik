import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session || !["ADMIN", "MANAGER"].includes(role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      acquiredThisMonth,
      activeListings,
      pendingInspections,
      buyerLeads,
      followUpRequired,
      recentActivitySeller,
      recentActivityBuyer
    ] = await Promise.all([
      prisma.sellerLead.count({
        where: {
          status: "ACQUIRED",
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.listing.count({
        where: { status: "AVAILABLE" },
      }),
      prisma.sellerLead.count({
        where: { status: "SCHEDULED" },
      }),
      prisma.buyerLead.count(),
      prisma.buyerLead.count({
        where: { status: "FOLLOW_UP_REQUIRED" },
      }),
      prisma.sellerLead.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { seller: { select: { name: true } } }
      }),
      prisma.buyerLead.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { buyer: { select: { name: true } } }
      })
    ]);

    // Combine and sort recent activity
    const activity = [
      ...recentActivitySeller.map((l: any) => ({
        id: l.id,
        type: 'SELLER',
        title: `${l.make} ${l.model}`,
        user: l.seller.name || 'Unknown',
        status: l.status,
        date: l.updatedAt
      })),
      ...recentActivityBuyer.map((l: any) => ({
        id: l.id,
        type: 'BUYER',
        title: 'Interest shown',
        user: l.buyer.name || 'Unknown',
        status: l.status,
        date: l.updatedAt
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    return NextResponse.json({
      stats: {
        acquiredThisMonth,
        activeListings,
        pendingInspections,
        buyerLeads,
        followUpRequired,
      },
      activity,
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
