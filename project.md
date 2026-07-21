
VELTRIK
Project Documentation & Team Guide

Next.js 14
TypeScript
Tailwind CSS
Prisma ORM
MySQL
Auth.js

1. Project Overview
   Veltrik is a two-sided electric vehicle marketplace where sellers submit their used EVs, Veltrik inspects and acquires them, then resells them to verified buyers. The platform has three distinct application surfaces built in one Next.js codebase.

Surface
Who Uses It
Key Function
Public Website
Buyers + Sellers
Browse inventory, submit EV for sale, book visits
Inspector App
Veltrik Inspectors
Run standardized inspection checklist on-site
Admin Dashboard
Admins + Managers
Approve listings, manage leads, override pricing

2. Tech Stack
   Layer
   Technology
   Purpose
   Frontend
   Next.js 14 App Router + TypeScript
   SSR/SSG for SEO on listing pages
   Styling
   Tailwind CSS + shadcn/ui
   Component library, consistent design
   Forms
   React Hook Form + Zod
   Multi-step forms with validation
   State
   Zustand
   Multi-step form state across steps
   Backend
   Next.js API Routes
   Server-side logic, Prisma queries
   Database
   Hostinger MySQL + Prisma ORM
   Relational data — vehicles, inspections, bookings
   Auth
   Auth.js (NextAuth v5)
   Session management, RBAC roles
   Storage
   Hostinger Disk (/public/uploads)
   Vehicle photos, inspection images, documents
   Email
   Hostinger SMTP + Nodemailer
   Booking confirmations, status updates
   SMS / OTP
   MSG91
   Phone OTP verification for buyers/sellers
   Payments
   Razorpay
   Booking deposits, full purchase payments
   Deployment
   GitHub -> Hostinger Auto Deploy
   CI/CD on push to main branch
3. Database Schema (Prisma)
   All models below map directly to Hostinger MySQL. Use prisma migrate dev locally and prisma migrate deploy on Hostinger.

3.1 Users & Roles
Field
Type
Notes
id
String @id cuid()
Primary key
name
String
Full name
email
String @unique
Login identifier
phone
String?
OTP verified via MSG91
role
Enum Role
BUYER | SELLER | INSPECTOR | ADMIN | MANAGER
createdAt
DateTime
Auto timestamp

3.2 SellerLead
Field
Type
Notes
id
String @id cuid()
Primary key
userId
String FK
References User
make
String
e.g. Hero, Ola, Ather
model
String
e.g. Vida, S1 Pro
variant
String
Version/trim
vehicleNumber
String
KA05AM9207 format
year
Int
Year of registration
kmDriven
Int
Odometer reading
warrantyStatus
String
under_warranty | out_of_warranty
expectedPrice
Float
Seller's asking price
description
String?
Additional notes
photos
String[]
Array of /uploads/ paths
status
Enum SellerStatus
SUBMITTED > SCHEDULED > INSPECTED > OFFER_MADE > ACQUIRED | REJECTED
scheduledAt
DateTime?
Chosen inspection slot
createdAt
DateTime
Auto timestamp

3.3 Inspection
Linked 1:1 with SellerLead after inspector completes checklist.
Field Group
Fields
Admin / Visual
ageYears, ageMonths, kmDriven, bodyDamage, bodyDamagePhoto, forkDamage, accidentHistory, warrantyStatus, warrantyType, warrantyExpiry, partsReplaced, replacedParts, adminComments
Technical / Performance
batteryCharge, batteryHealth, batteryVoltage, physicalDamage, brakeSystem, brakePads, wheelAlignment, testDriveRating (1-5), testDriveNotes, techComments
Appraisal
finalOffer (Float), approvedBy (Admin userId), approvedAt

3.4 Listing
Field
Type
Notes
id
String @id
Primary key
inspectionId
String @unique FK
1:1 with Inspection
title
String
Auto-generated: Make Model Year
price
Float
Set by admin after inspection
status
Enum ListingStatus
AVAILABLE | RESERVED | SOLD
photos
String[]
Subset of inspection photos
publishedAt
DateTime?
When admin made it live

