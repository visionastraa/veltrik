import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role

    if (!session || !["ADMIN", "MANAGER"].includes(role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await context.params
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 })

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser || targetUser.role !== "INSPECTOR") {
      return NextResponse.json({ success: false, error: "Inspector not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, password, city, address, image } = body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (city !== undefined) updateData.city = city
    if (address !== undefined) updateData.address = address
    if (image !== undefined) updateData.image = image

    if (email !== undefined && email !== targetUser.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } })
      if (existingEmail) {
        return NextResponse.json({ success: false, error: "A user with this email already exists." }, { status: 409 })
      }
      updateData.email = email
    }

    if (phone !== undefined) {
      const strippedPhone = phone.replace(/\D/g, '')
      if (strippedPhone.length > 0 && (strippedPhone.length < 10 || strippedPhone.length > 15)) {
         return NextResponse.json({ success: false, error: "Phone number must be between 10 and 15 digits." }, { status: 400 })
      }
      updateData.phone = phone // Store the formatted version or stripped depending on preference, we store original if it passes validation
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        image: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ success: true, inspector: updatedUser })
  } catch (error: any) {
    console.error("[ADMIN_INSPECTORS_PATCH]", error)
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role

    if (!session || !["ADMIN", "MANAGER"].includes(role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await context.params
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 })

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser || targetUser.role !== "INSPECTOR") {
      return NextResponse.json({ success: false, error: "Inspector not found" }, { status: 404 })
    }

    const activeInspections = await prisma.inspection.count({
      where: {
        inspectorId: id,
        inspectionComplete: false
      }
    })

    if (activeInspections > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete inspector. They have active inspections in progress. Reassign or complete those inspections first.",
        activeCount: activeInspections
      }, { status: 409 })
    }

    const completedInspections = await prisma.inspection.count({
      where: {
        inspectorId: id,
        inspectionComplete: true
      }
    })

    if (completedInspections > 0) {
      await prisma.user.update({
        where: { id },
        data: {
          role: "DEACTIVATED",
          emailVerified: null
        }
      })
      return NextResponse.json({ success: true, message: "Inspector deactivated instead of deleted to preserve inspection history." }, { status: 200 })
    }

    // Zero inspections, safe to hard delete
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "Inspector permanently deleted." }, { status: 200 })

  } catch (error: any) {
    console.error("[ADMIN_INSPECTORS_DELETE]", error)
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
