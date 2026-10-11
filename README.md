# Kaapi Works — Specialty Coffee & Brewing Gear

A production-grade, full-stack specialty coffee e-commerce web application inspired by South Indian heritage roasteries. Sourcing single-origin beans from the historic high-elevation slopes of Chikmagalur, Coorg, Araku Valley, and Wayanad, paired with precision manual brewing equipment and Kumbakonam virgin brass vessels.

Built with an editorial aesthetic, server-authoritative cart security, NoSQL injection safeguards, role-based access control, and seamless deployment configurations for Render and Vercel.

---

## 1. Tech Stack

- **Frontend**: React.js (Vite), React Router v7, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express.js (REST API)
- **Database**: MongoDB (Atlas) with Mongoose (with high-performance reactive in-memory database adapter for zero-downtime offline preview)
- **Image Pipeline**: Cloudinary CDN (server-side stream upload via Multer memory storage)
- **Authentication**: Email + Password, bcrypt hashing (cost 12), JWT issued via `httpOnly`, `secure`, `sameSite` cookies (with Authorization header fallback)
- **Validation**: Zod schema validation on all request payloads
- **Security Suite**: Helmet, CORS origin restriction, Express Rate Limit, Express Mongo Sanitize
- **PDF Generation**: Client-side jsPDF for printable tax invoices and parchment receipts
- **AI Integration**: Google Gemini (@google/genai) for intelligent estate roast recommendations and sommelier guidance

---

## 2. Key Features

### 2.1 E-Commerce Catalog & Quick Buy
- **Quick Buy Direct Action**: Every product listing card features a dedicated Quick Buy button that immediately adds the item to the user's coffee bag and triggers the slide-out Cart Drawer for expedited checkout.
- **Faceted Catalog Filters**: Real-time filtering by category (Whole Bean, Brewing Gear, Grinders, etc.), roast level (Light, Medium, Dark), debounced search, and sort options (Price, Newest).
- **Sensory Tasting Profiles**: Interactive Roast Profile indicators with visual intensity bars and estate terroir notes.

### 2.2 Customer Reviews & Rating Engine
- **Verified Rating Submission**: Authenticated customers can submit star ratings (1–5 stars) and detailed sensory reviews on any product detail page.
- **Score Breakdown & Distribution**: Real-time aggregation displaying average score, total review count, and interactive 5-star distribution graphs.
- **Instant Product Sync**: Adding a review automatically triggers average score recomputation on both PDP and listing badges.

### 2.3 Personalized Gift Messages
- **Cotton Parchment Note**: The Cart page includes an optional personalized gift note builder with 500-character counter, preset occasion sentiments (Birthdays, Celebrations, Daily Brews), and clear actions.
- **Full Order Persistence**: Gift notes are stored directly on the `Order` object and rendered across the customer confirmation modal, order tracking page, PDF invoice, and dispatch emails.

### 2.4 One-Click Order Reordering
- **Instant Replenishment**: The user profile's Order History section includes a **Reorder** button on every past order.
- **Smart Cart Merging**: Automatically parses all line items and quantities from historical harvests, seamlessly merges them with current cart contents, and opens the cart drawer for one-click checkout.

### 2.5 Bean Points Loyalty & Rewards
- **Tier Milestones**: Bronze Roaster (100 pts), Silver Peaberry (250 pts), Gold Estate (500 pts), Master Cupper (1,000 pts).
- **Points Redemption**: Earn bean points automatically with each purchase and redeem them with one click in the checkout summary for instant rupee discounts.

### 2.6 Active Order Tracking & Tax Invoices
- **7-Stage Live Timeline**: Confirmed → Processing → Freshly Roasted → Dispatched → Shipped → Delivered.
- **Digital Tax Invoice PDF**: Instant one-click PDF generation via `jsPDF` with order breakdowns, shipping address, gift messages, and GST calculations.

---

## 3. Architecture & Design Decisions

### 2.1 Editorial Brand Identity & Palette
- **Warm Cream Canvas (`#F4EDE3`)**: Replaces clinical white with a warm, organic coffee paper tone.
- **Espresso Brown (`#2B1D16`)**: Deep contrast for primary typography, editorial section blocks, and navigation elements.
- **Copper Accent (`#C2622D`)**: Warm metallic accent dedicated to CTAs, progress bars, and roast highlights.
- **Forest Green (`#2F4A3A`)**: Secondary nature accent representing shade-grown estate canopies.
- **Typography Pairing**: *DM Serif Display* for headlines and editorial titles, paired with *DM Sans* for clear prose and tabular numeral alignment (`font-variant-numeric: tabular-nums`).

