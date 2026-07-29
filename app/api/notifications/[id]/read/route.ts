import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const notification = await prisma.notificationLog.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!notification) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }

    await prisma.notificationLog.update({
      where: { id },
      data: { status: "DELIVERED" } // Using DELIVERED to mark as read
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[notifications_read] error:", error)
    return NextResponse.json({ success: false, error: "Failed to mark as read" }, { status: 500 })
  }
}
