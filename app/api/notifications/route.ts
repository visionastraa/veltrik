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

    const notifications = await prisma.notificationLog.findMany({
      where: { 
        userId: session.user.id,
        channel: "IN_APP"
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })

    return NextResponse.json({ success: true, notifications })
  } catch (error) {
    console.error("[notifications_get] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
  }
}
