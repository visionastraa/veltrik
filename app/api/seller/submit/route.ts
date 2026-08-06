import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sellerLeadSchema } from "@/lib/validations/vehicle"
import { pickLeastBusyInspector, notifyInspectionAssigned } from "@/lib/inspector-assignment"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = sellerLeadSchema.parse(body)

    // Section 1: Check for duplicate vehicleNumber
    const existing = await prisma.sellerLead.findFirst({
      where: { vehicleNumber: validated.vehicleNumber }
    })
    
    if (existing) {
      return NextResponse.json({ success: false, error: "A vehicle with this registration number has already been submitted." }, { status: 409 })
    }

    // Section 2: Resolve the seller's preferred inspection slot
    let scheduledAt: Date | null = null
    if (validated.selectedDate && validated.selectedSlot) {
      scheduledAt = new Date(`${validated.selectedDate}T${validated.selectedSlot}`)
      if (Number.isNaN(scheduledAt.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid inspection slot" }, { status: 400 })
      }
      if (scheduledAt.getDay() === 0) {
        return NextResponse.json({ success: false, error: "Inspections are not available on Sundays" }, { status: 400 })
      }
      const timeInMinutes = scheduledAt.getHours() * 60 + scheduledAt.getMinutes()
      if (timeInMinutes < 10 * 60 || timeInMinutes > 17 * 60 + 30) {
        return NextResponse.json({ success: false, error: "Inspection slots are only available between 10:00 AM and 5:30 PM" }, { status: 400 })
      }
      const existingBookings = await prisma.booking.count({
        where: {
          type: "SELLER_INSPECTION",
          scheduledAt,
          status: { not: "cancelled" },
        },
      })
      if (existingBookings >= 3) {
        return NextResponse.json({ success: false, error: "This time slot is fully booked (capacity 3/3)" }, { status: 409 })
      }
    }

    const inspector = await pickLeastBusyInspector()

    const lead = await prisma.$transaction(async (tx) => {
      const created = await tx.sellerLead.create({
        data: {
          id: body.id, // Use client-generated CUID if provided
          userId: session.user.id,
          make: validated.make,
          model: validated.model,
          variant: validated.variant,
          vehicleNumber: validated.vehicleNumber,
          year: validated.year,
          kmDriven: validated.kmDriven,
          expectedPrice: validated.expectedPrice,
          description: validated.description,
          warrantyStatus: validated.warrantyStatus || "none",
          photos: JSON.stringify(validated.photos),
          status: "SUBMITTED",
          scheduledAt: scheduledAt ?? undefined,
        },
      })

      // Auto-assign to the least-busy inspector so it shows up in their queue
      if (inspector) {
        await tx.inspection.create({
          data: { sellerLeadId: created.id, inspectorId: inspector.id },
        })
      }

      // Persist the seller's chosen inspection slot so it appears on the workshop calendar
      if (scheduledAt) {
        await tx.booking.create({
          data: {
            type: "SELLER_INSPECTION",
            sellerLeadId: created.id,
            scheduledAt,
            userId: session.user.id,
            status: "confirmed",
          },
        })
      }

      if (inspector || scheduledAt) {
        await tx.sellerLead.update({
          where: { id: created.id },
          data: { status: "SCHEDULED" },
        })
      }

      return created
    })

    await prisma.activityLog.create({
      data: {
        action: "Seller Lead Created",
        description: `${validated.make} ${validated.model} submitted for selling`,
        userId: session.user.id,
        metadata: JSON.stringify({ leadId: lead.id }),
      },
    })

    if (inspector) {
      const seller = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, phone: true },
      })
      await notifyInspectionAssigned({
        inspector,
        lead: {
          id: lead.id,
          make: validated.make,
          model: validated.model,
          variant: validated.variant,
          vehicleNumber: validated.vehicleNumber,
          kmDriven: validated.kmDriven,
          year: validated.year,
          sellerName: seller?.name ?? "Seller",
          sellerPhone: seller?.phone ?? "Not provided",
        },
      })
    }

    return NextResponse.json({
      success: true,
      lead,
      inspection: inspector ? { assignedTo: inspector.id } : null,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      console.error("[seller/submit] validation failed:", (error as any).issues)
      return NextResponse.json({ success: false, error: "Validation failed", details: error.message }, { status: 400 })
    }
    console.error("[seller/submit] error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit lead" }, { status: 500 })
  }
}
