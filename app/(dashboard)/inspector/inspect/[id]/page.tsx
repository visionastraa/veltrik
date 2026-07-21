import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InspectionFormClient from "./InspectionFormClient";

interface InspectPageProps {
  params: Promise<{ id: string }>;
}

export default async function InspectPage({ params }: InspectPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null; // Layout handles redirect
  }

  const { id: sellerLeadId } = await params;

  // Retrieve lead and seller information
  const lead = await prisma.sellerLead.findUnique({
    where: { id: sellerLeadId },
    include: {
      user: true,
      inspection: true,
    },
  });

  if (!lead) {
    notFound();
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  // Access Control:
  // Only the assigned seller ("assigned user") or the assigned inspector (if created) can view this.
  // If the inspection does not exist yet, any INSPECTOR can access it to start the checklist.
  // ADMIN and MANAGER can always access.
  const isSeller = lead.userId === userId;
  const isAssignedInspector = lead.inspection ? lead.inspection.inspectorId === userId : userRole === "INSPECTOR";
  const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";

  if (!isSeller && !isAssignedInspector && !isAdminOrManager) {
    redirect(`/unauthorized?from=${encodeURIComponent(`/inspector/inspect/${sellerLeadId}`)}`);
  }

  // If the booking is in the past and has not been inspected, it is "missed" and requires admin rescheduling
  const booking = await prisma.booking.findFirst({
    where: {
      sellerLeadId,
      type: "SELLER_INSPECTION",
    },
  });

  const isMissed = booking && new Date(booking.scheduledAt).getTime() < Date.now() && !lead.inspection;
  if (isMissed && !isAdminOrManager && !isSeller) {
    redirect(`/unauthorized?from=${encodeURIComponent(`/inspector/inspect/${sellerLeadId}`)}&reason=missed`);
  }

  const vehicleName = `${lead.year} ${lead.make} ${lead.model}`;
  const sellerName = lead.user.name || "Unknown Seller";
  const sellerPhone = lead.user.phone || "";

  // The view is read-only if the user is a SELLER (owner) or an ADMIN/MANAGER (viewing checklist of another inspector)
  // or if they are an inspector but the inspection is already completed by someone else (covered by assignment check).
  const readOnly = isSeller || isAdminOrManager;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Vehicle Inspection Checklist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Currently inspecting: <strong className="text-foreground">{vehicleName}</strong> ({sellerName})
        </p>
      </div>

      <InspectionFormClient
        sellerLeadId={sellerLeadId}
        vehicleName={vehicleName}
        sellerName={sellerName}
        sellerPhone={sellerPhone}
        askingPrice={lead.expectedPrice}
        make={lead.make}
        model={lead.model}
        year={lead.year}
        photos={lead.photos}
        initialInspection={lead.inspection}
        readOnly={readOnly}
      />
    </div>
  );
}
