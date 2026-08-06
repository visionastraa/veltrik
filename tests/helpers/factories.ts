import { prisma } from "../setup"
import type {
  User, SellerLead, Inspection, Listing, BuyerLead,
  Booking, Payment, ActivityLog, Wishlist, Conversation, Message,
} from "@prisma/client"

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }

let counter = 0
const seq = () => ++counter

export async function createUser(overrides: DeepPartial<User> = {}) {
  const n = seq()
  return prisma.user.create({
    data: {
      name: overrides.name ?? `Test User ${n}`,
      email: overrides.email ?? `user${n}@test.com`,
      password: overrides.password ?? "hashed_password",
      phone: overrides.phone ?? `+919000000${n.toString().padStart(2, "0")}`,
      role: (overrides.role as any) ?? "BUYER",
      image: overrides.image ?? null,
      emailVerified: (overrides.emailVerified as any) ?? null,
    },
  })
}

export async function createSellerLead(overrides: DeepPartial<SellerLead> = {}) {
  const user = overrides.userId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.userId as string } })
    : await createUser({ role: "SELLER" })
  const n = seq()
  return prisma.sellerLead.create({
    data: {
      userId: user.id,
      make: overrides.make ?? "Ola",
      model: overrides.model ?? "S1 Pro",
      variant: overrides.variant ?? "Standard",
      vehicleNumber: overrides.vehicleNumber ?? `KA-${String(n).padStart(2, "0")}-EV-${String(n).padStart(4, "0")}`,
      year: overrides.year ?? 2024,
      kmDriven: overrides.kmDriven ?? 5000,
      warrantyStatus: overrides.warrantyStatus ?? "ACTIVE",
      expectedPrice: overrides.expectedPrice ?? 150000,
      description: overrides.description ?? null,
      photos: JSON.stringify((overrides.photos ?? []).filter((p): p is string => !!p)),
      status: (overrides.status as any) ?? "SUBMITTED",
      scheduledAt: (overrides.scheduledAt as any) ?? null,
    },
  })
}

export async function createInspection(overrides: DeepPartial<Inspection> = {}) {
  const sellerLead = overrides.sellerLeadId
    ? await prisma.sellerLead.findUniqueOrThrow({ where: { id: overrides.sellerLeadId as string } })
    : await createSellerLead({ status: "SCHEDULED" })

  const inspector = overrides.inspectorId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.inspectorId as string } })
    : await createUser({ role: "INSPECTOR" })

  return prisma.inspection.create({
    data: {
      sellerLeadId: sellerLead.id,
      inspectorId: inspector.id,
      ageYears: overrides.ageYears ?? null,
      ageMonths: overrides.ageMonths ?? null,
      kmDriven: overrides.kmDriven ?? null,
      bodyDamage: overrides.bodyDamage ?? null,
      bodyDamagePhoto: overrides.bodyDamagePhoto ?? null,
      forkDamage: overrides.forkDamage ?? null,
      accidentHistory: overrides.accidentHistory ?? null,
      warrantyStatus: overrides.warrantyStatus ?? null,
      warrantyType: overrides.warrantyType ?? null,
      warrantyExpiry: (overrides.warrantyExpiry as any) ?? null,
      partsReplaced: overrides.partsReplaced ?? null,
      replacedParts: overrides.replacedParts ?? null,
      adminComments: overrides.adminComments ?? null,
      batteryCharge: overrides.batteryCharge ?? null,
      batteryHealth: overrides.batteryHealth ?? null,
      batteryVoltage: overrides.batteryVoltage ?? null,
      physicalDamage: overrides.physicalDamage ?? null,
      brakeSystem: overrides.brakeSystem ?? null,
      brakePads: overrides.brakePads ?? null,
      wheelAlignment: overrides.wheelAlignment ?? null,
      testDriveRating: overrides.testDriveRating ?? null,
      testDriveNotes: overrides.testDriveNotes ?? null,
      techComments: overrides.techComments ?? null,
      finalOffer: overrides.finalOffer ?? null,
      approvedById: (overrides.approvedById as any) ?? null,
      approvedAt: (overrides.approvedAt as any) ?? null,
    },
  })
}

export async function createListing(overrides: DeepPartial<Listing> = {}) {
  const inspection = overrides.inspectionId
    ? await prisma.inspection.findUniqueOrThrow({ where: { id: overrides.inspectionId as string } })
    : await createInspection()

  return prisma.listing.create({
    data: {
      inspectionId: inspection.id,
      title: overrides.title ?? "Test Listing",
      price: overrides.price ?? 150000,
      status: (overrides.status as any) ?? "AVAILABLE",
      photos: JSON.stringify((overrides.photos ?? []).filter((p): p is string => !!p)),
      publishedAt: overrides.publishedAt != null ? new Date(overrides.publishedAt as any) : new Date(),
    },
  })
}

