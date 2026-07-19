import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const demoUsers = [
  { name: "Admin User", email: "admin@veltrik.com", role: "ADMIN" as const, password: "admin123" },
  { name: "Inspector User", email: "inspector@veltrik.com", role: "INSPECTOR" as const, password: "inspector123" },
  { name: "Buyer User", email: "buyer@veltrik.com", role: "BUYER" as const, password: "buyer123" },
  { name: "Seller User", email: "seller@veltrik.com", role: "SELLER" as const, password: "seller123" },
]

export async function POST(request: Request) {
  try {
    const { role } = await request.json()
    const demo = demoUsers.find((u) => u.role === role)
    if (!demo) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { email: demo.email } })

    if (!user) {
      const hashedPassword = await bcrypt.hash(demo.password, 12)
      user = await prisma.user.create({
        data: {
          name: demo.name,
          email: demo.email,
          password: hashedPassword,
          role: demo.role,
        },
      })
    }

    return NextResponse.json({
      success: true,
      credentials: { email: demo.email, password: demo.password },
    })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to switch user" }, { status: 500 })
  }
}