3.5 BuyerLead
Field
Type
Notes
id
String @id
Primary key
userId
String FK
References User
listingId
String? FK
Specific vehicle (optional)
brandsInterested
String[]
Multi-select brands
modelsInterested
String[]
Filtered from brands
status
Enum BuyerStatus
LEAD_VISIT_SCHEDULED | FOLLOW_UP_REQUIRED | CONVERTED | LOST
createdAt
DateTime
Auto timestamp

3.6 Booking
Field
Type
Notes
id
String @id
Primary key
type
Enum BookingType
SELLER_INSPECTION | BUYER_VISIT
buyerLeadId / sellerLeadId
String? FK
Depends on type
listingId
String? FK
For buyer visit bookings
scheduledAt
DateTime
Mon-Sat 10AM-6:30PM only
status
String
confirmed | cancelled | completed

4. Folder Structure
   /app  /(public)    /page.tsx                  → Homepage    /inventory                 → Buyer listing page    /inventory/[id]            → Vehicle detail + booking    /sell                      → Seller intake form (Step 1-3)    /sell/schedule             → Calendar booking step    /sell/confirm              → Booking confirmation  /(auth)    /login    /register  /(dashboard) [role-gated]    /admin/page.tsx            → Admin overview stats    /admin/leads/seller        → All seller submissions    /admin/leads/buyer         → Buyer CRM + follow-up    /admin/inspections/[id]    → Inspection detail view    /admin/listings            → Manage published listings    /inspector/page.tsx        → Inspector dashboard    /inspector/inspect/[id]    → Inspection checklist form/app/api    /auth/[...nextauth]        → Auth.js handler    /seller/submit             → POST seller intake    /seller/schedule           → POST booking slot    /buyer/lead                → POST buyer lead capture    /buyer/book                → POST buyer visit booking    /inspection/submit         → POST inspector checklist    /admin/approve             → POST approve listing    /admin/reject              → POST reject vehicle    /upload                    → POST file upload handler    /razorpay/create-order     → POST payment order    /razorpay/verify           → POST payment verification/lib    /prisma.ts                 → Prisma client singleton    /mailer.ts                 → Nodemailer SMTP config    /msg91.ts                  → SMS OTP helper    /razorpay.ts               → Payment helper    /upload.ts                 → File save to disk helper    /slots.ts                  → Booking slot logic (Mon-Sat, 10-6:30)    /scoring.ts                → EV condition scoring algorithm/components    /ui/                       → shadcn/ui components    /VehicleCard.tsx    /InspectionForm/    /BookingCalendar.tsx    /BrandModelSelector.tsx    /StatusBadge.tsx/prisma    /schema.prisma    /migrations//public    /uploads/                  → Vehicle + inspection photos
5. Page-by-Page Specification
   5.1 Homepage — /
   Item
   Detail
   Route
   /
   Rendering
   SSG (static, fast load)
   Who Sees
   All visitors
   Auth Required
   No

Sections on Page
Hero Section — headline, subheading, two CTAs: 'Sell My EV' and 'Buy an EV'
Trust Badges — '100% Inspected', 'Transparent Pricing', 'Same-Day Offer'
How It Works — 3-step seller flow illustrated + 3-step buyer flow illustrated
Featured Listings — 6 cards pulled from Listing table (status = AVAILABLE), SSG with ISR revalidation every 60s
Brand Strip — Ola, Ather, TVS, Hero, Ampere, Vida logos (filter shortcuts)
Testimonials — static section (hardcoded Phase 1)
Footer — links, social, contact

API Calls
GET /api/listings?limit=6&status=AVAILABLE — fetched at build time via getStaticProps equivalent

5.2 Inventory / Browse Page — /inventory
Item
Detail
Route
/inventory
Rendering
SSR (filters need to be server-rendered for SEO)
Who Sees
All visitors
Auth Required
No

Features
Filter sidebar — Brand, Model, Price range (slider), KM driven range, Year, Battery health range
Search bar — full-text search on title, brand, model
Sort options — Price: Low to High, Price: High to Low, Newest First, Battery Health
Vehicle cards — photo, title, price, KM, battery %, warranty badge, 'View Details' button
Pagination — 12 per page
'Reserved' badge overlay — if listing.status = RESERVED, card shows greyed overlay

