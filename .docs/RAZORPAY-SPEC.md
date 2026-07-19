# Razorpay Integration Specification

## Current State (Broken)
- `create-order/route.ts`: Local `order_${Date.now()}` prefix, no SDK call
- `verify/route.ts`: No signature verification, directly sets `status: "paid"`
- `.env.local`: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` commented out
- No webhook handler exists

## Production Standards

### 1. Install SDK
```bash
npm install razorpay
```

### 2. Environment Variables
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Create Order — `app/api/razorpay/create-order/route.ts`
```typescript
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  const { bookingId, amount } = await request.json()
  // amount MUST be in paise (₹500 = 50000)
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `booking_${bookingId}_${Date.now()}`,
  }
  const order = await razorpay.orders.create(options)
  // Store order.id (starts with "order_") in Payment record
  // Return { orderId: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY_ID }
}
```

### 4. Verify Payment — `app/api/razorpay/verify/route.ts`
```typescript
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpay_signature)
  )
  
  if (!isValid) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
  }
  
  // Update Payment status to "paid"
  // Update Booking status to "paid"
  // Log activity
}
```

### 5. Webhook — `app/api/razorpay/webhook/route.ts`
```typescript
// Verify webhook signature (DIFFERENT from payment signature!)
// Keyed with RAZORPAY_WEBHOOK_SECRET, over raw body bytes
// Handle: payment.captured → update Payment + Booking
// Handle: payment.failed → update status, log failure
// Return 200 quickly, process asynchronously
```

### 6. Frontend — `components/payment/RazorpayCheckout.tsx`
```
Flow:
1. User clicks "Pay Now"
2. Component calls POST /api/razorpay/create-order
3. Loads Razorpay SDK script: https://checkout.razorpay.com/v1/checkout.js
4. Opens Razorpay checkout modal with:
   - key, amount, currency, name, description, order_id
   - prefill: name, email, contact
   - handler: on success, call POST /api/razorpay/verify
   - modal: backdropClose: false
5. On verify success → show confirmation
6. On failure → show error + retry option
```

### 7. Orders Page — `app/(dashboard)/user/orders/page.tsx`
- Replace `MOCK_ORDERS` with `useOrders()` hook data
- Map `Payment` records to order card display
- Status mapping: `created → processing`, `paid → completed`, `failed → failed`
- Keep existing UI components, just swap data source

## Key Differences: Payment vs Webhook Signature

| Aspect | Payment Verification | Webhook Verification |
|--------|-------------------|-------------------|
| Secret | `RAZORPAY_KEY_SECRET` | `RAZORPAY_WEBHOOK_SECRET` |
| Input | `order_id|payment_id` | Raw request body (bytes) |
| Algorithm | `crypto.createHmac('sha256')` | Same HMAC SHA256 |
| Security | `timingSafeEqual` | `timingSafeEqual` |

## Error States to Handle
1. Razorpay API unreachable → retry with backoff
2. Payment cancelled by user → do nothing, booking stays "confirmed"
3. Signature mismatch → log + return 400
4. Duplicate webhook → idempotency via `razorpayPaymentId` unique constraint
5. Amount mismatch → reject if frontend sends different amount than backend expects
