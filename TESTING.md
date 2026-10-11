# Kaapi Works — Manual & Security Testing Checklist

This document details verified test procedures to validate functionality, data integrity, and security hardening for the Kaapi Works platform.

---

## 1. Quick Test Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kaapiworks.in` | `KaapiAdmin@2026` | Full catalog management, uploads, stats |
| **Customer** | `customer@kaapiworks.in` | `KaapiCustomer@2026` | Storefront browsing, cart persistence, checkout |

*Note: The Login page provides one-click "Fill Admin" and "Fill Customer" buttons for instant evaluation.*

---

## 2. Security Test Checklist

### Test SEC-01: Customer Calling Admin API Returns HTTP 403 Forbidden
- **Objective**: Ensure role-based access control prevents non-admin customers from modifying data.
- **Steps**:
  1. Sign in with customer credentials (`customer@kaapiworks.in`).
  2. Attempt to call an admin API:
     ```bash
     curl -i -X POST http://localhost:3000/api/products \
       -H "Content-Type: application/json" \
       -b "kw_token=<CUSTOMER_TOKEN>" \
       -d '{"name":"Hacked Roast","price":10,"category":"any","stock":10}'
     ```
  3. Navigate to `http://localhost:3000/admin` in the browser while logged in as customer.
- **Expected Result**:
  - API returns `HTTP 403 Forbidden` with `{ "success": false, "message": "Forbidden: Access restricted. You do not have 'admin' privileges." }`.
  - Browser displays the dedicated 403 Forbidden administrative barrier page.

### Test SEC-02: Unauthenticated Upload Is Rejected (HTTP 401 Unauthorized)
- **Objective**: Verify that the Cloudinary image upload endpoint cannot be called without valid admin session.
- **Steps**:
  ```bash
  curl -i -X POST http://localhost:3000/api/upload \
    -F "image=@sample.jpg"
  ```
- **Expected Result**:
  - API immediately returns `HTTP 401 Unauthorized` with `{ "success": false, "message": "Authentication required. Please sign in to continue." }`.

### Test SEC-03: Tampered Cart Price Is Ignored (Server-Authoritative Pricing)
- **Objective**: Ensure that a malicious client cannot modify or tamper with item prices.
- **Steps**:
  1. Send a POST request to add an item to the cart with a spoofed price:
     ```bash
     curl -i -X POST http://localhost:3000/api/cart/add \
       -H "Content-Type: application/json" \
       -b "kw_token=<CUSTOMER_TOKEN>" \
       -d '{"productId":"prod_1","quantity":1,"price":1}'
     ```
  2. Inspect the response body.
- **Expected Result**:
  - The server reads the authentic price of `prod_1` (₹540) directly from the database and ignores any client-supplied price. Total returned reflects ₹540, not ₹1.

### Test SEC-04: Oversized or Invalid File Upload Is Rejected
- **Objective**: Test Multer file filter and size limiter on `/api/upload`.
- **Steps**:
  1. Attempt to upload a `.txt` or `.exe` file:
     ```bash
     curl -i -X POST http://localhost:3000/api/upload \
       -H "Authorization: Bearer <ADMIN_TOKEN>" \
       -F "image=@malicious.exe"
     ```
  2. Attempt to upload an image exceeding 5MB:
     ```bash
     curl -i -X POST http://localhost:3000/api/upload \
       -H "Authorization: Bearer <ADMIN_TOKEN>" \
       -F "image=@huge_image_10mb.jpg"
     ```
- **Expected Result**:
  - Executable or non-image file is rejected with `HTTP 400 Bad Request` ("Invalid file type. Only JPEG, PNG, and WebP images are permitted.").
  - File $>5\text{MB}$ is rejected with `HTTP 400 Bad Request` ("File size exceeds maximum allowed limit of 5MB.").

### Test SEC-05: NoSQL Injection Payload Is Sanitized
- **Objective**: Verify that MongoDB query operators (`$gt`, `$ne`, `$where`) in JSON payloads are neutralized by `express-mongo-sanitize`.
- **Steps**:
  ```bash
  curl -i -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":{"$gt":""},"password":{"$ne":""}}'
  ```
- **Expected Result**:
  - The `$` character is sanitized by `mongoSanitize`, or Zod validation fails with `HTTP 422 Validation failed` ("Invalid email address"). No data leak or authentication bypass occurs.

---

## 3. Functional Storefront & Cart Checklist

| ID | Test Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **FN-01** | Landing Page Highlight Load | Open `/` | Asymmetric hero, category cards, Roast of the Month banner, and 6 featured products load from API. |
| **FN-02** | Category Filtering | Click "Brewing Gear" | Only products belonging to "Brewing Gear" are displayed (brass filter, French press, etc.). |
| **FN-03** | Debounced Search | Type "Araku" in search | Product list narrows down after 400ms debounce to Araku Micro-Lot without manual enter press. |
| **FN-04** | Roast Profile Visual | View whole bean cards | Roast meter displays 3-step indicator (light/medium/dark) and unboxed tasting notes with `·` separator. |
| **FN-05** | Stock Limits & Out-of-Stock | View "Nilgiri Blue Mountain" | "Sold Out" badge is rendered; Add to Bag button is disabled with opacity. |
| **FN-06** | Guest Cart in localStorage | Add product as guest, refresh | Cart drawer opens; item count shows badge; cart persists in browser across page reloads. |
| **FN-07** | Guest Cart Merge on Login | Add item as guest, then sign in | Guest items from `localStorage` are automatically sent to `/api/cart/merge` and unified into user's DB cart. |
| **FN-08** | Free Shipping Calculation | Subtotal $< ₹1,499$ vs $\ge ₹1,499$ | Shipping charges ₹99 when below ₹1,499; switches to FREE (₹0) and displays green congratulations banner when above. |
| **FN-09** | Quantity Stepper | Click `+` and `-` in Cart | Quantity increments/decrements in real-time; subtotal updates; capped at available inventory. |

---

## 4. Admin Dashboard Checklist

| ID | Test Scenario | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AD-01** | Admin Stats | Navigate to `/admin` | Displays accurate counts: Total Products, Categories, Low Stock Alerts ($\le 5$), and Sold Out ($0$). |
| **AD-02** | Create Product | Click "Create Product" and fill fields | Product appears in the table and storefront immediately; category relation is preserved. |
| **AD-03** | Edit Product | Click edit pencil on an existing item | Pre-fills form fields; editing stock or price saves changes and re-renders table. |
| **AD-04** | Delete Product Confirmation | Click trash icon on a product | Confirmation modal appears; confirming removes product and triggers Cloudinary image cleanup. |
| **AD-05** | Category Management | Click "Categories" tab | Lists all categories; allows creating new category and renaming existing ones. |
| **AD-06** | Category Delete Safety | Attempt to delete category with products | Rejects deletion with error message specifying how many products are still assigned. |