API Calls
GET /api/listings?brand=&model=&minPrice=&maxPrice=&sort= — server-side with Prisma filters

5.3 Vehicle Detail Page — /inventory/[id]
Item
Detail
Route
/inventory/[id]
Rendering
SSR
Who Sees
All visitors
Auth Required
No (booking requires auth)

Sections on Page
Image gallery — main photo + thumbnails, lightbox on click
Vehicle summary — title, price, year, KM driven, brand, model, variant, vehicle number (masked: KA05**9207)
Veltrik Inspection Report card — battery charge %, battery health %, brake status, wheel alignment, test drive rating (stars), body condition, accident history badge
Warranty info block — status, type, expiry date if applicable
Specification table — all fields from inspection
Sticky booking CTA sidebar — 'Book a Visit to View' / 'Buy Now' buttons
Lead capture modal — triggers on CTA click, collects: Name, Phone (OTP), Email, brands/models interested

Business Logic
If listing.status = RESERVED — CTA changes to 'Join Waitlist'
If listing.status = SOLD — page shows sold badge, CTA hidden
On booking confirm — listing.status set to RESERVED until visit completed

5.4 Sell My EV — Multi-Step Form — /sell
Item
Detail
Route
/sell → /sell/schedule → /sell/confirm
Rendering
CSR (form state managed by Zustand)
Who Sees
Sellers
Auth Required
Optional at submission, required for tracking

Step 1 — Vehicle Details (/sell)
Fields: Make (dropdown), Model (conditional dropdown), Variant, Vehicle Number, Year of Registration, KM Driven, Warranty Status (toggle), Expected Price, Description (textarea)
Photos upload — drag & drop, up to 10 photos, max 5MB each, saved to /public/uploads/seller/{id}/
Validation via Zod — all required fields before proceeding

Step 2 — Schedule Inspection (/sell/schedule)
Calendar widget — greys out Sundays automatically
Time slots — 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 17:30 (last slot)
Slot availability — fetched from Bookings table, slots with 3+ bookings on same date grayed out (workshop capacity = 3 simultaneous)
On slot select — highlight selected, show confirm button

Step 3 — Confirmation (/sell/confirm)
Summary card — all submitted details
Booking reference number — auto-generated
Email confirmation sent via Nodemailer (SMTP)
SMS confirmation via MSG91

5.5 Auth Pages — /login and /register
Auth.js with credentials provider (email + password)
Google OAuth option
Phone OTP via MSG91 for sellers/buyers
Role assigned at registration — default BUYER, SELLER on first 'Sell My EV' submission
Redirect after login — back to intended page via callbackUrl

5.6 Inspector Dashboard — /inspector
Item
Detail
Route
/inspector
Rendering
CSR
Who Sees
Inspectors only (role = INSPECTOR)
Auth Required
Yes — redirect to /login if not authenticated

Dashboard View
Today's scheduled inspections — list with seller name, vehicle, time slot
Pending inspections — not yet started
Completed today — count badge

Inspection Form — /inspector/inspect/[id]
Two-part form. All data saved to Inspection table on submit.

Part 1 — Administrative & Visual Checks
Check Item
Input Type
Age of Vehicle
Number inputs for years and months
KM Driven
Number input
Body Damage
Radio: Pass / Minor / Severe + optional photo upload
Fork Damage
Toggle: Pass / Fail
Accidental Damage
Radio: Clean / History Found
Warranty Status
Radio: Under Warranty / Out of Warranty
Warranty Type
Conditional: Standard / Extended (shows if under warranty)
Warranty Period
Date picker (shows if under warranty)
Parts Replaced Under Warranty
Toggle Yes/No
Replaced Parts List
Text field (shows if Yes above)
Additional Comments
Textarea

Part 2 — Technical & Performance Tests
Test Item
Input Type
Battery Charge Level
Number input (%)
Battery Health
Number input (%)
Battery Voltage
Number input (V)
Physical Damage External
Toggle: Pass / Fail
Brake System
Radio: Pass / Needs Repair
Brake Pads
Radio: Good / Worn
Wheel Alignment
Radio: Aligned / Needs Alignment
Test Drive Rating
Star rating 1-5
Test Drive Notes
Textarea
Additional Comments
Textarea

