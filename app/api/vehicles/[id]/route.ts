import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        inspection: {
          include: {
            sellerLead: { include: { user: { select: { id: true, name: true, phone: true } } } },
            approvedBy: { select: { name: true, email: true } },
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: listing })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch vehicle" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const listing = await prisma.listing.update({
      where: { id },
      data: body,
      include: { inspection: { include: { sellerLead: true } } },
    })
    return NextResponse.json({ success: true, data: listing })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update vehicle" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.listing.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete vehicle" }, { status: 500 })
  }
}
