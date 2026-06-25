import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GoogleCalendarView from "@/components/inspector/GoogleCalendarView";

export default async function CalendarPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "INSPECTOR") return null;

  // Fetch all scheduled inspections
  const bookings = await prisma.booking.findMany({
    where: {
      type: "SELLER_INSPECTION",
    },
    include: {
      sellerLead: {
        include: {
          seller: true,
        },
      },
      user: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Hub Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Workshop timeline and time blocks in Google Calendar style.
        </p>
      </div>

      <GoogleCalendarView bookings={bookings} />
    </div>
  );
}
