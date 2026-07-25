import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !["ADMIN", "MANAGER"].includes(role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sellerLeadId, inspectorId } = body;

    if (!sellerLeadId || !inspectorId) {
      return NextResponse.json(
        { success: false, error: "sellerLeadId and inspectorId are required" },
        { status: 400 }
      );
    }

    // Check if inspection already exists
    const existing = await prisma.inspection.findUnique({
      where: { sellerLeadId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Inspection already assigned for this lead" },
        { status: 409 }
      );
    }

    // Transaction to create Inspection and update Lead status
    const result = await prisma.$transaction(async (tx) => {
      const inspection = await tx.inspection.create({
        data: {
          sellerLeadId,
          inspectorId,
        },
      });

      await tx.sellerLead.update({
        where: { id: sellerLeadId },
        data: { status: "INSPECTION_SCHEDULED" },
      });

      return inspection;
    });

    return NextResponse.json({ success: true, inspection: result });
  } catch (error) {
    console.error("[admin/inspections/assign] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign inspector" },
      { status: 500 }
    );
  }
}
