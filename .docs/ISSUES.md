# All Issues Found — Veltrik Codebase Review

## Critical (3)

### C1. Inspector Inspect Page — No API Call
- **File**: `app/(inspector)/inspector/inspect/[id]/page.tsx:102-108`
- **Problem**: `handleSubmit` uses `setTimeout(2000)` + toast. No data is sent anywhere.
- **Impact**: Completed inspections are lost. Inspector "submits" nothing.
- **Fix**: Call `POST /api/inspection/submit` with form data via `useSubmitInspection`.

### C2. Vehicle Detail — Contact/Message Buttons Are Non-Interactive
- **File**: `app/(dashboard)/vehicles/[id]/page.tsx:152-157`
- **Problem**: `<span>` with `asChild` renders as plain text. Click does nothing.
- **Impact**: Users cannot contact sellers from the vehicle detail page.
- **Fix**: Replace with real `<Button>` with `onClick` handlers.

### C3. Inspector Hooks Point to Nonexistent Routes
- **File**: `hooks/use-inspector-api.ts:78-113`
- **Problem**: All 4 hooks call routes that don't exist (`/api/inspector/stats`, `/api/inspector/inspections`, `/api/inspector/inspections/[id]`, `/api/inspector/submit`).
- **Impact**: Any page using these hooks will get 404 errors.
- **Fix**: Create proper inspector API routes or fix hook paths to use existing routes (`/api/inspector/leads`, `/api/inspection/submit`).

## High (5)

### H1. Inspector Inspect Page — Hardcoded vehicleData
- **File**: `app/(inspector)/inspector/inspect/[id]/page.tsx:24-40`
- **Problem**: Hardcoded Tesla Model 3 data. `params.id` is ignored.
- **Fix**: Fetch from `GET /api/inspector/leads/[id]`.

### H2. Inspector Dashboard — All Data Hardcoded
- **File**: `app/(inspector)/inspector/page.tsx:53-132`
- **Problem**: `todayInspections`, `stats`, `activities` all hardcoded.
- **Fix**: Fetch from `GET /api/inspector/leads` (exists).

### H3. User Settings Page — No Save Logic
- **File**: `app/(dashboard)/user/settings/page.tsx`
- **Problem**: All inputs uncontrolled (`defaultValue`), buttons do nothing.
- **Fix**: Wire to `PATCH /api/user/profile` + `POST /api/user/change-password`.

### H4. Sell Form — Photo Upload Not Wired
- **File**: `app/(dashboard)/sell/page.tsx:113-117`
- **Problem**: Dashed div has `cursor-pointer` but no `onClick` handler, no hidden `<input type="file">`. Zod schema requires `photos: z.array(z.string()).min(1)`.
- **Fix**: Add hidden file input + onClick handler. Upload via `/api/upload`.

### H5. Inspector 6 Sub-Pages Are "Coming Soon"
- **Files**: `app/(inspector)/inspector/{reports,field,settings,analytics,inspections}/page.tsx`
- **Problem**: All are 21-22 line placeholders with no real content.
- **Fix**: Build inspections list page; leave reports/field/settings/analytics as TBD.

## Medium (8)

### M1. Admin Revenue Chart Hardcoded
- **File**: `app/(admin)/admin/page.tsx:43-56`
- **Problem**: Monthly revenue data is hardcoded, not fetched from any API.
- **Fix**: Create revenue API endpoint or mark as future work.

### M2. Admin pendingTasks Hardcoded
- **File**: `app/(admin)/admin/page.tsx:141-146`
- **Problem**: Task list is hardcoded.
- **Fix**: Wire to real data from `useAdminStats()` hook.

### M3. Admin Buyer Leads — All Dropdown Actions Decorative
- **File**: `app/(admin)/admin/leads/buyer/page.tsx:214-230`
- **Problem**: View Profile, Schedule Visit, Send Message, Mark Converted, Mark Lost all do nothing.
- **Fix**: Wire each to its API call (need to create some routes).

### M4. Charging Page — USD Prices
- **File**: `app/(dashboard)/charging/page.tsx:29-108`
- **Problem**: All station prices in USD ($0.35/kWh etc.), platform is India/INR.
- **Fix**: Convert to ₹. Add realistic 2-wheeler charging rates.

### M5. Financing Page — Apply Buttons Decorative
- **File**: `app/(dashboard)/financing/page.tsx`
- **Problem**: "Apply for Loan" and "Apply Now" do nothing.
- **Fix**: Wire to `POST /api/financing/apply` (create route).

### M6. Trade-in Page — Fully Hardcoded
- **File**: `app/(dashboard)/trade-in/page.tsx`
- **Problem**: Makes, models, market comparison, prices all hardcoded.
- **Fix**: Mark as out of scope for now.

### M7. Sell Form — Missing Calendar in Step 2
- **File**: `app/(dashboard)/sell/page.tsx:104-120`
- **Problem**: Step 2 has no date/time picker for inspection scheduling.
- **Fix**: Add calendar + time slot grid. Wire to submit payload.

### M8. Admin Listings — Delete is Toast-Only
- **File**: `app/(admin)/admin/listings/page.tsx:296-301`
- **Problem**: Delete button shows toast but doesn't call API.
- **Fix**: Call `DELETE /api/vehicles/[id]`.

## Low (7)

### L1. "Find EV" Links to /user (Self)
- **File**: `app/(dashboard)/user/page.tsx:27`
- **Fix**: Change to `/inventory`.

### L2. AI Assistant Input Has No Submit
- **File**: `app/(dashboard)/user/page.tsx:350-352`
- **Fix**: Add onSubmit/onClick handler.

### L3. Inventory Body Type Filter Not Sent to API
- **File**: `app/(dashboard)/inventory/page.tsx` sidebar
- **Fix**: Add `bodyType` param to useVehicles().

### L4. Google OAuth Will Crash
- **File**: `.env.local:11-12`
- **Problem**: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are empty strings.
- **Fix**: Needs real credentials from Google Cloud Console.

### L5. @next-auth/prisma-adapter Not Wired
- **File**: `package.json:18`, `lib/auth.ts`
- **Problem**: Package installed but never configured in auth options.
- **Fix**: Wire adapter if needed for database sessions (optional with JWT strategy).

### L6. Inventory Route Uses `any` Type
- **File**: `app/api/vehicles/route.ts:19,57`
- **Fix**: Use proper Prisma input types.

### L7. Env Variables Commented Out
- **File**: `.env.local:24-26`
- **Problem**: Razorpay and MSG91 keys are commented out.
- **Fix**: Uncomment and fill with real values during deployment.
