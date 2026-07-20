import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum(["LEAD_VISIT_SCHEDULED", "FOLLOW_UP_REQUIRED", "CONVERTED", "LOST"]).optional(),
  action: z.enum(["view", "schedule", "message", "convert", "lost"]).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    const { status, action } = parsed.data
    const updateData: Record<string, any> = {}

    if (status) updateData.status = status
    if (action === "convert") updateData.status = "CONVERTED"
    if (action === "lost") updateData.status = "LOST"

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No updates provided" }, { status: 400 })
    }

    const lead = await prisma.buyerLead.update({
      where: { id },
      data: updateData,
    })

    await prisma.activityLog.create({
      data: {
        action: `BuyerLead ${action || "updated"}`,
        description: `Buyer lead ${id} updated to ${updateData.status || "unknown"}`,
        userId: session.user.id,
        metadata: { leadId: id, updateData },
      },
    })

    return NextResponse.json({ success: true, data: lead })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update buyer lead" }, { status: 500 })
  }
}
