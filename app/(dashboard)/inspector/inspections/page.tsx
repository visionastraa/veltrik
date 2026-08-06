import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QueueTable from "@/components/inspector/QueueTable";

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "INSPECTOR") return null;

  // Fetch all inspections assigned to this inspector (inspection-driven,
  // so newly assigned leads appear even before a booking slot is scheduled)
  const inspections = await prisma.inspection.findMany({
    where: {
      inspectorId: session.user.id,
      sellerLead: {
        status: {
          in: ["SCHEDULED", "SUBMITTED", "INSPECTION_SCHEDULED"],
        },
      },
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
    orderBy: {
      createdAt: "desc",
    },
  });

  const bookings = inspections.map((insp) => ({
    id: insp.id,
    booked: !!insp.sellerLead?.bookings?.[0],
    scheduledAt: insp.sellerLead?.bookings?.[0]?.scheduledAt ?? insp.createdAt,
    sellerLead: insp.sellerLead,
    user: insp.sellerLead?.user ?? null,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Inspection Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and filter inspections assigned to the workshop.
        </p>
      </div>

      <QueueTable bookings={bookings} />
    </div>
  );
}
