import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const leads = await prisma.sellerLead.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        inspection: {
          select: {
            listing: {
              select: {
                id: true,
                status: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, leads })
  } catch (error) {
    console.error("[seller_leads_get] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 })
  }
}
