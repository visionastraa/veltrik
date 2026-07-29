import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const brand = searchParams.get("brand") || ""
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const minBatteryHealth = searchParams.get("minBatteryHealth")
    const year = searchParams.get("year")
    const sortBy = searchParams.get("sortBy") || "newest"

    // Strictly enforce AVAILABLE status for public listings
    const where: any = { status: "AVAILABLE" }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { inspection: { sellerLead: { make: { contains: search, mode: "insensitive" } } } },
        { inspection: { sellerLead: { model: { contains: search, mode: "insensitive" } } } },
      ]
    }

    if (brand) {
      where.inspection = {
        ...where.inspection,
        sellerLead: { ...where.inspection?.sellerLead, make: brand },
      }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (minBatteryHealth) {
      where.inspection = {
        ...where.inspection,
        batteryHealth: { gte: parseFloat(minBatteryHealth) },
      }
    }

    if (year) {
      where.inspection = {
        ...where.inspection,
        sellerLead: { ...where.inspection?.sellerLead, year: parseInt(year) },
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" }
    if (sortBy === "price_low") orderBy = { price: "asc" }
    else if (sortBy === "price_high") orderBy = { price: "desc" }
    else if (sortBy === "battery") orderBy = { inspection: { batteryHealth: "desc" } }
    else if (sortBy === "km") orderBy = { inspection: { kmDriven: "asc" } }

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          inspection: {
            include: {
              sellerLead: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const listing = await prisma.listing.create({
      data: {
        inspectionId: body.inspectionId,
        title: body.title,
        price: body.price,
        photos: body.photos || [],
        publishedAt: new Date(),
      },
      include: { inspection: { include: { sellerLead: true } } },
    })
    return NextResponse.json({ success: true, data: listing })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create listing" }, { status: 500 })
  }
}
