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

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { booking: { include: { listing: true } } },
    })

    return NextResponse.json({ success: true, data: payments })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}
