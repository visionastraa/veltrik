import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
      },
      include: {
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true, image: true } },
        listing: { select: { id: true, title: true, photos: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const data = conversations.map((c) => ({
      id: c.id,
      subject: c.subject,
      listingId: c.listingId,
      listingTitle: c.listing?.title,
      listingImage: c.listing?.photos?.[0],
      otherUser: c.buyerId === session.user.id ? c.seller : c.buyer,
      lastMessage: c.messages[0]?.content || null,
      lastMessageTime: c.messages[0]?.createdAt?.toISOString() || c.createdAt.toISOString(),
      unreadCount: 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[messages] GET error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { listingId, sellerId, message, subject } = await request.json()

    if (!listingId || !sellerId) {
      return NextResponse.json({ success: false, error: "listingId and sellerId required" }, { status: 400 })
    }

    const existing = await prisma.conversation.findFirst({
      where: { listingId, buyerId: session.user.id, sellerId },
    })

    if (existing) {
      if (message) {
        await prisma.message.create({
          data: { conversationId: existing.id, senderId: session.user.id, content: message },
        })
      }
      return NextResponse.json({ success: true, data: { id: existing.id } })
    }

    const conversation = await prisma.conversation.create({
      data: {
        listingId,
        subject: subject || null,
        buyerId: session.user.id,
        sellerId,
      },
    })

    if (message) {
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: session.user.id, content: message },
      })
    }

    return NextResponse.json({ success: true, data: { id: conversation.id } })
  } catch (error) {
    console.error("[messages] POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to create conversation" }, { status: 500 })
  }
}
