import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import InspectionFormClient from "./InspectionFormClient";

interface InspectPageProps {
  params: Promise<{ id: string }>;
}

export default async function InspectPage({ params }: InspectPageProps) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "INSPECTOR") {
    return null; // Layout handles redirect
  }

  const { id: sellerLeadId } = await params;

  // Retrieve lead and seller information
  const lead = await prisma.sellerLead.findUnique({
    where: { id: sellerLeadId },
    include: {
      seller: true,
      inspection: true,
    },
  });

  if (!lead) {
    notFound();
  }

  const vehicleName = `${lead.year} ${lead.brand} ${lead.model}`;
  const sellerName = lead.seller.name || "Unknown Seller";
  const sellerPhone = lead.seller.phone || "";

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
        initialInspection={lead.inspection}
      />
    </div>
  );
}