On Submit
Inspection record created in DB
SellerLead.status updated to INSPECTED
Admin notified via email — new inspection ready for appraisal

5.7 Admin Dashboard — /admin
Item
Detail
Route
/admin
Who Sees
ADMIN + MANAGER roles only
Auth Required
Yes — RBAC middleware on all /admin routes

Overview Page /admin
Stats cards — Total Vehicles Acquired (this month), Active Listings, Pending Inspections, Buyer Leads, Follow-Up Required count
Recent activity feed — last 10 actions across all tables

Seller Leads — /admin/leads/seller
Table with all SellerLead records
Columns — Seller Name, Vehicle, Submitted Date, Scheduled Date, Status badge, Actions
Actions per row — View Details, Assign Inspector, Mark Inspected, Make Offer, Approve/Reject
Filter by status, date range, make/model

Inspection Review — /admin/inspections/[id]
Full inspection report display — all Part 1 and Part 2 data
Photo gallery of inspection photos
Appraisal section — admin inputs Final Offer price
Two action buttons — Approve (creates Listing) / Reject (notifies seller)
MANAGER role required to approve/reject (INSPECTOR role = read-only view)

Listings Management — /admin/listings
All published listings with status, price, buyer interest count
Edit price, toggle availability, mark as sold
View buyer leads interested in each listing

Buyer CRM — /admin/leads/buyer
All BuyerLead records
Status filter — LEAD_VISIT_SCHEDULED, FOLLOW_UP_REQUIRED, CONVERTED, LOST
Auto-flag — if visit was 24h+ ago and status still LEAD_VISIT_SCHEDULED → auto-update to FOLLOW_UP_REQUIRED (cron job or on-read trigger)
Click row → view buyer details, edit status, add notes

6. Key Algorithms & Business Logic
   6.1 Booking Slot Availability Logic
   File: /lib/slots.ts
   Query Bookings table: SELECT scheduledAt, COUNT(*) GROUP BY scheduledAt WHERE type = SELLER_INSPECTION
   Workshop capacity = 3 vehicles per slot
   Block Sundays (getDay() === 0)
   Block times before 10:00 and after 17:30
   Return available slots for chosen date

6.2 EV Condition Scoring Algorithm
File: /lib/scoring.ts — Used internally by inspector app to compute condition score (0-100). Not shown to seller.
Factor
Weight
Scoring Logic
Battery Health
35%
Health % × 0.35 (e.g. 85% health = 29.75 points)
KM Driven
20%
0km=20, 10k=18, 20k=15, 30k=12, 40k=9, 50k+=5
Vehicle Age
15%
1yr=15, 2yr=13, 3yr=11, 4yr=8, 5yr+=5
Body Condition
15%
Pass=15, Minor=8, Severe=0
Brake System
10%
Pass=10, Needs Repair=0
Accident History
5%
Clean=5, History Found=0

Final score determines offer band: 85-100 = Premium, 70-84 = Good, 50-69 = Fair, <50 = Reject

6.3 Follow-Up Auto-Trigger
File: /lib/followup.ts (called on admin CRM page load + optional cron)
Query BuyerLead WHERE status = LEAD_VISIT_SCHEDULED AND booking.scheduledAt < NOW() - 24 hours
Batch UPDATE status to FOLLOW_UP_REQUIRED
Send alert email to sales team via Nodemailer

6.4 Conditional Brand-Model Dropdown
File: /lib/brandModels.ts — Static map, no DB call needed.
Brand
Available Models
Ola
S1 Pro Gen 1, S1 Pro Gen 2, S1 X, S1 Air
Ather
450X, 450 Apex, Rizta
TVS
iQube, iQube S, iQube ST
Hero
Vida V1 Plus, Vida V1 Pro
Ampere
Magnus Pro, Zeal, Primus
Bajaj
Chetak Premium, Chetak Urban

Logic: when user selects multiple brands, flatten all model arrays into single dropdown list.

7. Phase 2 — AI Price Estimation Engine
   To be built after 6 months of data collection (minimum ~200 inspections for meaningful training data).

