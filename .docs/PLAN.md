# Veltrik EV Marketplace — Execution Plan

## Goal
Complete all remaining work for Shantanu + Shashwat on the Veltrik EV marketplace
across buyer frontend, booking, CRM, and payments.

## Scope (Sections 9.2, 9.3, 9.6)
- **9.2**: Buyer Frontend (homepage, inventory, vehicle detail, messaging, wishlist, booking)
- **9.3**: CRM (buyer leads, seller leads, listings, admin dashboard)
- **9.6**: Payments (Razorpay, orders)

## Constraints
- Keep existing routing structure (no `(public)` route group)
- Dedicated Wishlist + Message Prisma models (not ActivityLog JSON hack)
- Real messaging API (not coming-soon placeholder)
- Single-page 3-step sell form with calendar in step 2

## 12 Phases

### Phase 0: Baseline Commit (~15 min)
- `git add -A` all untracked Veltrik code
- Commit: `"feat: veltrik ~72% initial implementation"`
- Create branches: `feat/buyer-pages`, `feat/buyer-booking`, `feat/crm-payments`

### Phase 1: Library Files (~2 hrs)
Create these 6 files under `lib/`:
| File | Exports | Purpose |
|------|---------|---------|
| `brandModels.ts` | `BRANDS`, `MODELS_BY_BRAND`, `BODY_TYPES` | EV brand+model lookup (2-wheeler focus) |
| `slots.ts` | `generateTimeSlots()`, `getAvailableSlots()` | Time slot generation for inspection booking |
| `mailer.ts` | `sendEmail()` | Nodemailer/Resend email transport |
| `upload.ts` | `uploadFile()` | File upload with validation (type, size) |
| `msg91.ts` | `sendOTP()`, `sendSMS()` | MSG91 SMS gateway wrapper |
| `followup.ts` | `scheduleLeadFollowup()` | Lead follow-up scheduling |

### Phase 2: Prisma Schema Update (~30 min)
Add Wishlist, Conversation, Message models (see PRISMA-ERD.md).
Run: `npx prisma migrate dev --name add_wishlist_messages`

### Phase 3: Shared UI Components (~2 hrs)
Create 7 components:
- `InspectionCard` — inspection summary card
- `LeadCard` — lead with action callbacks
- `EmptyState` — generic empty state for any list
- `MessageThread` — chat bubble display
- `WishlistButton` — heart toggle with API call
- `PhotoUploadDropzone` — drag-drop upload with preview
- `RazorpayCheckout` — Razorpay SDK checkout wrapper

### Phase 4: Homepage (~1 hr)
Rebuild `app/page.tsx` from stub with featured listings, brand grid, CTA.

### Phase 5: Sell Form Enhancements (~1.5 hrs)
- Wire photo upload (hidden input + onClick handler)
- Add calendar + time slot picker in step 2
- Add client-side validation

### Phase 6: Booking Flow (~30 min)
- Add listing status check (`AVAILABLE` check before book)
- Set `listing.status = 'RESERVED'` on successful booking
- Atomic transaction

### Phase 7: CRM Actions (~2.5 hrs)
- Wire 6 buyer lead dropdown actions to API calls
- Wire seller lead "Make Offer" to real API
- Wire listing delete to real API
- Create missing `PATCH /api/admin/buyer-leads/[id]` route

### Phase 8: Razorpay (~2.5 hrs)
- Install SDK: `npm install razorpay`
- Real create-order via SDK (paise amounts)
- Real HMAC SHA256 verify with timingSafeEqual
- Webhook handler for payment.captured
- Replace MOCK_ORDERS with live orders data

### Phase 9: Email + SMS (~1.5 hrs)
- Wire welcome email on register
- Wire submission confirmation
- Wire booking confirmation
- Wire inspection schedule notification
- Wire payment receipt
- Failures log but don't block response

### Phase 10: Messaging API (~2.5 hrs)
- CRUD for conversations + messages
- Replace 4 hardcoded conversations with live data
- Document Socket.io upgrade path

### Phase 11: Wishlist Refactor (~1 hr)
- Data migration from ActivityLog to Wishlist model
- New API routes
- Remove old ActivityLog approach
- Wire into vehicle detail page

### Phase 12: Mock Data Fixes (~3.5 hrs)
Fix 18+ broken surfaces (see ISSUES.md).

## Dependency Graph
```
Phase 0
  ├── Phase 1 ────────── Phase 9
  ├── Phase 2 ────────── Phase 10, Phase 11
  ├── Phase 3 ────────── ALL UI phases
  ├── Phase 4 (standalone)
  ├── Phase 5 (after Phase 1)
  ├── Phase 6 (after Phase 1)
  ├── Phase 7 (after Phase 3)
  ├── Phase 8 (after Phase 3)
  ├── Phase 9 (after Phase 1+6)
  ├── Phase 10 (after Phase 2+3)
  ├── Phase 11 (after Phase 2+3)
  └── Phase 12 (after Phase 3)
```

## Parallel Batches
- **Batch A**: Phases 1, 2, 3
- **Batch B**: Phases 4, 5, 6
- **Batch C**: Phases 7, 8, 9, 10, 11
- **Batch D**: Phase 12

## Total Effort
~19 hours across 12 phases, ~45 individual tasks.
