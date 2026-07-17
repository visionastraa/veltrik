import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import QueueTable from "@/components/inspector/QueueTable";

export default async function InspectionsPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "INSPECTOR") return null;

  // Fetch all pending inspection bookings
  const bookings = await prisma.booking.findMany({
    where: {
      type: "SELLER_INSPECTION",
      sellerLead: {
        status: {
          in: ["SCHEDULED", "SUBMITTED"],
        },
      },
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
          Inspection Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and filter scheduled inspections assigned to the workshop.
        </p>
      </div>

      <QueueTable bookings={bookings} />
    </div>
  );
}
