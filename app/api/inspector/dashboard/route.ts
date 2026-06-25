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

    // Filter out bookings that have inspections assigned to other inspectors
    const myBookings = bookings.filter((b) => {
      const inspection = b.sellerLead?.inspection;
      if (inspection && inspection.inspectorId !== inspectorId) {
        return false;
      }
      return true;
    });

    // Calculate today's stats
    const todaysInspections = myBookings.length;
    const completedToday = myBookings.filter(
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
    const schedule = myBookings.map((b) => {
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
