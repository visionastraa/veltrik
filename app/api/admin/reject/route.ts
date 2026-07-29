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
      include: {
        sellerLead: {
          include: { user: true }
        }
      }
    });

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.inspection.update({
        where: { id: inspectionId },
        data: {
          approvedById: adminId,
          approvedAt: new Date(),
        }
      });

      await tx.sellerLead.update({
        where: { id: inspection.sellerLeadId },
        data: { status: "REJECTED" }
      });
    });

    try {
      const { sendEmail } = await import('@/lib/email');
      const sellerId = inspection.sellerLead.userId;
      const user = inspection.sellerLead.user;

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `Update on your vehicle: ${inspection.sellerLead.make} ${inspection.sellerLead.model}`,
          html: `
            <h3>Thank you for choosing Veltrik.</h3>
            <p>After reviewing the inspection report for your <strong>${inspection.sellerLead.make} ${inspection.sellerLead.model} (${inspection.sellerLead.year})</strong>, we regret to inform you that we are unable to make an offer at this time.</p>
            <p>This decision is based on our current market criteria and the inspection results.</p>
            <p>We appreciate your time and wish you the best in selling your vehicle.</p>
          `,
          userId: sellerId,
          type: "INSPECTION_REJECTED",
        });
      }

      await prisma.notificationLog.create({
        data: {
          userId: sellerId,
          type: "INSPECTION_REJECTED",
          channel: "IN_APP",
          status: "SENT",
          payload: JSON.stringify({ 
            title: "Vehicle Not Selected", 
            message: `We are unable to make an offer for your ${inspection.sellerLead.make} at this time.` 
          }),
        },
      });
    } catch (notificationError) {
      console.error("[Admin Reject] Failed to send notifications:", notificationError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_REJECT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
