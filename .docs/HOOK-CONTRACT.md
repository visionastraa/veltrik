# Hook Contracts

## `/hooks/use-api.ts` ✅ (except where noted)

### useVehicles(params?: FilterParams)
```
params: { page?, limit?, search?, brand?, minPrice?, maxPrice?, minBatteryHealth?, year?, sortBy?, status? }
→ { success: boolean, data: VehicleListing[], total, page, limit, totalPages }
```

### useVehicle(id: string)
```
id: string
→ { success: boolean, data: VehicleListing }
```

### useWishlist()
```
→ { success: boolean, data: VehicleListing[] }
```
⚠️ Backed by ActivityLog hack — will be migrated to Wishlist model.

### useToggleWishlist()
```
mutationFn(vehicleId: string) → void
```
⚠️ Same ActivityLog hack.

### useBookings()
```
→ { success: boolean, data: BookingData[] }
```

### useCreateBooking()
```
mutationFn({ listingId, buyerLeadId, scheduledAt }) → void
```

### useOrders()
```
→ { success: boolean, data: any[] }
```
⚠️ Exists but never called — `orders/page.tsx` uses `MOCK_ORDERS` instead.

### useSubmitSeller()
```
mutationFn({ make, model, variant, vehicleNumber, year, kmDriven, expectedPrice, description?, warrantyStatus?, photos })
→ void
```

### useCreateBuyerLead()
```
mutationFn({ listingId?, brandsInterested[], modelsInterested[] }) → void
```

## `/hooks/use-admin-api.ts` ✅

### useAdminStats()
### useAdminSellerLeads()
### useAdminBuyerLeads()
### useAdminReject()
### useAdminInspections()
All well-typed with proper API paths.

## `/hooks/use-inspector-api.ts` ❌ — ALL PATHS BROKEN

| Hook | Current Path | Should Point To |
|------|-------------|-----------------|
| useInspectorStats() | `GET /api/inspector/stats` ❌ | No existing equivalent — create or remove |
| useInspectorInspections() | `GET /api/inspector/inspections` ❌ | `GET /api/inspector/leads` |
| useInspectorInspection(id) | `GET /api/inspector/inspections/[id]` ❌ | `GET /api/inspector/leads/[id]` |
| useSubmitInspection() | `POST /api/inspector/submit` ❌ | `POST /api/inspection/submit` |

Types are correct (inspector stats/inspection form data interfaces).

## `/hooks/use-compare.ts` ✅
Zustand store. No API calls.

## Planned Hooks
| Hook | Source | Purpose |
|------|--------|---------|
| `useConversations()` | Phase 10 | List conversations |
| `useSendMessage()` | Phase 10 | Send message |
| `useRazorpayOrder()` | Phase 8 | Create Razorpay order |
| `useUserProfile()` | Phase 12 | GET/PATCH user profile |
