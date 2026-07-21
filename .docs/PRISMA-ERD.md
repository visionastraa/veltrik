# Prisma Schema — Current + Planned

## Current Models (8)

```
User ──┬── SellerLead (seller)
       ├── BuyerLead
       ├── Booking
       ├── Inspection (inspectorId)
       ├── Inspection (approvedById)
       ├── Payment
       └── ActivityLog

SellerLead ──┬── Inspection
             └── Booking

Inspection ──┬── SellerLead
             ├── User (inspectorId)
             ├── User (approvedById)
             └── Listing

Listing ──┬── Inspection
           ├── BuyerLead
           └── Booking

BuyerLead ──┬── User
             ├── Listing
             └── Booking

Booking ──┬── SellerLead
           ├── BuyerLead
           ├── Listing
           ├── User
           └── Payment

Payment ──┬── Booking
           └── User

ActivityLog ── User
```

## Current Enums (5)
```
Role: BUYER | SELLER | INSPECTOR | ADMIN | MANAGER
SellerStatus: SUBMITTED | SCHEDULED | INSPECTED | OFFER_MADE | ACQUIRED | REJECTED
ListingStatus: AVAILABLE | RESERVED | SOLD
BookingType: SELLER_INSPECTION | BUYER_VISIT
BuyerStatus: LEAD_VISIT_SCHEDULED | FOLLOW_UP_REQUIRED | CONVERTED | LOST
```

## Planned Models (Phase 2)

### Wishlist
```prisma
model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  listingId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  listing Listing @relation(fields: [listingId], references: [id])

  @@unique([userId, listingId])
  @@map("wishlists")
}
```

### Conversation
```prisma
model Conversation {
  id        String   @id @default(cuid())
  subject   String?
  listingId String?
  buyerId   String
  sellerId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  buyer    User      @relation("BuyerConversations", fields: [buyerId], references: [id])
  seller   User      @relation("SellerConversations", fields: [sellerId], references: [id])
  listing  Listing?  @relation(fields: [listingId], references: [id])
  messages Message[]

  @@map("conversations")
}
```

### Message
```prisma
model Message {
  id             String       @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  read           Boolean      @default(false)
  createdAt      DateTime     @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
  sender       User         @relation(fields: [senderId], references: [id])

  @@map("messages")
}
```

## Planned User Relations Update
```prisma
model User {
  // ... existing fields ...

  conversationsAsBuyer  Conversation[] @relation("BuyerConversations")
  conversationsAsSeller Conversation[] @relation("SellerConversations")
  messages              Message[]
  wishlists             Wishlist[]

  // ... existing relations ...
}
```

## Migration
```bash
npx prisma migrate dev --name add_wishlist_messages
```

## Notes
- Add `@@index([userId])` on Wishlist for fast user lookup
- Add `@@index([conversationId, createdAt])` on Message for sorted message fetch
- Migration **must preserve existing data** — no destructive changes
- Wishlist data migration from ActivityLog is separate (script in Phase 11)
- No `Account`/`Session` models for OAuth — `@next-auth/prisma-adapter` is installed but not wired (JWT strategy used instead)
