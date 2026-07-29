import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { inspection: true }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Change Listing status to PULLED
      await tx.listing.update({
        where: { id },
        data: { status: "PULLED" }
      });

      // 2. Rollback SellerLead status to INSPECTED
      if (listing.inspection?.sellerLeadId) {
        await tx.sellerLead.update({
          where: { id: listing.inspection.sellerLeadId },
          data: { status: "INSPECTED" }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_UNPUBLISH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
