import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledAt: "desc" },
      include: { listing: true },
    })

    return NextResponse.json({ success: true, data: bookings })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
