import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "INSPECTOR") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const lead = await prisma.sellerLead.findFirst({
      where: { 
        id,
        inspection: { inspectorId: session.user.id }
      },
      include: {
        user: { select: { name: true, email: true } },
        inspection: {
          include: { approvedBy: { select: { name: true, email: true } } },
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: lead })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch lead" }, { status: 500 })
  }
}
