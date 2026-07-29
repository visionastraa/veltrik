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

    const existingLead = await prisma.buyerLead.findFirst({
      where: { userId: session.user.id }
    });

    let lead;
    if (existingLead) {
      const existingBrands = JSON.parse(existingLead.brandsInterested || "[]");
      const existingModels = JSON.parse(existingLead.modelsInterested || "[]");
      
      const newBrands = Array.from(new Set([...existingBrands, ...(validated.brandsInterested || [])]));
      const newModels = Array.from(new Set([...existingModels, ...(validated.modelsInterested || [])]));

      lead = await prisma.buyerLead.update({
        where: { id: existingLead.id },
        data: {
          listingId: validated.listingId || existingLead.listingId,
          brandsInterested: JSON.stringify(newBrands),
          modelsInterested: JSON.stringify(newModels),
          status: "LEAD_VISIT_SCHEDULED",
        }
      });
    } else {
      lead = await prisma.buyerLead.create({
        data: {
          userId: session.user.id,
          listingId: validated.listingId,
          brandsInterested: JSON.stringify(validated.brandsInterested || []),
          modelsInterested: JSON.stringify(validated.modelsInterested || []),
        },
      });
    }

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create buyer lead" }, { status: 500 })
  }
}
