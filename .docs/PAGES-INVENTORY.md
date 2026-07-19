# Page Inventory — Every page.tsx, Its State

## Legend
- ✅ Working — real API integration, functional
- ⚠️ Needs Work — has broken features
- ❌ Broken — major features non-functional
- 🚫 Coming Soon — placeholder only
- 📝 Planned — to be created

## App Root
| Page | State | Key Issues |
|------|-------|------------|
| `app/page.tsx` | ❌ | Minimal stub — no real content |

## Dashboard (app/(dashboard)/)
| Page | State | Key Issues |
|------|-------|------------|
| `user/page.tsx` | ✅ | Working. "Find EV" links to self (minor). AI Assistant input lacks submit handler. |
| `user/bookings/page.tsx` | ✅ | Uses real hook. No pagination. `any` type for BookingCard param. |
| `user/favorites/page.tsx` | ✅ | Uses real wishlist hook. Works. |
| `user/messages/page.tsx` | ❌ | 4 hardcoded conversations. Send updates local state only. No API. |
| `user/orders/page.tsx` | ❌ | `MOCK_ORDERS` hardcoded. Ignores `useOrders()` hook. |
| `user/settings/page.tsx` | ❌ | No save logic. All inputs uncontrolled. Hardcoded profile data. |
| `inventory/page.tsx` | ✅ | Functional. Body type filter collected but not sent to API (minor). |
| `vehicles/[id]/page.tsx` | ❌ | Contact/Message buttons non-interactive `<span>` elements. |
| `sell/page.tsx` | ⚠️ | Photo upload not wired. Missing calendar in step 2. |
| `compare/page.tsx` | ✅ | Functional. Uses Zustand store + real vehicles. |
| `charging/page.tsx` | ⚠️ | USD prices. All station data hardcoded. |
| `financing/page.tsx` | ⚠️ | Apply buttons decorative. Hardcoded bank data. |
| `trade-in/page.tsx` | ❌ | All data hardcoded. Photo upload doesn't work. Buttons decorative. |

## Admin (app/(admin)/)
| Page | State | Key Issues |
|------|-------|------------|
| `admin/page.tsx` | ⚠️ | Uses real stats hook but revenue chart + pendingTasks hardcoded. |
| `admin/leads/buyer/page.tsx` | ⚠️ | Real data. 5 dropdown actions + Call/Message all decorative. |
| `admin/leads/seller/page.tsx` | ⚠️ | Make Offer toast-only. Reject works (calls real API). |
| `admin/listings/page.tsx` | ⚠️ | Delete toast-only. Edit/View Details decorative. |
| `admin/inspections/page.tsx` | ⚠️ | Uses vehicles as proxy for inspections. No inline actions. |

## Inspector (app/(inspector)/)
| Page | State | Key Issues |
|------|-------|------------|
| `inspector/page.tsx` | ❌ | Hardcoded inspections, stats, activities. |
| `inspector/inspect/[id]/page.tsx` | ❌ | Hardcoded vehicleData + toast-only submit. |
| `inspector/inspections/page.tsx` | 🚫 | Coming soon |
| `inspector/reports/page.tsx` | 🚫 | Coming soon |
| `inspector/field/page.tsx` | 🚫 | Coming soon |
| `inspector/settings/page.tsx` | 🚫 | Coming soon |
| `inspector/analytics/page.tsx` | 🚫 | Coming soon |

## Planned Pages
| Page | Phase | Purpose |
|------|-------|---------|
| None planned — keeping existing structure | | |

## Layouts
| Layout | State | Notes |
|--------|-------|-------|
| `app/layout.tsx` | ✅ | Providers, fonts, metadata |
| `app/(dashboard)/layout.tsx` | ✅ | UnifiedNavbar with mode state. Mode not passed to children. |
| `app/(admin)/layout.tsx` | ✅ | Auth guard for ADMIN/MANAGER |
| `app/(inspector)/layout.tsx` | ✅ | Auth guard for INSPECTOR/ADMIN/MANAGER |
