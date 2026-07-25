import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QueueTable from "@/components/inspector/QueueTable";

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "INSPECTOR") return null;

  // Fetch all pending inspection bookings
  const bookings = await prisma.booking.findMany({
    where: {
      type: "SELLER_INSPECTION",
      sellerLead: {
        status: {
          in: ["SCHEDULED", "SUBMITTED", "INSPECTION_SCHEDULED"],
        },
        inspection: {
          inspectorId: session.user.id,
        },
      },
    },
    include: {
      sellerLead: {
        include: {
          user: true,
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
