# Component Catalog

## Existing Components (No Work Needed)
- `app/components/ui/button.tsx` — shadcn Button
- `app/components/ui/card.tsx` — shadcn Card
- `app/components/ui/badge.tsx` — shadcn Badge
- `app/components/ui/input.tsx` — shadcn Input
- `app/components/ui/select.tsx` — shadcn Select
- All other shadcn components installed in Radix

## Existing Components (In Review)
- `app/components/layout/UnifiedNavbar.tsx` — ✅ Works, role-based nav
- `app/components/layout/Footer.tsx` — ✅ (verify existence)

## Components to Create (Phase 3)

### InspectionCard
- **File**: `components/inspection/InspectionCard.tsx`
- **Props**: `inspection: InspectionData`
- **Purpose**: Summary card for inspection in inspector dashboard + admin views
- **Shows**: Vehicle name, status badge, battery health, seller name, score
- **Actions**: Start/Continue, View Details, Call Seller

### LeadCard
- **File**: `components/leads/LeadCard.tsx`
- **Props**: `lead: LeadData, onAction: (action: string, leadId: string) => void`
- **Purpose**: Reusable lead display for buyer + seller CRM
- **Shows**: User info, interest/brands, status, date
- **Actions**: Configurable via `onAction` callback

### EmptyState
- **File**: `components/ui/EmptyState.tsx`
- **Props**: `icon: React.ComponentType, title: string, description?: string, action?: { label: string, onClick: () => void }`
- **Purpose**: Generic empty state for any list/table

### MessageThread
- **File**: `components/messages/MessageThread.tsx`
- **Props**: `messages: Message[], currentUserId: string, onSend?: (content: string) => void`
- **Purpose**: Chat bubble display with sent/received styling
- **Features**: Auto-scroll to bottom, typing indicator slot

### WishlistButton
- **File**: `components/ui/WishlistButton.tsx`
- **Props**: `listingId: string, isWishlisted: boolean, onToggle: () => void, size?: 'sm' | 'md'`
- **Purpose**: Heart icon toggle with optimistic UI update
- **Integration**: Calls `POST /api/wishlist/toggle`

### PhotoUploadDropzone
- **File**: `components/ui/PhotoUploadDropzone.tsx`
- **Props**: `onUpload: (files: File[]) => void, maxFiles?: number, maxSizeMB?: number, accept?: string`
- **Purpose**: Drag-drop + click upload with preview thumbnails
- **Features**: Shows existing photos, remove button, progress indicator

### RazorpayCheckout
- **File**: `components/payment/RazorpayCheckout.tsx`
- **Props**: `amount: number, bookingId: string, onSuccess: (payment) => void, onFailure: (error) => void`
- **Purpose**: Razorpay SDK checkout wrapper
- **Flow**:
  1. Calls `POST /api/razorpay/create-order`
  2. Loads Razorpay SDK script dynamically
  3. Opens checkout with order ID + prefill
  4. On success: calls `POST /api/razorpay/verify`
  5. Calls `onSuccess` or `onFailure` callback