export async function createBuyerLead(overrides: DeepPartial<BuyerLead> = {}) {
  const user = overrides.userId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.userId as string } })
    : await createUser({ role: "BUYER" })

  let listingId = overrides.listingId as string | undefined
  if (!listingId && overrides.listingId !== null) {
    const listing = await createListing()
    listingId = listing.id
  }

  return prisma.buyerLead.create({
    data: {
      userId: user.id,
      listingId: listingId ?? null,
      brandsInterested: JSON.stringify((overrides.brandsInterested ?? ["Ola", "Ather"]).filter((b): b is string => !!b)),
      modelsInterested: JSON.stringify((overrides.modelsInterested ?? ["S1 Pro", "450X"]).filter((m): m is string => !!m)),
      status: (overrides.status as any) ?? "LEAD_VISIT_SCHEDULED",
    },
  })
}

export async function createBooking(overrides: DeepPartial<Booking> = {}) {
  const user = overrides.userId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.userId as string } })
    : await createUser()

  return prisma.booking.create({
    data: {
      type: (overrides.type as any) ?? "BUYER_VISIT",
      userId: user.id,
      scheduledAt: overrides.scheduledAt != null ? new Date(overrides.scheduledAt as any) : new Date(Date.now() + 86400000),
      status: overrides.status ?? "confirmed",
      sellerLeadId: (overrides.sellerLeadId as any) ?? null,
      buyerLeadId: (overrides.buyerLeadId as any) ?? null,
      listingId: (overrides.listingId as any) ?? null,
    },
  })
}

export async function createPayment(overrides: DeepPartial<Payment> = {}) {
  const user = overrides.userId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.userId as string } })
    : await createUser()

  const n = seq()
  return prisma.payment.create({
    data: {
      razorpayOrderId: overrides.razorpayOrderId ?? `order_${n}_${Date.now()}`,
      razorpayPaymentId: overrides.razorpayPaymentId ?? null,
      razorpaySignature: overrides.razorpaySignature ?? null,
      amount: overrides.amount ?? 150000,
      currency: overrides.currency ?? "INR",
      status: overrides.status ?? "created",
      userId: user.id,
      bookingId: (overrides.bookingId as any) ?? null,
    },
  })
}

export async function createConversation(overrides: DeepPartial<Conversation> = {}) {
  const buyer = overrides.buyerId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.buyerId as string } })
    : await createUser({ role: "BUYER" })
  const seller = overrides.sellerId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.sellerId as string } })
    : await createUser({ role: "SELLER" })

  let listingId = overrides.listingId as string | undefined
  if (!listingId && overrides.listingId !== null) {
    const listing = await createListing()
    listingId = listing.id
  }

  return prisma.conversation.create({
    data: {
      subject: overrides.subject ?? null,
      listingId: listingId ?? null,
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  })
}

export async function createMessage(overrides: DeepPartial<Message> = {}) {
  const conversation = overrides.conversationId
    ? await prisma.conversation.findUniqueOrThrow({ where: { id: overrides.conversationId as string } })
    : await createConversation()

  const sender = overrides.senderId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.senderId as string } })
    : await prisma.user.findUniqueOrThrow({ where: { id: conversation.buyerId } })

  return prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: sender.id,
      content: overrides.content ?? `Test message ${seq()}`,
      read: overrides.read ?? false,
    },
  })
}

export async function createWishlist(overrides: DeepPartial<Wishlist> = {}) {
  let user = overrides.userId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.userId as string } })
    : undefined
  if (!user) {
    const existing = await prisma.user.findFirst({ where: { role: "BUYER" } })
    user = existing ?? await createUser({ role: "BUYER" })
  }

  let listing = overrides.listingId
    ? await prisma.listing.findUniqueOrThrow({ where: { id: overrides.listingId as string } })
    : undefined
  if (!listing) {
    const existing = await prisma.listing.findFirst()
    listing = existing ?? await createListing()
  }

  return prisma.wishlist.upsert({
    where: { userId_listingId: { userId: user.id, listingId: listing.id } },
    update: {},
    create: { userId: user.id, listingId: listing.id },
  })
}

export async function createActivityLog(overrides: DeepPartial<ActivityLog> = {}) {
  const user = overrides.userId
    ? await prisma.user.findUniqueOrThrow({ where: { id: overrides.userId as string } })
    : await createUser()

  return prisma.activityLog.create({
    data: {
      action: overrides.action ?? "TEST_ACTION",
      description: overrides.description ?? "Test activity log entry",
      userId: user.id,
      metadata: (overrides.metadata as any) ?? null,
    },
  })
}
