# Veltrik — Complete Codebase Reference

> Generated: 2026-07-19
> TypeScript: 0 errors across all ~90 source files

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Decisions](#2-architecture-decisions)
3. [Route Groups & Layouts](#3-route-groups--layouts)
4. [API Routes (32 total)](#4-api-routes)
5. [Pages (28 total)](#5-pages)
6. [Lib Files (15)](#6-lib-files)
7. [Hooks (4)](#7-hooks)
8. [Components (35)](#8-components)
9. [Prisma Schema (11 models, 5 enums)](#9-prisma-schema)
10. [Environment Variables (18)](#10-environment-variables)
11. [Socket.io Real-Time Layer](#11-socketio-real-time-layer)
12. [Current State](#12-current-state)
13. [Docs Index](#13-docs-index)

---

## 1. Project Overview

**Veltrik** is an EV marketplace platform in India. Buyers browse, compare, and book EVs. Sellers submit leads for inspection and listing. Inspectors perform vehicle inspections. Admins approve/reject listings and manage leads.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Prisma 5 |
| Auth | NextAuth v4 (JWT strategy, Google + Credentials) |
| Client state | TanStack React Query + Zustand (compare) |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) |
| Animations | Framer Motion |
| Payments | Razorpay SDK |
| Real-time | Socket.io (Express server on port 3001) |
| Validation | Zod |
| Email | Nodemailer (SMTP) |
| SMS | MSG91 |

### User Roles

| Role | Routes | Description |
|------|--------|-------------|
| `BUYER` | `/user/*`, `/inventory`, `/vehicles/*`, `/sell`, `/compare`, `/trade-in`, `/financing`, `/charging` | Browse, book, message sellers |
| `SELLER` | Same as BUYER + submits leads via `/sell` | Sell vehicles |
| `INSPECTOR` | `/inspector/*` | Perform vehicle inspections |
| `ADMIN` | `/admin/*` | Approve listings, manage leads, view stats |

---

## 2. Architecture Decisions

### Custom Express Server for Socket.io (not serverless)
- **File:** `server.ts`
- **Rationale:** Socket.io needs a persistent HTTP server. Next.js serverless functions can't hold WebSocket connections. Express server on port 3000 handles Next.js requests, Socket.io on port 3001 (separate process).
- **API route emissions:** Use HTTP bridge pattern — API routes POST to `/emit` on the socket server. This avoids import issues across cold starts.
- **Dev setup:** `concurrently "next dev" "tsx watch server.ts"`

### NextAuth with JWT (not database sessions)
- **File:** `lib/auth.ts`
- **Rationale:** JWT avoids database lookups on every request. Token carries `{ role, id }` for role-based access.

### No Route Groups for Public Routes
- Public routes (`/`, `/login`, `/register`) are in `(auth)` or root. All authenticated routes are grouped by role: `(dashboard)`, `(admin)`, `(inspector)`.

### Wishlist Uses Dedicated Model (not ActivityLog JSON)
- **File:** `prisma/schema.prisma` — `model Wishlist`
- **Rationale:** Original implementation stored wishlist in `ActivityLog.metadata` as JSON array. Dedicated model allows proper indexing, queries, and relations.

### Messages Uses Conversation + Message Models
- **File:** `prisma/schema.prisma` — `model Conversation`, `model Message`
- **Rationale:** Structured messaging with buyer-seller pairs, listing context, and read tracking.

---

## 3. Route Groups & Layouts

```
app/
├── layout.tsx                     # Root: Providers (Session, Query, Socket, Tooltip, Toaster)
├── page.tsx                       # Homepage (hero, featured listings, brands, stats)
├── middleware.ts                  # Auth guard for /admin, /inspector
│
├── (auth)/                        # Unauthenticated routes
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (dashboard)/
│   ├── layout.tsx                 # UnifiedNavbar + mode state
│   ├── user/
│   │   ├── page.tsx               # User dashboard (search, filters, listings grid)
│   │   ├── messages/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── favorites/page.tsx
│   ├── inventory/page.tsx
│   ├── vehicles/[id]/page.tsx
│   ├── sell/page.tsx
│   ├── compare/page.tsx
│   ├── trade-in/page.tsx
│   ├── financing/page.tsx
│   └── charging/page.tsx
│
├── (admin)/
│   ├── layout.tsx                 # AdminSidebar + role check
│   └── admin/
│       ├── page.tsx               # Dashboard (stats, chart, pending tasks)
│       ├── listings/page.tsx
│       ├── inspections/page.tsx
│       ├── leads/
│       │   ├── seller/page.tsx
│       │   └── buyer/page.tsx
│
└── (inspector)/
    ├── layout.tsx                 # InspectorSidebar + role check
    └── inspector/
        ├── page.tsx               # Dashboard (today's inspections, stats)
        ├── inspections/page.tsx
        ├── analytics/page.tsx
        ├── inspect/[id]/page.tsx
        ├── settings/page.tsx      # Placeholder
        ├── reports/page.tsx       # Placeholder
        └── field/page.tsx         # Placeholder
```

### Layout Hierarchy

```
RootLayout (html, body, fonts)
└── Providers (SessionProvider → QueryClientProvider → SocketProvider → TooltipProvider → Toaster)
    └── Route Group Layout (Navbar/Sidebar + main)
        └── Page content
```

---

## 4. API Routes

### Auth (3)

| Route | Methods | Purpose |
|-------|---------|---------|
| `auth/[...nextauth]` | GET, POST | NextAuth catch-all (Google + Credentials) |
| `auth/register` | POST | Register new user (bcrypt hash, sends welcome email) |
| `auth/switch-user` | POST | Dev-only: switch user role |

### Admin (7)

| Route | Methods | Purpose |
|-------|---------|---------|
| `admin/stats` | GET | Dashboard stats (totals for listings, inspections, leads, revenue, recent activity) |
| `admin/leads/seller` | GET | List seller leads with inspection info |
| `admin/leads/buyer` | GET | List buyer leads |
| `admin/buyer-leads/[id]` | PATCH | Update buyer lead (convert, lost, schedule, etc.) |
| `admin/approve` | POST | Approve inspection → create listing (emits notification) |
| `admin/reject` | POST | Reject seller lead |
| `admin/inspections/[id]` | GET | Single inspection detail |

### Inspector (5)

| Route | Methods | Purpose |
|-------|---------|---------|
| `inspector/stats` | GET | Inspector dashboard stats (today count, completed, pending, quality) |
| `inspector/leads` | GET | List SCHEDULED/SUBMITTED leads assigned to inspector |
| `inspector/leads/[id]` | GET | Single lead detail |
| `inspector/inspections` | GET | All inspections by this inspector |
| `inspector/inspections/[id]` | GET | Single inspection detail |

### Vehicles (2)

| Route | Methods | Purpose |
|-------|---------|---------|
| `vehicles` | GET | List/search with filters (brand, price, battery, sort, pagination) |
| `vehicles/[id]` | GET, PUT, DELETE | Single vehicle CRUD |

### Buyer (2)

| Route | Methods | Purpose |
|-------|---------|---------|
| `buyer/book` | POST | Create booking (atomic transaction, email confirmation, socket emission) |
| `buyer/lead` | POST | Submit buyer interest lead |

### Seller (2)

| Route | Methods | Purpose |
|-------|---------|---------|
| `seller/submit` | POST | Submit seller lead with vehicle details |
| `seller/schedule` | POST | Schedule inspection date |

### User (3)

| Route | Methods | Purpose |
|-------|---------|---------|
| `user/wishlist` | GET, POST | Fetch/toggle wishlist (uses Wishlist model) |
| `user/orders` | GET | User payment orders |
| `user/bookings` | GET | User bookings |

### Razorpay (3)

| Route | Methods | Purpose |
|-------|---------|---------|
| `razorpay/create-order` | POST | Create Razorpay order + Payment record |
| `razorpay/verify` | POST | Verify HMAC signature, mark payment paid (emits notification) |
| `razorpay/webhook` | POST | Razorpay webhook handler (payment.captured, payment.failed) |

### Messages (2)

| Route | Methods | Purpose |
|-------|---------|---------|
| `messages/conversations` | GET, POST | List user's conversations, create new conversation |
| `messages/conversations/[id]` | GET, POST | Fetch conversation with messages, send message (emits socket event) |

### Utility (2)

| Route | Methods | Purpose |
|-------|---------|---------|
| `upload` | POST | File upload with MIME validation |
| `placeholder/[...size]` | GET | SVG placeholder image generation |

### Socket Emission Points

Every successful write operation in these routes emits a real-time event:

| Route | Event | Recipient |
|-------|-------|-----------|
| `buyer/book` | `notification:new` | Buyer |
| `buyer/book` | `listing:status-change` | Listing watchers |
| `messages/conversations/[id]` | `message:new` | Conversation room |
| `inspection/submit` | `notification:new` | Seller |
| `admin/approve` | `notification:new` | Seller |
| `razorpay/verify` | `notification:new` | Buyer |

---

## 5. Pages

### Public
| Route | Description |
|-------|-------------|
| `/` | Hero, featured listings, brand grid, stats, how-it-works, CTA |
| `/login` | Login form (email/password + Google) |
| `/register` | Register form |

### Dashboard (buyer/seller)
| Route | Description |
|-------|-------------|
| `/user` | Search, filter, browse listings grid with wishlist + compare |
| `/user/messages` | Real-time messaging with socket subscription |
| `/user/orders` | Payment order list with expandable details |
| `/user/settings` | Profile, security, notifications, preferences tabs |
| `/user/bookings` | Booking list |
| `/user/favorites` | Wishlist items |
| `/inventory` | Browse with sidebar filters (brand, price, range, battery, body type) |
| `/vehicles/[id]` | Detail with inspection report, actions (message seller) |
| `/sell` | 3-step form (details, photos, schedule) with brand dropdowns + calendar |
| `/compare` | Side-by-side vehicle comparison (via Zustand store) |
| `/trade-in` | Multi-step trade-in form with dynamic estimate |
| `/financing` | Loan offers from Indian banks (SBI, HDFC, ICICI, Axis) |
| `/charging` | Station finder with INR pricing, charging calculator |

### Admin
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with stats, revenue chart (dynamic from totalRevenue), recent activity |
| `/admin/listings` | Manage listings with delete dialog |
| `/admin/inspections` | Review inspections |
| `/admin/leads/seller` | Seller leads with Make Offer action |
| `/admin/leads/buyer` | Buyer CRM with dropdown actions (view, schedule, message, convert, lost) |

### Inspector
| Route | Description |
|-------|-------------|
| `/inspector` | Dashboard with today's inspections, stats |
| `/inspector/inspections` | All inspections list fetched from API |
| `/inspector/analytics` | Stats cards (today, completed, in-progress, quality score) |
| `/inspector/inspect/[id]` | Inspection form — fetches real data, submits via API |
| `/inspector/settings` | Placeholder |
| `/inspector/reports` | Placeholder |
| `/inspector/field` | Placeholder |

---

## 6. Lib Files

| File | Exports | Purpose |
|------|---------|---------|
| `prisma.ts` | `prisma` | Singleton PrismaClient |
| `auth.ts` | `authOptions` | NextAuth config with Google + Credentials, JWT callbacks |
| `utils.ts` | `cn` | Tailwind class merge (clsx + tailwind-merge) |
| `socket.ts` | `connectSocket`, `disconnectSocket`, `getSocket` | Client-side Socket.io singleton (auto-reconnect) |
| `socket-server.ts` | `getIO`, `initSocketServer` | Server-side Socket.io with `/messages`, `/notifications`, `/listings` namespaces |
| `socket-emitter.ts` | `emitToUser`, `emitToListing`, `emitToConversation` | HTTP bridge: POSTs to socket server `/emit` endpoint |
| `mailer.ts` | `sendEmail`, `buildWelcomeEmail`, `buildBookingConfirmationEmail`, `buildPaymentReceiptEmail` | Nodemailer SMTP transport + HTML builders |
| `msg91.ts` | `sendOTP`, `sendSMS` | MSG91 SMS API |
| `followup.ts` | `calculateFollowupDate`, `getDefaultFollowupSchedule`, `scheduleFollowups` | Lead follow-up scheduling logic |
| `brandModels.ts` | `BRANDS`, `MODELS_BY_BRAND`, `BODY_TYPES`, `getModelsByBrand` | 2-wheeler EV brand/model data |
| `search-parser.ts` | `parseSearchQuery`, `SEARCH_SUGGESTIONS` | Natural language search parsing |
| `slots.ts` | `generateTimeSlots`, `getMinDate`, `getMaxDate` | Time slot generation (9AM-6PM, 60-min) |
| `upload.ts` | `uploadFile` | File upload with MIME validation |
| `validations/vehicle.ts` | Zod schemas: `vehicleSchema`, `inspectionSchema`, `sellerLeadSchema`, `buyerLeadSchema`, `bookingSchema` | Request validation schemas |
| `validations/inspection.ts` | `inspectionSubmitSchema`, `InspectionSubmitInput` | Inspection form validation |

---

## 7. Hooks

| File | Exports | Purpose |
|------|---------|---------|
| `use-api.ts` | `useVehicles`, `useVehicle`, `useWishlist`, `useToggleWishlist`, `useBookings`, `useCreateBooking`, `useOrders`, `useSubmitSeller`, `useCreateBuyerLead` | Buyer-facing API hooks |
| `use-admin-api.ts` | `useAdminStats`, `useAdminSellerLeads`, `useAdminBuyerLeads`, `useAdminInspection`, `useAdminApprove`, `useAdminReject` | Admin API hooks |
| `use-inspector-api.ts` | `useInspectorStats`, `useInspectorInspections`, `useInspectorInspection`, `useSubmitInspection` | Inspector API hooks |
| `use-compare.ts` | `useCompareStore` | Zustand store for vehicle comparison |

### Key Hook Patterns
- All hooks use TanStack React Query (`useQuery`/`useMutation`)
- Mutations invalidate related queries on success
- No hook has `onError` handlers (errors propagate to component)
- `socket-emitter.ts` is not a hook — it's a plain module used in API routes

---

## 8. Components

### Layout (4)
| Component | Location | Purpose |
|-----------|----------|---------|
| `UnifiedNavbar` | `components/layout/` | Top navigation with mode toggle |
| `AdminSidebar` | `components/layout/` | Admin sidebar navigation |
| `InspectorSidebar` | `components/layout/` | Inspector sidebar navigation |
| `DashboardSwitcher` | `components/layout/` | Role-based dashboard switcher |

### Providers (2)
| Component | Location | Purpose |
|-----------|----------|---------|
| `Providers` | `components/` | Wraps Session, Query, Socket, Tooltip, Toaster |
| `SocketProvider` | `components/` | Socket.io connection context (connects on session, disconnects on logout) |

### UI (22)
shadcn/ui components: Button, Card, Input, Label, Badge, Avatar, Checkbox, Dialog, DropdownMenu, Progress, RadioGroup, ScrollArea, Select, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Tooltip, use-toast.

### Domain (7)
| Component | Location | Purpose |
|-----------|----------|---------|
| `PhotoUploadDropzone` | `components/ui/` | Drag-drop photo upload with preview |
| `WishlistButton` | `components/ui/` | Heart toggle with stopPropagation |
| `EmptyState` | `components/ui/` | Generic empty state with icon + action |
| `MessageThread` | `components/messages/` | Chat bubble display with auto-scroll |
| `LeadCard` | `components/leads/` | Lead display with status colors + dropdown |
| `InspectionCard` | `components/inspection/` | Inspection summary with scores |
| `RazorpayCheckout` | `components/payment/` | Razorpay SDK checkout wrapper |

---

## 9. Prisma Schema

### Enums
```
Role           → BUYER | SELLER | INSPECTOR | ADMIN | MANAGER
SellerStatus   → SUBMITTED | SCHEDULED | INSPECTED | OFFER_MADE | ACQUIRED | REJECTED
ListingStatus  → AVAILABLE | RESERVED | SOLD
BookingType    → SELLER_INSPECTION | BUYER_VISIT
BuyerStatus    → LEAD_VISIT_SCHEDULED | FOLLOW_UP_REQUIRED | CONVERTED | LOST
```

### Models (11)
```
User            → SellerLead[], Inspection[], BuyerLead[], Booking[], Payment[], ActivityLog[], Wishlist[], Conversation[], Message[]
SellerLead      → User, Inspection (1:1), Booking[]
Inspection      → SellerLead (1:1), Listing (1:1), inspector (User), approvedBy (User)
Listing         → Inspection (1:1), BuyerLead[], Booking[], Conversation[], Wishlist[]
BuyerLead       → User, Listing, Booking[]
Booking         → User, SellerLead?, BuyerLead?, Listing?, Payment
Payment         → Booking?
ActivityLog     → User
Wishlist        → User + Listing (unique pair)
Conversation    → buyer (User), seller (User), Listing?, Message[]
Message         → Conversation, sender (User)
```

### Key Indexes
- `Message`: `@@index([conversationId, createdAt])`
- `Wishlist`: `@@unique([userId, listingId])`

### Migration Status
- `prisma generate` succeeds (client compiled)
- `prisma migrate dev` requires running PostgreSQL — currently blocked

---

## 10. Environment Variables

### Required (in `.env.local`)
| Variable | Default | Used In |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://postgres@localhost:5432/veltrik` | Prisma |
| `NEXTAUTH_SECRET` | `veltrik-dev-secret...` | NextAuth |
| `NEXTAUTH_URL` | `http://localhost:3000` | NextAuth |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App |
| `UPLOAD_DIR` | `public/uploads` | Upload lib |

### Optional (commented out)
| Variable | Used In |
|----------|---------|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | `lib/mailer.ts` |
| `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` | `lib/msg91.ts` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay routes |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook route |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | NextAuth Google provider |

### Runtime
| Variable | Default | Used In |
|----------|---------|---------|
| `PORT` | `3000` | `server.ts` (Next.js + Express) |
| `SOCKET_PORT` | `3001` | `server.ts` (Socket.io) |
| `SOCKET_URL` | `http://localhost:3001` | `lib/socket-emitter.ts` |

---

## 11. Socket.io Real-Time Layer

### Architecture
```
┌─────────────────────────────────────────────────────┐
│  Custom Express Server (server.ts)                  │
│                                                     │
│  Port 3000: Express app (Next.js handler + /emit)   │
│  Port 3001: HTTP server with Socket.io              │
│                                                     │
│  Namespaces:                                        │
│   ├── /messages    — private chat rooms             │
│   ├── /notifications — per-user notification stream │
│   └── /listings    — public listing status changes  │
└─────────────────────────────────────────────────────┘
```

### Client-Side Flow
1. User logs in → `SocketProvider` detects `session.user.id`
2. Calls `connectSocket(userId)` from `lib/socket.ts`
3. Socket authenticates with userId, joins `/notifications:user:{id}`
4. Pages subscribe to relevant rooms:
   - Messages page: `socket.emit("join", "conversation:{id}")` when viewing a conversation
   - Inventory: `socket.emit("watch", "listing:{id}")` for live status updates
5. On unmount: `socket.emit("leave", ...)` to clean up

### Server-Side Event Bridge (for API routes)
```
API Route (serverless function)
  → import { emitToUser } from "@/lib/socket-emitter"
  → fetch POST http://localhost:3001/emit  { type: "user", userId, event, data }
  → Socket.io server broadcasts to room
```

### Events
| Event | Direction | Payload | Source |
|-------|-----------|---------|--------|
| `message:new` | server→client | `{ id, content, sent, time, senderId }` | Messages API POST |
| `notification:new` | server→client | `{ type, title, message }` | Booking, Inspection, Payment API |
| `listing:status-change` | server→client | `{ status, listingId }` | Booking API |
| `typing` | client→server→client | `{ userId }` | Messages page |

---

## 12. Current State

### Complete
- **Phase 0**: Baseline commit, 3 feature branches
- **Phase 1**: 6 lib files (brandModels, slots, mailer, upload, msg91, followup)
- **Phase 2**: Prisma schema (Wishlist, Conversation, Message models)
- **Phase 3**: 7 shared components (InspectionCard, LeadCard, EmptyState, MessageThread, WishlistButton, PhotoUploadDropzone, RazorpayCheckout)
- **Phase 4**: Homepage rebuilt
- **Phase 5**: Sell form (brand dropdowns, photo upload, calendar/slots)
- **Phase 6**: Booking flow (atomic transaction, status check, email, socket)
- **Phase 7**: CRM wiring (buyer leads PATCH, seller leads approve, listing delete)
- **Phase 8**: Razorpay SDK (create-order, verify, webhook, orders page)
- **Phase 9**: Email/SMS triggers (welcome email, booking confirmation)
- **Phase 10**: Messaging API (conversations CRUD, messages page with real API)
- **Phase 11**: Wishlist migration (ActivityLog JSON → Wishlist model)
- **Phase 12**: Bug fixes (vehicle detail buttons, dashboard link, AI input, messages params type, inspector leads includes, razorpay amount, settings page, charging USD→INR, trade-in estimate, financing banks, inspection form, admin chart, inventory slider, inspector placeholder pages, orders doc buttons)

### Known Issues (non-blocking)
| Issue | Location | Severity |
|-------|----------|----------|
| No WebSocket during `next dev` alone (must use `tsx watch server.ts`) | `server.ts` | Low |
| Inspector settings, reports, field pages are placeholders | `app/(inspector)/` | Low |
| Admin listing Edit/View Details dropdown items have no onClick | `admin/listings/page.tsx` | Low |
| No `onError` handlers on mutations (errors propagate raw) | All hooks | Medium |
| `BookingData.listing` type is `VehicleListing` but API returns flat `Listing` | `hooks/use-api.ts` | Medium |
| No HTTP response validation (`.ok` check) on any fetch call | All hooks | Medium |

### Database (blocked)
- Prisma generate succeeds
- Migration requires PostgreSQL — none running locally
- `prisma migrate dev` will fail until PostgreSQL is available

### Deployment (not started)
- No Dockerfile
- No CI/CD pipeline
- No production config

---

## 13. Docs Index

All reference documents are in `.docs/`:

| File | Purpose |
|------|---------|
| `PLAN.md` | Original implementation plan (12 phases) |
| `STATUS.md` | Status tracking |
| `ISSUES.md` | Bug/issue tracker |
| `API-ROUTES.md` | API endpoint reference |
| `HOOK-CONTRACT.md` | Hook signatures and return types |
| `PAGES-INVENTORY.md` | Page-by-page inventory |
| `COMPONENT-CATALOG.md` | Component library |
| `PRISMA-ERD.md` | Entity relationship diagram |
| `RAZORPAY-SPEC.md` | Payment integration spec |
| `2WHEELER-DATA.md` | Two-wheeler brand/model data |
| `ARCHITECTURE.md` | **This file** — comprehensive reference |
