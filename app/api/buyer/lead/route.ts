import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buyerLeadSchema } from "@/lib/validations/vehicle"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = buyerLeadSchema.parse(body)

    const lead = await prisma.buyerLead.create({
      data: {
        userId: session.user.id,
        listingId: validated.listingId,
        brandsInterested: JSON.stringify(validated.brandsInterested),
        modelsInterested: JSON.stringify(validated.modelsInterested),
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create buyer lead" }, { status: 500 })
  }
}