7.1 Architecture
Separate Python FastAPI microservice hosted on Railway
Next.js API route /api/estimate proxies to FastAPI
Model: XGBoost regression trained on historical inspection + final offer data

7.2 Input Features
make, model, variant (encoded)
year, km_driven, battery_health, battery_charge
body_condition score, accident_history, brake_status
warranty_remaining_months
market_trend_index (scraped from OLX/Cars24 periodically)

7.3 Output
JSON: { min_price: 75000, max_price: 82000, confidence: 0.87 }
Displayed to seller on /sell page as: 'Estimated Value: ₹75,000 – ₹82,000'
Disclaimer: 'This is an AI estimate. Final binding offer decided after physical inspection.'

7.4 Data Collection Strategy (Phase 1)
Every Inspection record + finalOffer is your training row
Store market comparison data — add MarketComparison table with OLX listing prices for same model/year scraped weekly
After 200+ records, retrain monthly

8. Environment Variables
   Create .env.local for development. Set same keys in Hostinger environment settings for production.

# DatabaseDATABASE_URL=mysql://user:pass@host:3306/veltrik# Auth.jsNEXTAUTH_SECRET=your-secret-hereNEXTAUTH_URL=https://yourdomain.com# Google OAuth (optional)GOOGLE_CLIENT_ID=GOOGLE_CLIENT_SECRET=# Hostinger SMTPSMTP_HOST=smtp.hostinger.comSMTP_PORT=465SMTP_USER=noreply@yourdomain.comSMTP_PASS=# MSG91 OTPMSG91_AUTH_KEY=MSG91_TEMPLATE_ID=# RazorpayRAZORPAY_KEY_ID=RAZORPAY_KEY_SECRET=# AppNEXT_PUBLIC_APP_URL=https://yourdomain.comUPLOAD_DIR=public/uploads

9. Team Task Division (6 Members)
   Each member owns a vertical slice — full stack for their module. This avoids merge conflicts and lets everyone contribute independently. All work is in the same Next.js repo, just different routes and API files.

Samera Aryaa — Lead Developer / Project Architect
Responsibility: Foundation setup + Seller Flow

Task
Files / Routes
Project setup
next.js init, Prisma schema, tailwind config, shadcn setup
Database
prisma/schema.prisma — all models, migrations
Auth setup
Auth.js config, middleware.ts (RBAC), /login, /register
Seller intake form Step 1
/app/(public)/sell/page.tsx
File upload API
/app/api/upload/route.ts + /lib/upload.ts
Seller submit API
/app/api/seller/submit/route.ts
Booking slots logic
/lib/slots.ts
Environment + deployment
.env setup, Hostinger deploy config, GitHub Actions

Shantanu + Shashwat — Frontend Buyer Experience
Responsibility: Public-facing buyer pages

Task
Files / Routes
Homepage
/app/(public)/page.tsx — all sections
Inventory listing page
/app/(public)/inventory/page.tsx
Vehicle detail page
/app/(public)/inventory/[id]/page.tsx
Image gallery component
/components/ImageGallery.tsx
Vehicle card component
/components/VehicleCard.tsx
Listings API
/app/api/listings/route.ts (GET with filters)
Single listing API
/app/api/listings/[id]/route.ts
Brand/Model filter logic
/lib/brandModels.ts

Shantanu + Shashwat — Buyer Lead Capture & Booking
Responsibility: Buyer flow + booking system

Task
Files / Routes
Lead capture modal component
/components/LeadCaptureModal.tsx
Brand-model selector component
/components/BrandModelSelector.tsx
Buyer lead submit API
/app/api/buyer/lead/route.ts
Buyer booking widget
/components/BookingCalendar.tsx
Buyer booking API
/app/api/buyer/book/route.ts
 OTP integration
/lib/msg91.ts + OTP modal component
Booking confirmation page
/app/(public)/inventory/[id]/confirm/page.tsx
Listing status logic
RESERVED state on booking, AVAILABLE on cancel

Sreeju S — Seller Schedule + Inspector App
Responsibility: Seller scheduling + Inspector checklist

