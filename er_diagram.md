# Veltrik — Complete Entity-Relationship (ER) Diagram & Architecture Specification

Veltrik is a C2B used electric vehicle (EV) marketplace. Below is the complete, production-accurate ER diagram, complete entity definitions, relationship specifications, state machine flows, and notification triggers.

---

## 1. Entity Definitions

### User
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **name** | string | NOT NULL |
| **email** | string | UNIQUE, NOT NULL |
| **password** | string | NOT NULL |
| **phone** | string | Nullable |
| **role** | enum | NOT NULL, default `BUYER` (`BUYER`, `SELLER`, `INSPECTOR`, `ADMIN`, `MANAGER`) |
| **emailVerified** | datetime | Nullable |
| **image** | string | Nullable |
| **city** | string | Nullable |
| **address** | string | Nullable |
| **createdAt** | datetime | NOT NULL |
| **updatedAt** | datetime | NOT NULL |

---

### SellerLead
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **userId** | string | FK → `User.id`, NOT NULL |
| **make** | string | NOT NULL |
| **model** | string | NOT NULL |
| **variant** | string | NOT NULL |
| **vehicleNumber** | string | NOT NULL |
| **year** | integer | NOT NULL |
| **kmDriven** | integer | NOT NULL |
| **warrantyStatus** | string | NOT NULL |
| **expectedPrice** | float | NOT NULL |
| **description** | string | Nullable |
| **photos** | string[] | NOT NULL (JSON stringified array) |
| **status** | enum | default `SUBMITTED` (`SUBMITTED`, `SCHEDULED`, `INSPECTED`, `OFFER_MADE`, `ACQUIRED`, `REJECTED`) |
| **scheduledAt** | datetime | Nullable |
| **createdAt** | datetime | NOT NULL |
| **updatedAt** | datetime | NOT NULL |

> [!NOTE]
> `inspectorId` is deliberately excluded from `SellerLead`. Inspectors are assigned exclusively through the `Inspection` record.

---

### Inspection
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **sellerLeadId** | string | FK → `SellerLead.id`, UNIQUE (1:1) |
| **inspectorId** | string | FK → `User.id`, NOT NULL |
| **ageYears** | integer | Nullable |
| **ageMonths** | integer | Nullable |
| **kmDriven** | integer | Nullable |
| **bodyDamage** | string | Nullable |
| **bodyDamagePhoto** | string | Nullable |
| **forkDamage** | boolean | Nullable |
| **accidentHistory** | string | Nullable |
| **warrantyStatus** | string | Nullable |
| **warrantyType** | string | Nullable |
| **warrantyExpiry** | datetime | Nullable |
| **partsReplaced** | boolean | Nullable |
| **replacedParts** | string[] | Nullable |
| **adminComments** | string | Nullable |
| **batteryCharge** | float | Nullable |
| **batteryHealth** | float | Nullable |
| **batteryVoltage** | float | Nullable |
| **physicalDamage** | boolean | Nullable |
| **brakeSystem** | string | Nullable |
| **brakePads** | string | Nullable |
| **wheelAlignment** | string | Nullable |
| **testDriveRating** | integer | Nullable |
| **testDriveNotes** | string | Nullable |
| **techComments** | string | Nullable |
| **finalOffer** | float | Nullable |
| **approvedById** | string | FK → `User.id`, Nullable |
| **approvedAt** | datetime | Nullable |
| **inspectionComplete** | boolean | default `false` |
| **createdAt** | datetime | NOT NULL |
| **updatedAt** | datetime | NOT NULL |

---

### Listing
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **inspectionId** | string | FK → `Inspection.id`, UNIQUE (1:1) |
| **title** | string | NOT NULL |
| **price** | float | NOT NULL |
| **status** | enum | default `AVAILABLE` (`AVAILABLE`, `PULLED`, `SOLD`) |
| **photos** | string[] | NOT NULL, independently editable by admin |
| **publishedAt** | datetime | Nullable |
| **createdAt** | datetime | NOT NULL |
| **updatedAt** | datetime | NOT NULL |

---

### BuyerLead
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **userId** | string | FK → `User.id`, Nullable |
| **listingId** | string | FK → `Listing.id`, Nullable |
| **name** | string | NOT NULL |
| **phone** | string | NOT NULL |
| **email** | string | Nullable |
| **message** | string | Nullable |
| **contactMethod** | enum | NOT NULL (`WHATSAPP`, `PHONE`, `FORM`) |
| **createdAt** | datetime | NOT NULL |

> [!IMPORTANT]
> Composite unique constraint: `(phone, listingId)` to prevent duplicate buyer inquiries per listing.

---

### Wishlist
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **userId** | string | FK → `User.id`, NOT NULL |
| **listingId** | string | FK → `Listing.id`, NOT NULL |
| **createdAt** | datetime | NOT NULL |

> [!IMPORTANT]
> Composite unique constraint: `(userId, listingId)`

---

### ActivityLog
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **userId** | string | FK → `User.id`, NOT NULL |
| **action** | string | NOT NULL |
| **description** | string | NOT NULL |
| **entityType** | string | NOT NULL (e.g., `SellerLead`, `Listing`, `Inspection`) |
| **entityId** | string | NOT NULL |
| **metadata** | json | Nullable |
| **createdAt** | datetime | NOT NULL |

---

### NotificationLog
| Field | Type | Constraint |
|---|---|---|
| **id** | string | PK, CUID |
| **userId** | string | FK → `User.id`, NOT NULL |
| **type** | string | NOT NULL (e.g., `INSPECTION_ASSIGNED`, `INSPECTION_COMPLETED`, `OFFER_MADE`) |
| **channel** | enum | NOT NULL (`EMAIL`, `SMS`, `IN_APP`) |
| **status** | enum | NOT NULL (`SENT`, `FAILED`) |
| **payload** | json | Nullable |
| **createdAt** | datetime | NOT NULL |

