import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "INSPECTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inspectorId = session.user.id;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Fetch today's inspections (Bookings of type SELLER_INSPECTION scheduled for today)
    const bookings = await prisma.booking.findMany({
      where: {
        type: "SELLER_INSPECTION",
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        sellerLead: {
          include: {
            seller: true,
            inspection: true,
          },
        },
        user: true, // The user who booked (seller)
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    // Calculate today's stats
    const todaysInspections = bookings.length;
    const completedToday = bookings.filter(
      (b) => b.sellerLead?.status === "INSPECTED" || b.sellerLead?.inspection
    ).length;
    const pending = todaysInspections - completedToday;

    // Fetch weekly total of inspections completed by this inspector
    const weeklyTotal = await prisma.inspection.count({
      where: {
        inspectorId: inspectorId as string,
        createdAt: {
          gte: weekStart,
        },
      },
    });

    // Format schedule list
    const schedule = bookings.map((b) => {
      const lead = b.sellerLead;
      const seller = lead?.seller || b.user;
      
      let status: "completed" | "in-progress" | "not-started" = "not-started";
      if (lead?.status === "INSPECTED" || lead?.inspection) {
        status = "completed";
      } else if (lead?.status === "SCHEDULED") {
        // Can represent not-started
        status = "not-started";
      }

      return {
        id: b.id,
        scheduledAt: b.scheduledAt,
        time: b.scheduledAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        sellerName: seller?.name || "Unknown Seller",
        sellerPhone: seller?.phone || "",
        vehicleName: lead ? `${lead.year} ${lead.brand} ${lead.model}` : "Unknown Vehicle",
        sellerLeadId: lead?.id || "",
        status,
      };
    });

    return NextResponse.json({
      stats: {
        todaysInspections,
        pending,
        completedToday,
        weeklyTotal,
      },
      schedule,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
