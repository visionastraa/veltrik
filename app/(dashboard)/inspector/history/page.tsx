import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HistoryTable from "@/components/inspector/HistoryTable";

export default async function HistoryPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "INSPECTOR") return null;

  const inspectorId = session.user.id;

  // Fetch all completed inspections by this inspector
  const inspections = await prisma.inspection.findMany({
    where: {
      inspectorId: inspectorId as string,
    },
    include: {
      sellerLead: {
        include: {
          seller: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Inspection History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, search, and filter all vehicle inspections completed by you.
        </p>
      </div>

      <HistoryTable inspections={inspections} />
    </div>
  );
}
