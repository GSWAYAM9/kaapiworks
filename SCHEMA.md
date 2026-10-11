# Kaapi Works — Database Schema Documentation (Mongoose / MongoDB Atlas)

This document specifies the data models, relationship structures, field constraints, and indexing strategy for **Kaapi Works**.

---

## 1. Entity Relationship Diagram (ERD)

```
       +-------------------+             +-----------------------+
       |       User        |             |       Category        |
       +-------------------+             +-----------------------+
       | _id (ObjectId)    |             | _id (ObjectId)        |
       | name: String      |             | name: String (unique) |
       | email: String(UQ) |             | slug: String (unique) |
       | passwordHash: Str |             | description: String   |
       | role: 'customer'  |             | timestamps: true      |
       |       | 'admin'   |             +-----------------------+
       | timestamps: true  |                         ^
       +-------------------+                         |
         |               ^                           | 1:N
         | 1:1           | 1:N                       |
         v               |               +-----------------------+
  +----------------+     |               |        Product        |
  |      Cart      |     |               +-----------------------+
  +----------------+     |               | _id (ObjectId)        |
  | _id (ObjectId) |     |               | name: String          |
  | user: ref User |-----+               | description: String   |
  | items: [       |                     | price: Number (INR)   |
  |   {            |                     | category: ref Category|
  |     product    |-------------------->| images: [{url, pubId}]|
  |     quantity   |       N:1           | stock: Number         |
  |   }            |                     | roastLevel: String*   |
  | ]              |                     | tastingNotes: [String]|
  | timestamps     |                     | estate: String        |
  +----------------+                     | altitude: String      |
                                         | process: String       |
                                         | isFeatured: Boolean   |
                                         | isNewArrival: Boolean |
                                         | isRoastOfMonth: Bool  |
                                         | timestamps: true      |
                                         +-----------------------+
```

---

## 2. Collections Specification

### 2.1 User (`users`)
Stores customer and administrator authentication credentials and roles.

| Field | Type | Required | Unique | Validation / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Yes | MongoDB primary key |
| `name` | `String` | Yes | No | Trimmed, max 60 chars |
| `email` | `String` | Yes | Yes | Lowercase, trimmed, RFC 5322 regex match |
| `passwordHash` | `String` | Yes | No | 60-char bcrypt hash generated with 12 salt rounds |
| `role` | `String` | Yes | No | Enum: `['customer', 'admin']`. Default: `'customer'` |
| `createdAt` | `Date` | Auto | No | Standard Mongoose timestamp |
| `updatedAt` | `Date` | Auto | No | Standard Mongoose timestamp |

**Indexes:**
- `{ email: 1 }` (Unique index for $O(1)$ email lookups during login and registration)

---

### 2.2 Category (`categories`)
Defines the product taxonomy (e.g. Whole Bean Coffee, Brewing Gear, Grinders, etc.).

| Field | Type | Required | Unique | Validation / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Yes | MongoDB primary key |
| `name` | `String` | Yes | Yes | Trimmed, max 50 chars (e.g. "Whole Bean Coffee") |
| `slug` | `String` | Yes | Yes | Lowercase hyphenated string (e.g. `whole-bean-coffee`) |
| `description` | `String` | No | No | Optional category narrative |
| `createdAt` | `Date` | Auto | No | Standard timestamp |
| `updatedAt` | `Date` | Auto | No | Standard timestamp |

**Indexes:**
- `{ slug: 1 }` (Unique index for route matching `/products?category=whole-bean-coffee`)

---

### 2.3 Product (`products`)
Stores specialty roasted whole beans, manual brew gear, grinders, and heritage vessels.

| Field | Type | Required | Default | Validation / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Auto | MongoDB primary key |
| `name` | `String` | Yes | — | Trimmed, max 120 chars |
| `description` | `String` | Yes | — | Sensory narrative, brewing notes, dimensions |
| `price` | `Number` | Yes | — | Value in INR (₹), min 0 |
| `category` | `ObjectId` | Yes | — | Foreign key reference to `Category` |
| `images` | `[Object]` | Yes | — | Array of `{ url: String, publicId: String }`. Min length 1 |
| `stock` | `Number` | Yes | `0` | Available inventory quantity (min 0) |
| `roastLevel` | `String` | No | `null` | Enum: `['light', 'medium', 'dark']` |
| `tastingNotes` | `[String]` | No | `[]` | Curated sensory notes (e.g. `["Dark Chocolate", "Almond"]`) |
| `estate` | `String` | No | `""` | Geographic estate (e.g. "Chikmagalur, Karnataka") |
| `altitude` | `String` | No | `""` | Plantation elevation (e.g. "1,250 - 1,400m") |
| `process` | `String` | No | `""` | Processing method (e.g. "Honey Sun-Dried", "Washed") |
| `isFeatured` | `Boolean` | No | `false` | Highlights item on homepage showcase |
| `isNewArrival` | `Boolean` | No | `false` | Highlights item in new arrivals section |
| `isRoastOfTheMonth`| `Boolean` | No | `false` | Selected for prominent editorial roast banner |
| `createdAt` | `Date` | Auto | — | Standard timestamp |
| `updatedAt` | `Date` | Auto | — | Standard timestamp |

