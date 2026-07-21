import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "INSPECTOR") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const leads = await prisma.sellerLead.findMany({
      where: { status: { in: ["SCHEDULED", "SUBMITTED"] } },
      include: {
        user: { select: { name: true, email: true } },
        inspection: {
          include: { approvedBy: { select: { name: true, email: true } } },
        },
      },
      orderBy: { scheduledAt: "asc" },
    })

    return NextResponse.json({ success: true, data: leads })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 })
  }
}