---

## 2. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SELLER_LEAD : "submits (userId)"
    USER ||--o{ INSPECTION : "assigned inspector (inspectorId)"
    USER ||--o{ INSPECTION : "approver (approvedById)"
    USER ||--o{ BUYER_LEAD : "creates lead (userId)"
    USER ||--o{ WISHLIST : "saves wishlist (userId)"
    USER ||--o{ ACTIVITY_LOG : "triggers activity (userId)"
    USER ||--o{ NOTIFICATION_LOG : "receives notification (userId)"

    SELLER_LEAD ||--|| INSPECTION : "has 1:1 inspection (sellerLeadId)"
    INSPECTION ||--|| LISTING : "publishes 1:1 listing (inspectionId)"

    LISTING ||--o{ BUYER_LEAD : "receives inquiry (listingId)"
    LISTING ||--o{ WISHLIST : "added to wishlist (listingId)"

    USER {
        string id PK
        string name
        string email UK
        string password
        string phone
        string role
        datetime emailVerified
        string image
        string city
        string address
        datetime createdAt
        datetime updatedAt
    }

    SELLER_LEAD {
        string id PK
        string userId FK
        string make
        string model
        string variant
        string vehicleNumber
        int year
        int kmDriven
        string warrantyStatus
        float expectedPrice
        string description
        string_array photos
        string status
        datetime scheduledAt
        datetime createdAt
        datetime updatedAt
    }

    INSPECTION {
        string id PK
        string sellerLeadId FK, UK
        string inspectorId FK
        int ageYears
        int ageMonths
        int kmDriven
        string bodyDamage
        string bodyDamagePhoto
        boolean forkDamage
        string accidentHistory
        string warrantyStatus
        string warrantyType
        datetime warrantyExpiry
        boolean partsReplaced
        string replacedParts
        string adminComments
        float batteryCharge
        float batteryHealth
        float batteryVoltage
        boolean physicalDamage
        string brakeSystem
        string brakePads
        string wheelAlignment
        int testDriveRating
        string testDriveNotes
        string techComments
        float finalOffer
        string approvedById FK
        datetime approvedAt
        boolean inspectionComplete
        datetime createdAt
        datetime updatedAt
    }

    LISTING {
        string id PK
        string inspectionId FK, UK
        string title
        float price
        string status
        string_array photos
        datetime publishedAt
        datetime createdAt
        datetime updatedAt
    }

    BUYER_LEAD {
        string id PK
        string userId FK
        string listingId FK
        string name
        string phone
        string email
        string message
        string contactMethod
        datetime createdAt
    }

    WISHLIST {
        string id PK
        string userId FK
        string listingId FK
        datetime createdAt
    }

    ACTIVITY_LOG {
        string id PK
        string userId FK
        string action
        string description
        string entityType
        string entityId
        json metadata
        datetime createdAt
    }

    NOTIFICATION_LOG {
        string id PK
        string userId FK
        string type
        string channel
        string status
        json payload
        datetime createdAt
    }
```

---

## 3. Status State Machines

### SellerLead Status State Machine

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Seller submits vehicle listing
    
    SUBMITTED --> SCHEDULED : Admin assigns inspector (Inspection created)
    
    SCHEDULED --> INSPECTED : Inspector completes & submits report
    SCHEDULED --> REJECTED : Inspector clicks "Reject On-Site"
    
    INSPECTED --> OFFER_MADE : Admin inputs final offer
    
    OFFER_MADE --> ACQUIRED : Admin approves offer (Listing created)
    OFFER_MADE --> REJECTED : Admin rejects lead
    
    ACQUIRED --> [*]
    REJECTED --> [*]
```

### Listing Status State Machine

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Listing created upon approval
    
    AVAILABLE --> SOLD : Admin manually marks vehicle as sold
    AVAILABLE --> PULLED : Admin unpublishes listing
    
    PULLED --> AVAILABLE : Admin re-publishes listing
    
    SOLD --> [*]
```

---

## 4. Notification Trigger Map

| Trigger Event | Target Recipient | Channels | Data Included |
|---|---|---|---|
| **Inspection Assigned** (Admin assigns inspector to `SellerLead`) | Assigned Inspector | `EMAIL` + `IN_APP` | Vehicle make, model, variant, vehicleNumber, year, kmDriven, seller name, seller phone |
| **Inspection Completed** (Inspector submits report with `inspectionComplete = true`) | Admin / Managers | `IN_APP` | `SellerLead.id`, vehicle title, inspector name |
| **Listing Approved** (Admin approves & transitions `SellerLead` → `ACQUIRED`) | Seller | `EMAIL` + `IN_APP` | Vehicle title, final offer price, public listing link |
| **Lead Rejected** (Admin or Inspector sets status → `REJECTED`) | Seller | `EMAIL` + `IN_APP` | Vehicle title, rejection reason / comments |

---

## 5. Explicit Exclusions Verification

The following entities and fields are **strictly excluded** from the database architecture:
- ❌ **`Booking` table**: Removed (No slot booking system).
- ❌ **`Payment` table**: Removed (No payment gateway integration).
- ❌ **`Conversation` & `Message` tables**: Removed (No in-app messaging system).
- ❌ **`SellerLead.inspectorId`**: Excluded from `SellerLead` (Inspectors are linked solely via `Inspection.inspectorId`).