**Indexes:**
- Compound text index: `{ name: 'text', description: 'text', estate: 'text' }` for fast search queries.
- Compound filter index: `{ category: 1, price: 1 }` for faceted category sorting and price filtering.
- Index: `{ isFeatured: 1, isNewArrival: 1 }` for landing page highlights queries.

---

### 2.4 Cart (`carts`)
Maintains per-user persistent shopping bags with server-authoritative quantity validation.

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | MongoDB primary key |
| `user` | `ObjectId` | Yes | 1:1 foreign key reference to `User` (Unique) |
| `items` | `[CartItem]`| Yes | Array of subdocuments |
| `items.product`| `ObjectId` | Yes | Foreign key reference to `Product` |
| `items.quantity`| `Number` | Yes | Positive integer, capped to `product.stock` |
| `createdAt` | `Date` | Auto | Timestamp |
| `updatedAt` | `Date` | Auto | Timestamp |

**Indexes:**
- `{ user: 1 }` (Unique index ensuring exactly one cart document per customer account)

---

### 2.5 Wishlist (`wishlists`)
Maintains saved products for authenticated customers.

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | MongoDB primary key |
| `user` | `ObjectId` | Yes | 1:1 foreign key reference to `User` (Unique index) |
| `items` | `[WishlistItem]` | Yes | Array of `{ product: ref Product, addedAt: Date }` |
| `createdAt` | `Date` | Auto | Timestamp |
| `updatedAt` | `Date` | Auto | Timestamp |

**Indexes:**
- `{ user: 1 }` (Unique index)

---

### 2.6 Subscriber (`subscribers`)
Stores customer email addresses collected via the footer newsletter signup component for marketing updates.

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | MongoDB primary key |
| `email` | `String` | Yes | Lowercase, unique index, regex validated |
| `source` | `String` | No | Default: `'footer'` |
| `isActive` | `Boolean` | No | Default: `true` |
| `createdAt` | `Date` | Auto | Timestamp |
| `updatedAt` | `Date` | Auto | Timestamp |

**Indexes:**
- `{ email: 1 }` (Unique index)

---

### 2.7 Order (`orders`)
Records customer orders with item line snapshots and live status timeline stages.

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | MongoDB primary key |
| `user` | `ObjectId` | Yes | Foreign key reference to `User` |
| `orderNumber` | `String` | Yes | Formatted identifier (e.g. `KW-84920`) |
| `items` | `[OrderItem]` | Yes | Snapshot of product, quantity, name, price |
| `subtotal` | `Number` | Yes | In INR |
| `shipping` | `Number` | Yes | In INR |
| `total` | `Number` | Yes | In INR |
| `status` | `String` | Yes | Enum: `['confirmed', 'processing', 'roasted', 'dispatched', 'shipped', 'delivered', 'cancelled']` |
| `giftMessage` | `String` | No | Personalized parchment message note (max 500 chars) |
| `pointsRedeemed` | `Number` | No | Loyalty Bean Points redeemed during checkout |
| `pointsDiscount` | `Number` | No | Rupee discount applied from redeemed Bean Points |
| `pointsEarned` | `Number` | No | Loyalty points earned on current transaction |
| `paymentMethod` | `String` | No | Payment gateway or method (e.g. 'UPI / NetBanking') |
| `paymentStatus` | `String` | No | Payment authorization state ('paid', 'pending') |
| `trackingNumber`| `String` | No | Blue Dart / Delhivery courier AWB tracking code |
| `carrier` | `String` | No | Express courier partner name |
| `shippingAddress`| `Object` | No | Delivery address snapshot |
| `createdAt` | `Date` | Auto | Timestamp |
| `updatedAt` | `Date` | Auto | Timestamp |

**Indexes:**
- `{ user: 1, createdAt: -1 }`
- `{ orderNumber: 1 }` (Unique)

---

### 2.8 Review (`reviews`)
Customer ratings and reviews on specialty coffee products.

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | MongoDB primary key |
| `product` | `ObjectId` | Yes | Foreign key reference to `Product` |
| `user` | `ObjectId` | Yes | Foreign key reference to `User` |
| `userName` | `String` | Yes | Display name |
| `rating` | `Number` | Yes | 1 to 5 integer |
| `comment` | `String` | Yes | Review text |
| `createdAt` | `Date` | Auto | Timestamp |

**Indexes:**
- `{ product: 1, createdAt: -1 }`

---

## 3. Server-Authoritative Calculation Policies

1. **Price Isolation**:
   - The client never submits prices to the database or cart APIs.
   - On every cart query or modification, the backend looks up the live `product.price` directly from the database and calculates `unitPrice`, `itemTotal`, and `subtotal`.
2. **Stock Enforcement**:
   - If an item's requested quantity exceeds available `product.stock`, the API caps the item to available inventory or returns HTTP 400.
3. **Shipping Policy (Pan-India)**:
   - If `subtotal >= 1499` or `subtotal === 0`: `shipping = 0` (FREE).
   - If `subtotal < 1499`: `shipping = 99`.
   - `total = subtotal + shipping`.