Task
Files / Routes
Seller schedule page
/app/(public)/sell/schedule/page.tsx
Seller confirm page
/app/(public)/sell/confirm/page.tsx
Schedule booking API
/app/api/seller/schedule/route.ts
Inspector dashboard
/app/(dashboard)/inspector/page.tsx
Inspection form Part 1
/components/InspectionForm/Part1.tsx
Inspection form Part 2
/components/InspectionForm/Part2.tsx
Inspection submit API
/app/api/inspection/submit/route.ts
Scoring algorithm
/lib/scoring.ts

Ajay Tainwala — Admin Dashboard
Responsibility: Admin panel — all management views

Task
Files / Routes
Admin overview page
/app/(dashboard)/admin/page.tsx
Seller leads table
/app/(dashboard)/admin/leads/seller/page.tsx
Inspection review page
/app/(dashboard)/admin/inspections/[id]/page.tsx
Approve/Reject API
/app/api/admin/approve/route.ts + reject
Listings management page
/app/(dashboard)/admin/listings/page.tsx
Edit listing API
/app/api/admin/listings/[id]/route.ts (PATCH)
Stats API
/app/api/admin/stats/route.ts
Status badge component
/components/StatusBadge.tsx

Shantanu + Shashwat — Buyer CRM + Notifications + Payments
Responsibility: Buyer CRM, email/SMS, Razorpay

Task
Files / Routes
Buyer CRM page
/app/(dashboard)/admin/leads/buyer/page.tsx
Follow-up trigger logic
/lib/followup.ts
Update buyer status API
/app/api/admin/buyer/[id]/route.ts (PATCH)
Nodemailer email service
/lib/mailer.ts + email templates
Email trigger integration
Booking confirm, inspection done, offer made, listing live
Razorpay order API
/app/api/razorpay/create-order/route.ts
Razorpay verify API
/app/api/razorpay/verify/route.ts
Payment UI component
/components/PaymentButton.tsx

10. Git Workflow for Team
    All 6 members work on the same GitHub repo. Follow this branch strategy strictly to avoid conflicts.

Branch Strategy
Branch
Purpose
Who
main
Production — Hostinger auto-deploys from here
Lead Dev only merges
dev
Integration branch — all features merge here first
All members PR to devxx
feat/seller-flow
Member 1 work
Samera Aryaa
feat/buyer-pages
Member 2 work
Shantanu + Shashwat
feat/buyer-booking
Member 3 work
Shantanu + Shashwat
feat/inspector-app
Member 4 work
Sreeju S
feat/admin-dashboard
Member 5 work
Ajay Tainwala
feat/crm-payments
Member 6 work
Shantanu + Shashwat

Daily Workflow

1. git pull origin dev at start of every day
2. Work on your feature branch only
3. Commit small, specific changes — not one giant commit
4. Raise PR to dev when feature is complete
5. Lead Dev reviews + merges to dev
6. Lead Dev merges dev to main for deployment

Commit Message Format
feat(seller): add multi-step form step 1 validation
fix(inspector): correct battery health field validation
chore(db): add BuyerLead migration

12. Pre-Launch Checklist
    Item
    Owner
    Status
    Prisma migrations run on production DB
    Member 1
    [ ]
    Environment variables set on Hostinger
    Member 1
    [ ]
    Auth.js secret set + NEXTAUTH_URL correct
    Member 1
    [ ]
    File upload directory created + write permissions
    Member 1
    [ ]
    SMTP email tested (booking confirmation sends)
    Member 6
    [ ]
    MSG91 OTP tested on real phone number
    Member 3
    [ ]
    Razorpay test mode payments working
    Member 6
    [ ]
    Razorpay switched to live mode
    Member 6
    [ ]
    All /admin routes blocked to non-admin users
    Member 1 + 5
    [ ]
    All /inspector routes blocked to non-inspector
    Member 1 + 4
    [ ]
    Booking calendar blocks Sundays correctly
    Member 4
    [ ]
    Slot capacity limit (3 per slot) tested
    Member 4
    [ ]
    Listing status RESERVED on buyer booking
    Member 3
    [ ]
    Follow-up trigger tested (24h logic)
    Member 6
    [ ]
    Mobile responsiveness tested on all public pages
    Member 2 + 3
    [ ]
    GitHub main branch protected (require PR)
    Member 1
    [ ]

— End of Veltrik Project Documentation v1.0 —
