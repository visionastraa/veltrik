# Implementation Status

Last updated: 2026-07-19

## Legend
- [ ] Not started
- [x] Completed
- [!] In progress
- [-] Blocked

## Phase 0: Baseline Commit [ ]
- [ ] `git add -A` all untracked code
- [ ] Commit as baseline
- [ ] Create feature branches

## Phase 1: Library Files [ ]
- [ ] `lib/brandModels.ts`
- [ ] `lib/slots.ts`
- [ ] `lib/mailer.ts`
- [ ] `lib/upload.ts`
- [ ] `lib/msg91.ts`
- [ ] `lib/followup.ts`

## Phase 2: Prisma Schema [ ]
- [ ] Add Wishlist model + relations
- [ ] Add Conversation model + relations
- [ ] Add Message model + relations
- [ ] Run migration

## Phase 3: Components [ ]
- [ ] `InspectionCard`
- [ ] `LeadCard`
- [ ] `EmptyState`
- [ ] `MessageThread`
- [ ] `WishlistButton`
- [ ] `PhotoUploadDropzone`
- [ ] `RazorpayCheckout`

## Phase 4: Homepage [ ]
- [ ] Featured listings section
- [ ] Brand grid
- [ ] Hero + CTA
- [ ] Stats bar + trust badges

## Phase 5: Sell Form [ ]
- [ ] Wire photo upload handler
- [ ] Calendar + time slot picker (step 2)
- [ ] Client-side validation
- [ ] Connect schedule to API

## Phase 6: Booking [ ]
- [ ] Listing status check
- [ ] `status = RESERVED` on book
- [ ] Atomic transaction
- [ ] Zod validation on booking request

## Phase 7: CRM [ ]
- [ ] Buyer lead: View Profile
- [ ] Buyer lead: Schedule Visit
- [ ] Buyer lead: Send Message
- [ ] Buyer lead: Mark Converted
- [ ] Buyer lead: Mark Lost
- [ ] Seller lead: Make Offer (real API call)
- [ ] Listings: Delete (real API call)
- [ ] Create `PATCH /api/admin/buyer-leads/[id]`
- [ ] Admin dashboard: wire pendingTasks from hook

## Phase 8: Razorpay [ ]
- [ ] `npm install razorpay`
- [ ] Real create-order (SDK, paise amounts)
- [ ] HMAC SHA256 verify (timingSafeEqual)
- [ ] Webhook handler
- [ ] Replace MOCK_ORDERS with live data
- [ ] Order status tab filtering

## Phase 9: Email + SMS [ ]
- [ ] Welcome email on register
- [ ] Submission confirmation
- [ ] Booking confirmation
- [ ] Inspection schedule notification
- [ ] Payment receipt

## Phase 10: Messages [ ]
- [ ] `GET /api/messages/conversations`
- [ ] `POST /api/messages/conversations`
- [ ] `GET /api/messages/conversations/[id]`
- [ ] `POST /api/messages/conversations/[id]`
- [ ] `PATCH /api/messages/conversations/[id]/read`
- [ ] Replace hardcoded UI with live data

## Phase 11: Wishlist [ ]
- [ ] Data migration script
- [ ] `GET /api/wishlist`
- [ ] `POST /api/wishlist/toggle`
- [ ] Remove old ActivityLog approach
- [ ] Wire into vehicle detail page

## Phase 12: Mock Data Fixes [ ]
- [ ] Inspector inspect page: real API + submit
- [ ] Inspector dashboard: real data
- [ ] Inspector inspections page: build from API
- [ ] User settings: wire save
- [ ] Vehicle detail: fix Contact/Message buttons
- [ ] User dashboard: "Find EV" → /inventory
- [ ] AI Assistant: wire input submit
- [ ] Inventory: wire body type filter
- [ ] Charging page: convert USD → INR
- [ ] Financing: wire Apply buttons
- [ ] `hooks/use-inspector-api.ts`: fix paths
- [ ] `api/buyer/book`: add validation + status check