### 2.2 Server-Authoritative Cart Calculation
- **Zero-Trust Client Pricing**: The frontend never submits item prices to the server. Prices and discounts are fetched and computed exclusively from the authoritative database record.
- **Stock Guard**: Every add or update cart request validates inventory levels in real-time, preventing overselling.
- **Guest-to-User Cart Merging**: Guest carts stored in client `localStorage` are automatically sent to `/api/cart/merge` upon sign-in, seamlessly consolidating items into the customer's database record.

### 2.3 Resilient Database Strategy
- In production, the backend connects directly to **MongoDB Atlas** via Mongoose.
- For local development and evaluation without requiring external Atlas credentials, `server/src/config/db.js` activates a reactive in-memory store pre-seeded with 26 realistic products, 5 categories, and test accounts.

---

## 3. Project Structure

```
├── client/                      # Frontend Application (Vercel deployment)
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Footer, ProductCard, Modal, Toast...)
│   │   ├── context/             # AuthContext, CartContext
│   │   ├── pages/               # LandingPage, ProductListingPage, ProductDetailPage, CartPage, Admin...
│   │   ├── services/            # Centralized API fetch layer with error handling
│   │   ├── types/               # TypeScript interfaces (Product, Category, User, Cart...)
│   │   └── utils/               # Currency (INR) formatters, roast profile helpers
│   ├── vercel.json              # Vercel SPA routing and API reverse-proxy configuration
│   └── .env.example
├── server/                      # Backend API Application (Render deployment)
│   ├── src/
│   │   ├── config/              # MongoDB connection (db.js), Cloudinary (cloudinary.js), MemoryStore
│   │   ├── controllers/         # Auth, Product, Category, Cart, Upload controllers
│   │   ├── middleware/          # requireAuth, requireRole, errorHandler, upload (multer)
│   │   ├── models/              # Mongoose schemas: User, Category, Product, Cart
│   │   ├── routes/              # Modular Express routers
│   │   ├── utils/               # 26-product seed data fixtures
│   │   ├── validators/          # Zod request payload schemas
│   │   ├── app.js               # Express application with security middleware
│   │   ├── server.js            # Standalone Render server entry point
│   │   └── seed.js              # Standalone database seed runner
│   └── .env.example
├── server.ts                    # Root full-stack dev server combining API + Vite middlewares
├── SCHEMA.md                    # Detailed Database Models & Indexing documentation
├── TESTING.md                   # Manual and security testing verification checklist
└── package.json
```

---

## 4. Environment Variables

Create `.env` in the root (or in `/server` and `/client` when deploying separately):

```env
# Server Configuration
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kaapi_works?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=kaapi_works_super_secret_jwt_key_2026

# Seed Script & Demo Accounts
ADMIN_NAME="Kaapi Master Roaster (Admin)"
ADMIN_EMAIL=admin@kaapiworks.in
ADMIN_PASSWORD=KaapiAdmin@2026

CUSTOMER_NAME="Aarav Sharma"
CUSTOMER_EMAIL=customer@kaapiworks.in
CUSTOMER_PASSWORD=KaapiCustomer@2026

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# URLs
CLIENT_URL=http://localhost:3000
```

---

## 5. Local Setup & Seeding

### 5.1 Installation
```bash
npm install
```

### 5.2 Seeding MongoDB Atlas
Ensure your `MONGODB_URI` is populated in `.env`, then execute:
```bash
npm run seed
```
This initializes:
- **5 Categories**: Whole Bean Coffee, Brewing Gear, Grinders, Mugs & Accessories, Gift Sets.
- **26 Specialty Products**: Complete with roast profiles, tasting notes, estate origins, altitude, and realistic stock numbers.
- **2 Dedicated Test Accounts**:
  - **Admin**: `admin@kaapiworks.in` / `KaapiAdmin@2026` (Cost 12 bcrypt)
  - **Customer**: `customer@kaapiworks.in` / `KaapiCustomer@2026`

### 5.3 Launch Development Server
```bash
npm run dev
```
The full application (Express API on `/api` + Vite React frontend) runs at `http://localhost:3000`.

---

