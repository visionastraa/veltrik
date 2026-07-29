import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitToUser } from "@/lib/socket-emitter"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "INSPECTOR") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { sellerLeadId, reason } = body

    if (!sellerLeadId || !reason) {
      return NextResponse.json({ success: false, error: "sellerLeadId and reason are required" }, { status: 400 })
    }

    const existingInspection = await prisma.inspection.findUnique({
      where: { sellerLeadId }
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

    await prisma.$transaction(async (tx) => {
      await tx.inspection.update({
        where: { id: existingInspection.id },
        data: {
          adminComments: `Rejected On-Site. Reason: ${reason}`,
          inspectionComplete: true
        }
      })

      await tx.sellerLead.update({
        where: { id: sellerLeadId },
        data: { status: "REJECTED" }
      })
    })

    const sellerLead = await prisma.sellerLead.findUnique({
      where: { id: sellerLeadId },
      select: { userId: true },
    })

    if (sellerLead?.userId) {
      emitToUser(sellerLead.userId, "notification:new", {
        type: "inspection_rejected",
        title: "Vehicle Rejected",
        message: "Your vehicle did not pass the on-site inspection criteria.",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[inspector/reject] error:", error)
    return NextResponse.json({ success: false, error: "Failed to reject vehicle" }, { status: 500 })
  }
}
