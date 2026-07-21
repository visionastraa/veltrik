import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const adminId = (session?.user as any)?.id;

    if (!session || !["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inspectionId } = body;

    if (!inspectionId) {
      return NextResponse.json({ error: "Missing inspectionId" }, { status: 400 });
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.inspection.update({
        where: { id: inspectionId },
        data: {
          approvedBy: adminId,
          approvedAt: new Date(),
        }
      });

      await tx.sellerLead.update({
        where: { id: inspection.sellerLeadId },
        data: { status: "REJECTED" }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_REJECT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
