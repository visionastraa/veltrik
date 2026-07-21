import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitToConversation } from "@/lib/socket-emitter"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true, image: true } },
        listing: { select: { id: true, title: true, photos: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true } } },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 })
    }

    if (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: session.user.id }, read: false },
      data: { read: true },
    })

    const otherUser = conversation.buyerId === session.user.id ? conversation.seller : conversation.buyer

    const data = {
      id: conversation.id,
      subject: conversation.subject,
      listingId: conversation.listingId,
      listing: conversation.listing,
      otherUser,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        content: m.content,
        sent: m.senderId === session.user.id,
        time: m.createdAt.toISOString(),
        read: m.read,
      })),
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[messages] GET:id error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch conversation" }, { status: 500 })
  }
}

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

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Content required" }, { status: 400 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { buyerId: true, sellerId: true },
    })

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 })
    }

    if (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: { conversationId: id, senderId: session.user.id, content },
      select: { id: true, content: true, createdAt: true, read: true },
    })

    emitToConversation(id, "message:new", {
      id: message.id,
      content: message.content,
      sent: false,
      time: message.createdAt.toISOString(),
      read: message.read,
      senderId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        sent: true,
        time: message.createdAt.toISOString(),
        read: message.read,
      },
    })
  } catch (error) {
    console.error("[messages] POST:id error:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
