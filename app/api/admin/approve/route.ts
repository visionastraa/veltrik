import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const adminId = (session?.user as any)?.id;

    // Only Managers can approve (project.md: "MANAGER role required to approve/reject")
    if (!session || !["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inspectionId, finalOffer } = body;

    if (!inspectionId || !finalOffer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: { sellerLead: true }
    });

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    if (inspection.sellerLead.status === "ACQUIRED") {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // Transaction to update inspection, lead, and create listing
    await prisma.$transaction(async (tx) => {
      // 1. Update Inspection with offer
      await tx.inspection.update({
        where: { id: inspectionId },
        data: {
          finalOffer: parseFloat(finalOffer),
          approvedById: adminId,
          approvedAt: new Date(),
        }
      });

      // 2. Update Seller Lead Status
      await tx.sellerLead.update({
        where: { id: inspection.sellerLeadId },
        data: { status: "ACQUIRED" }
      });

      // 3. Create Listing (title: Make Model Year)
      await tx.listing.create({
        data: {
          inspectionId: inspection.id,
          title: `${inspection.sellerLead.make} ${inspection.sellerLead.model} ${inspection.sellerLead.year}`,
          price: parseFloat(finalOffer),
          status: "AVAILABLE",
          photos: inspection.sellerLead.photos, // Carry over photos for the listing
          publishedAt: new Date(),
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_APPROVE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
