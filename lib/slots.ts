import { prisma } from "@/lib/prisma";

const BASE_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "17:30",
];

/**
 * Get available booking slots for a given date.
 *
 * - Returns [] if the date is a Sunday.
 * - Removes any slot where 3 or more bookings already exist
 *   for that exact date and time.
 */
export async function getAvailableSlots(date: string): Promise<string[]> {
  const dateObj = new Date(date);

  // Sunday = 0
  if (dateObj.getUTCDay() === 0) {
    return [];
  }

  // Build start/end of the day for querying
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  // Get all bookings for this date
  const bookings = await prisma.booking.findMany({
    where: {
      scheduledAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    select: {
      scheduledAt: true,
    },
  });

  // Count bookings per slot
  const slotCounts = new Map<string, number>();

  for (const booking of bookings) {
    const hours = booking.scheduledAt.getUTCHours().toString().padStart(2, "0");
    const minutes = booking.scheduledAt.getUTCMinutes().toString().padStart(2, "0");
    const timeKey = `${hours}:${minutes}`;

    slotCounts.set(timeKey, (slotCounts.get(timeKey) || 0) + 1);
  }

  // Filter out slots with >= 3 bookings
  return BASE_SLOTS.filter((slot) => {
    const count = slotCounts.get(slot) || 0;
    return count < 3;
  });
}
