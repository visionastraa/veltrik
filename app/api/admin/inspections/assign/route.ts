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
        include: {
          sellerLead: {
            include: {
              user: true
            }
          },
          inspector: true
        }
      });

      await tx.sellerLead.update({
        where: { id: sellerLeadId },
        data: { status: "SCHEDULED" },
      });

      return inspection;
    });

    // Notifications
    try {
      const { sellerLead, inspector } = result;
      const { sendEmail } = await import('@/lib/email');
      
      // Send Email to Inspector
      await sendEmail({
        to: inspector.email,
        subject: `New Inspection Assigned: ${sellerLead.make} ${sellerLead.model}`,
        html: `
          <h3>You have been assigned a new vehicle for inspection</h3>
          <p><strong>Vehicle:</strong> ${sellerLead.make} ${sellerLead.model} ${sellerLead.variant} (${sellerLead.year})</p>
          <p><strong>Reg No:</strong> ${sellerLead.vehicleNumber}</p>
          <p><strong>Driven:</strong> ${sellerLead.kmDriven} km</p>
          <p><strong>Seller:</strong> ${sellerLead.user.name}</p>
          <p><strong>Phone:</strong> ${sellerLead.user.phone || 'Not provided'}</p>
          <p>Please log in to your inspector dashboard to view more details.</p>
        `,
        userId: inspector.id,
        type: "INSPECTION_ASSIGNED",
      });

      // Create IN_APP notification
      await prisma.notificationLog.create({
        data: {
          userId: inspector.id,
          type: "INSPECTION_ASSIGNED",
          channel: "IN_APP",
          status: "SENT",
          payload: JSON.stringify({ 
            title: "New Assignment", 
            message: `You have been assigned to inspect ${sellerLead.make} ${sellerLead.model}` 
          }),
        },
      });
    } catch (notificationError) {
      console.error("[Assign] Failed to send notifications:", notificationError);
    }

    return NextResponse.json({ success: true, inspection: result });
  } catch (error) {
    console.error("[admin/inspections/assign] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign inspector" },
      { status: 500 }
    );
  }
}
