import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendEmail, buildBookingConfirmationEmail } from "@/lib/mailer"
import { emitToUser, emitToListing } from "@/lib/socket-emitter"

const bookSchema = z.object({
  listingId: z.string().min(1),
  buyerLeadId: z.string().min(1),
  scheduledAt: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = bookSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const { listingId, buyerLeadId, scheduledAt } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    })

    const booking = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { status: true },
      })

      if (!listing) {
        throw new Error("Listing not found")
      }
      if (listing.status !== "AVAILABLE") {
        throw new Error(`Listing is ${listing.status.toLowerCase()}, not available for booking`)
      }

      await tx.listing.update({
        where: { id: listingId },
        data: { status: "RESERVED" },
      })

      return tx.booking.create({
        data: {
          type: "BUYER_VISIT",
          listingId,
          buyerLeadId,
          scheduledAt: new Date(scheduledAt),
          userId: session.user.id,
          status: "confirmed",
        },
        include: {
          listing: { select: { title: true, photos: true } },
        },
      })
    })

    if (user?.email) {
      emitToUser(session.user.id, "notification:new", {
        type: "booking",
        title: "Booking Confirmed",
        message: `Your booking for ${booking.listing?.title || "Vehicle"} is confirmed.`,
      })
      emitToListing(listingId, "listing:status-change", {
        status: "RESERVED",
        listingId,
      })
      sendEmail({
        to: user.email,
        subject: "Booking Confirmed - Veltrik",
        html: buildBookingConfirmationEmail(
          user.name || "Customer",
          booking.listing?.title || "Vehicle",
          new Date(scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
        ),
      }).catch((e) => console.error("[book] confirmation email failed:", e))
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create booking"
    if (message.includes("not found") || message.includes("not available")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}
