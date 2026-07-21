import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""
    const make = searchParams.get("make") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (make) {
      where.make = { equals: make, mode: "insensitive" }
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { vehicleNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.sellerLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          inspection: { select: { id: true, finalOffer: true, approvedAt: true } },
        },
      }),
      prisma.sellerLead.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[admin/leads/seller] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 })
  }
}
