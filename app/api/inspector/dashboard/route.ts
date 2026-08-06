import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "INSPECTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inspectorId = (session.user as any).id;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // 1. Auto-reschedule missed inspections from the past (before today) to future free slots
    const missedBookings = await prisma.booking.findMany({
      where: {
        type: "SELLER_INSPECTION",
        scheduledAt: {
          lt: todayStart,
        },
      },
      include: {
        sellerLead: {
          include: {
            inspection: true,
          },
        },
      },
    });

    const pendingMissed = missedBookings.filter(
      (b) => !b.sellerLead?.inspection && b.sellerLead?.status !== "INSPECTED"
    );

    if (pendingMissed.length > 0) {
      const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18];
      
      const futureBookings = await prisma.booking.findMany({
        where: {
          type: "SELLER_INSPECTION",
          scheduledAt: {
            gte: todayStart,
          },
        },
        select: {
          scheduledAt: true,
        },
      });

      const occupiedSlots = new Set(
        futureBookings.map((b) => b.scheduledAt.getTime())
      );

      let checkDate = new Date(todayStart);
      
      for (const booking of pendingMissed) {
        let found = false;
        while (!found) {
          checkDate.setDate(checkDate.getDate() + 1);
          
          for (const hour of hours) {
            const slotTime = new Date(checkDate);
            slotTime.setHours(hour, 0, 0, 0);
            
            if (!occupiedSlots.has(slotTime.getTime())) {
              await prisma.booking.update({
                where: { id: booking.id },
                data: { scheduledAt: slotTime },
              });
              occupiedSlots.add(slotTime.getTime());
              found = true;
              break;
            }
          }
        }
      }
    }

    // Fetch all inspections assigned to this inspector (inspection-driven,
    // so assignments show up even before the seller schedules a booking)
    const inspections = await prisma.inspection.findMany({
      where: {
        inspectorId: inspectorId as string,
      },
      include: {
        sellerLead: {
          include: {
            user: true,
            bookings: {
              where: { type: "SELLER_INSPECTION", status: { not: "cancelled" } },
              orderBy: { scheduledAt: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Today's stats based on inspections that have a booking scheduled today
    const todayBooked = inspections.filter((insp) => {
      const booking = insp.sellerLead?.bookings?.[0];
      return booking && booking.scheduledAt >= todayStart && booking.scheduledAt <= todayEnd;
    });
    const todaysInspections = todayBooked.length;
    const completedToday = todayBooked.filter(
      (insp) => ["INSPECTED", "ACQUIRED", "REJECTED"].includes(insp.sellerLead?.status || "")
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

    // Format schedule list (all assigned inspections; booked ones show their slot time)
    const schedule = inspections
      .map((insp) => {
        const lead = insp.sellerLead;
        const seller = lead?.user;
        const booking = lead?.bookings?.[0];
        const scheduledAt = booking?.scheduledAt ?? null;

        let status: "completed" | "in-progress" | "not-started" | "missed" = "not-started";
        if (lead?.status === "INSPECTED" || lead?.status === "ACQUIRED" || lead?.status === "REJECTED") {
          status = "completed";
        } else if (scheduledAt && new Date(scheduledAt).getTime() < Date.now()) {
          status = "missed";
        } else if (lead?.status === "SCHEDULED" || lead?.status === "INSPECTION_SCHEDULED" || lead?.status === "SUBMITTED") {
          status = "not-started";
        }

        return {
          id: insp.id,
          scheduledAt,
          time: scheduledAt
            ? scheduledAt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "Pending",
          sellerName: seller?.name || "Unknown Seller",
          sellerPhone: seller?.phone || "",
          vehicleName: lead ? `${lead.year} ${lead.make} ${lead.model}` : "Unknown Vehicle",
          sellerLeadId: lead?.id || "",
          status,
        };
      })
      .sort((a, b) => {
        if (!a.scheduledAt && !b.scheduledAt) return 0;
        if (!a.scheduledAt) return 1;
        if (!b.scheduledAt) return -1;
        return a.scheduledAt.getTime() - b.scheduledAt.getTime();
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
