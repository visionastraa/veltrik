# API Routes Inventory

## Legend
- ✅ Functional — works with real data
- ⚠️ Needs work — has issues but exists
- ❌ Missing — referenced but doesn't exist
- ❌ Broken — exists but doesn't work correctly
- 📝 Planned — to be created in this plan

## Buyer
| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/buyer/lead` | ✅ | Zod validated, works |
| `POST /api/buyer/book` | ⚠️ | Missing Zod validation, no listing status check |
| `POST /api/buyer/send-offer` | 📝 | To be created for CRM actions |
| `POST /api/buyer/mark-converted` | 📝 | To be created |
| `POST /api/buyer/remove` | 📝 | To be created |
| `POST /api/buyer/schedule-test-ride` | 📝 | To be created |

## Seller
| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/seller/submit` | ✅ | Works |
| `POST /api/seller/schedule` | ✅ | Works, updates status + creates booking |

## Admin
| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/admin/approve` | ✅ | Creates inspection + listing |
| `POST /api/admin/reject` | ✅ | Works |
| `GET /api/admin/stats` | ✅ | Good aggregation query |
| `GET /api/admin/leads/seller` | ✅ | Works |
| `GET /api/admin/leads/buyer` | ✅ | Works |
| `GET /api/admin/inspections/[id]` | ✅ | Works |
| `PATCH /api/admin/buyer-leads/[id]` | 📝 | Needed for status updates |
| `POST /api/admin/buyer-leads/:id/view` | 📝 | Needed for view tracking |
| `POST /api/admin/buyer-leads/:id/schedule` | 📝 | Needed for schedule visit |

## Inspector
| Route | Status | Notes |
|-------|--------|-------|
| `GET /api/inspector/leads` | ✅ | Exists, lists seller leads for inspection |
| `GET /api/inspector/leads/[id]` | ✅ | Exists, single lead detail |
| `POST /api/inspection/submit` | ✅ | Exists, Zod validated. Correct route! |
| `GET /api/inspector/stats` | ❌ | Referenced by hook, doesn't exist |
| `GET /api/inspector/inspections` | ❌ | Referenced by hook, doesn't exist |
| `GET /api/inspector/inspections/[id]` | ❌ | Referenced by hook, doesn't exist |
| `POST /api/inspector/submit` | ❌ | Referenced by hook, doesn't exist. Real route is `/api/inspection/submit` |

## User
| Route | Status | Notes |
|-------|--------|-------|
| `GET /api/user/orders` | ✅ | Returns Payment records |
| `GET /api/user/bookings` | ✅ | Works |
| `GET /api/user/wishlist` | ⚠️ | Uses ActivityLog hack — to be replaced |
| `POST /api/user/wishlist` | ⚠️ | Uses ActivityLog hack — to be replaced |
| `PATCH /api/user/profile` | 📝 | To be created for settings page |
| `POST /api/user/change-password` | 📝 | To be created for security tab |

## Messaging (All 📝 Planned)
| Route | Purpose |
|-------|---------|
| `GET /api/messages/conversations` | List user's conversations |
| `POST /api/messages/conversations` | Create new conversation |
| `GET /api/messages/conversations/[id]` | Get messages in conversation |
| `POST /api/messages/conversations/[id]` | Send message |
| `PATCH /api/messages/conversations/[id]/read` | Mark all as read |

## Payments
| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/razorpay/create-order` | ❌ Broken | Stub — fake `order_` prefix, no SDK call |
| `POST /api/razorpay/verify` | ❌ Broken | Stub — no signature verification |
| `POST /api/razorpay/webhook` | 📝 | To be created |

## Wishlist (Replacement — All 📝)
| Route | Purpose |
|-------|---------|
| `GET /api/wishlist` | List user's wishlists |
| `POST /api/wishlist/toggle` | Add/remove from wishlist |

## Other
| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/upload` | ⚠️ | No auth check, no type validation, no mkdir |
| `GET /api/placeholder/[...size]` | ✅ | SVG placeholder utility |
| `POST /api/financing/apply` | 📝 | To be created |
| `POST /api/auth/register` | ✅ | Creates user, doesn't auto-login |

## Auth
| Route | Status | Notes |
|-------|--------|-------|
| `GET /api/auth/[...nextauth]` | ✅ | NextAuth handler |
| `POST /api/auth/register` | ✅ | User creation |
| `GET /api/auth/switch-user` | ⚠️ | DEV ONLY — returns demo credentials |
