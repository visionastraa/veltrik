import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inspectionSubmitSchema } from "@/lib/validations/inspection"
import { emitToUser } from "@/lib/socket-emitter"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = inspectionSubmitSchema.parse(body)

    // 1. Fetch existing inspection and verify ownership + lock
    const existingInspection = await prisma.inspection.findUnique({
      where: { sellerLeadId: validated.sellerLeadId }
    })

    if (!existingInspection) {
      return NextResponse.json({ success: false, error: "Inspection not found" }, { status: 404 })
    }

    if (existingInspection.inspectorId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden: Not assigned to you" }, { status: 403 })
    }

    if (existingInspection.inspectionComplete) {
      return NextResponse.json({ success: false, error: "Inspection already submitted and locked." }, { status: 403 })
    }

    const inspectionData = {
      ageYears: validated.ageYears,
      ageMonths: validated.ageMonths,
      kmDriven: validated.kmDriven,
      bodyDamage: validated.bodyDamage,
      bodyDamagePhoto: validated.bodyDamagePhoto,
      forkDamage: validated.forkDamage,
      accidentHistory: validated.accidentHistory,
      warrantyStatus: validated.warrantyStatus,
      warrantyType: validated.warrantyType,
      warrantyExpiry: validated.warrantyExpiry ? new Date(validated.warrantyExpiry) : undefined,
      partsReplaced: validated.partsReplaced,
      replacedParts: validated.replacedParts,
      adminComments: validated.adminComments,
      batteryCharge: validated.batteryCharge,
      batteryHealth: validated.batteryHealth,
      batteryVoltage: validated.batteryVoltage,
      physicalDamage: validated.physicalDamage,
      brakeSystem: validated.brakeSystem,
      brakePads: validated.brakePads,
      wheelAlignment: validated.wheelAlignment,
      testDriveRating: validated.testDriveRating,
      testDriveNotes: validated.testDriveNotes,
      techComments: validated.techComments,
      finalOffer: validated.finalOffer,
      inspectionComplete: true, // Mark as complete
    };

    // 2. Transaction
    const inspection = await prisma.$transaction(async (tx) => {
      const updated = await tx.inspection.update({
        where: { sellerLeadId: validated.sellerLeadId },
        data: inspectionData,
      })

      await tx.sellerLead.update({
        where: { id: validated.sellerLeadId },
        data: { status: "INSPECTED" },
      })

      return updated
    })

    // 3. Admin Notification
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } })
    for (const admin of admins) {
      await prisma.notificationLog.create({
        data: {
          userId: admin.id,
          type: "INSPECTION_COMPLETED",
          channel: "IN_APP",
          status: "SENT",
          payload: JSON.stringify({ 
            title: "Inspection Completed", 
            message: `An inspection report has been submitted and is ready for review.` 
          })
        }
      })
    }

    const sellerLead = await prisma.sellerLead.findUnique({
      where: { id: validated.sellerLeadId },
      select: { userId: true },
    })

    await prisma.activityLog.create({
      data: {
        action: "Inspection Submitted",
        description: `Inspection completed for seller lead`,
        userId: session.user.id,
        metadata: JSON.stringify({ inspectionId: inspection.id, sellerLeadId: validated.sellerLeadId }),
      },
    })

    if (sellerLead?.userId) {
      emitToUser(sellerLead.userId, "notification:new", {
        type: "inspection",
        title: "Inspection Submitted",
        message: "Your vehicle inspection has been submitted for review.",
      })
    }

    return NextResponse.json({ success: true, inspection })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to submit inspection" }, { status: 500 })
  }
}
