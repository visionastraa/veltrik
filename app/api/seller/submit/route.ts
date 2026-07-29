import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sellerLeadSchema } from "@/lib/validations/vehicle"

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

    const lead = await prisma.sellerLead.create({
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
      },
    })

    await prisma.activityLog.create({
      data: {
        action: "Seller Lead Created",
        description: `${validated.make} ${validated.model} submitted for selling`,
        userId: session.user.id,
        metadata: JSON.stringify({ leadId: lead.id }),
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to submit lead" }, { status: 500 })
  }
}