## 6. API Endpoint Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer account, issues JWT cookie |
| `POST` | `/api/auth/login` | Public | Sign in user, issues httpOnly cookie |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieves authenticated user profile |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Search, category filter, roast filter, sort, pagination |
| `GET` | `/api/products/highlights`| Public | Featured roasts, new arrivals, roast of the month |
| `GET` | `/api/products/:id` | Public | Get single product by ID |
| `POST` | `/api/products` | **Admin Only** | Create product (Zod validated) |
| `PUT` | `/api/products/:id` | **Admin Only** | Update product fields |
| `DELETE` | `/api/products/:id` | **Admin Only** | Delete product and clean up Cloudinary assets |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Get all product categories |
| `POST` | `/api/categories` | **Admin Only** | Create a new category |
| `PUT` | `/api/categories/:id` | **Admin Only** | Rename category |
| `DELETE` | `/api/categories/:id` | **Admin Only** | Delete empty category (blocks if products exist) |

### Shopping Bag (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Authenticated | Retrieve current user's database cart with live totals |
| `POST` | `/api/cart/add` | Authenticated | Add product with quantity |
| `PUT` | `/api/cart/items/:id` | Authenticated | Update item quantity (stock validated) |
| `DELETE` | `/api/cart/items/:id` | Authenticated | Remove item from cart |
| `POST` | `/api/cart/merge` | Authenticated | Merge guest cart items upon login |

### Image Upload (`/api/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | **Admin Only** | Multer memory storage stream upload to Cloudinary (Max 5MB) |

### Customer Wishlist (`/api/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Authenticated | Retrieve customer's saved products |
| `POST` | `/api/wishlist/toggle` | Authenticated | Toggle product in/out of wishlist |
| `POST` | `/api/wishlist/add` | Authenticated | Add product to wishlist |
| `DELETE` | `/api/wishlist/:id` | Authenticated | Remove product from wishlist |
| `DELETE` | `/api/wishlist` | Authenticated | Clear user wishlist |

### Orders & Tracking (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Authenticated | Place order, validate stock and pricing |
| `GET` | `/api/orders` | Authenticated | View current customer's order history |
| `GET` | `/api/orders/:id` | Authenticated | View single order with status timeline |
| `PUT` | `/api/orders/:id/status`| Authenticated | Update order timeline status |

### Reviews & Ratings (`/api/products/:id/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/:id/reviews` | Public | Get product rating summary and customer reviews |
| `POST` | `/api/products/:id/reviews` | Authenticated | Submit verified product review (1-5 stars) |

### Newsletter Subscribers (`/api/newsletter`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/newsletter/subscribe` | Public | Collect and store subscriber email with rate limit |
| `GET` | `/api/newsletter` | Public/Admin | List active subscribers |

### Admin Analytics (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | **Admin Only** | Returns product count, low-stock count, categories |

---

## 7. Deployment Instructions

### 7.1 Backend Deployment (Render)
1. In your Render Dashboard, click **New +** → **Web Service**.
2. Connect your repository and configure:
   - **Root Directory**: `server` (or repository root)
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js` (or `node server/src/server.js`)
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `<your_secure_secret>`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
4. Deploy the service. Your backend API will be available at `https://your-service.onrender.com`.

### 7.2 Frontend Deployment (Vercel)
1. In your Vercel Dashboard, click **Add New Project** and import your repository.
2. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (or `client` if deploying as a standalone repository)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure `vercel.json` rewrites for SPA routing and API reverse-proxying:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-service.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
4. Deploy. Vercel automatically proxies `/api` calls with credentials while serving the client SPA.

---

## 8. Security Measures Summary

1. **Role-Based Access Control (RBAC)**: All administrative endpoints are guarded by `requireAuth` and `requireRole('admin')`. Regular customers calling admin APIs are rejected with `HTTP 403 Forbidden`.
2. **Password Security**: Passwords hashed using `bcrypt` with cost factor 12. No plaintext passwords or credentials are hardcoded.
3. **Session Hardening**: JWT tokens stored in `httpOnly`, `secure`, `sameSite` cookies with 7-day expiration to mitigate XSS attacks.
4. **NoSQL Injection Prevention**: `express-mongo-sanitize` strips `$` and `.` operators from request payloads.
5. **Rate Limiting**: `express-rate-limit` enforces strict thresholds on authentication routes (30 requests/15m) and general API routes (300 requests/15m).
6. **Input Sanitization**: All inbound bodies validated with strict Zod schemas returning `HTTP 422` on invalid payloads.
7. **Centralized Error Handling**: Production errors return safe, sanitized responses; stack traces and internal identifiers are never exposed to clients.
