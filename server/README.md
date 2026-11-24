# 🚀 Grocery App Backend Server

Fastify + TypeScript + MongoDB backend service for the Grocery Delivery Application.

---

## 1. Tech Stack

- **Runtime**: Node.js with `tsx` (zero-build instant TypeScript execution)
- **Framework**: Fastify 4.x (high performance & low overhead)
- **Database**: MongoDB with Mongoose 9.x
- **Authentication**: JWT with `@fastify/cookie` (`httpOnly` session cookies)
- **Password Security**: `bcryptjs` (automated via Mongoose `pre("save")` hooks)
- **Logging**: Fastify structured logger with `pino-pretty` (clean 24-hour logs)
- **Real-Time**: Socket.io (`fastify-socket.io`) for live GPS tracking

---

## 2. Directory Structure

```text
server/
├── .env                          # Real environment variables (NEVER committed to Git)
├── .env.example                  # Template with placeholder variables for developers
├── .gitignore                    # Protects node_modules, logs, and .env credentials
├── agents.md                     # Backend architectural rules & error logging standards
├── package.json                  # Dependencies, dev dependencies & run scripts
├── tsconfig.json                 # TypeScript compiler options (ESNext + bundler resolution)
├── README.md                     # In-depth technical backend documentation (You are here)
├── SCHEMA_DIAGRAM.md             # Visual Mermaid class & relationship diagram
└── src/
    ├── app.ts                    # Fastify server bootstrap & route registration
    ├── config/
    │   ├── config.ts             # Central environment variables & defaults
    │   └── connectDB.ts          # MongoDB connection handler with timestamped logs
    ├── controllers/              # HTTP request handlers (MVC)
    │   ├── auth.controller.ts    # Customer register/login, Admin & Delivery login, refresh token
    │   ├── category.controller.ts# Fetch all grocery categories
    │   ├── product.controller.ts # Fetch products by category (with category deselected)
    │   └── tracking.controller.ts# Live GPS location & user profile updates
    ├── middleware/               # Fastify preHandler security hooks
    │   └── auth.middleware.ts    # verifyAuth (ban check) & authorizeRoles (RBAC guard)
    ├── models/                   # Mongoose data schemas & TypeScript interfaces
    │   ├── admin.ts              # Admin schema + bcrypt pre-save password hook
    │   ├── branch.ts             # Store/branch location schema
    │   ├── category.ts           # Grocery category schema
    │   ├── counter.ts            # Auto-incrementing sequence counter for order IDs
    │   ├── customer.ts           # Customer user schema (inherits User)
    │   ├── deliveryPartner.ts    # Delivery rider schema + GPS liveLocation + bcrypt hook
    │   ├── index.ts              # Central export barrel for all models
    │   ├── order.ts              # Order schema & tracking lifecycle + auto-orderId hook
    │   ├── product.ts            # Grocery item catalog schema (references Category)
    │   └── user.ts               # Base user schema (clerkId ready, isActivated)
    ├── routes/                   # Fastify route plugins
    │   ├── auth.routes.ts        # /api/auth routes
    │   ├── category.routes.ts    # /api/categories routes
    │   ├── product.routes.ts     # /api/products routes
    │   └── tracking.routes.ts    # /api/user and /api/tracking routes
    ├── services/                 # Core business & database query logic
    │   └── auth.service.ts       # Database lookup, user existence & active status checks
    └── utils/                    # Reusable helper functions
        ├── password.ts           # Bcrypt password hashing & comparison
        ├── responseHandler.ts    # Standardized sendResponse & sendError helpers
        └── token.ts              # JWT Access & Refresh token generator/verifier
```

---

## 3. Authentication, Cookies & Token Timings

Authentication uses secure **`httpOnly` cookies** signed with `COOKIE_SESSION`. JavaScript running on the client cannot touch or steal these cookies (protecting against XSS attacks), and the device automatically includes them on every request.

| Token | Cookie Name | Expiration Time | Purpose |
|---|---|---|---|
| **Access Token** | `accessToken` | **1 Day** (24 hours / 86,400s) | Sent on everyday requests to access protected routes. Short-lived for security. |
| **Refresh Token** | `refreshToken` | **7 Days** (168 hours / 604,800s) | Stored securely. Used to quietly renew expired 1-day access tokens without asking for a password. |

### Cookie Security Settings:
* **`httpOnly: true`**: Inaccessible to JavaScript (`document.cookie`), preventing theft.
* **`sameSite: "lax"`**: Protects against CSRF attacks.
* **`path: "/"`**: Available across all application endpoints.

---

## 4. Core Controller Logic (Step-by-Step in Plain English)

Below is the simple step-by-step logic of how the most important controllers work:

### 1. Customer Registration (`registerCustomer`)
> **Endpoint**: `POST /api/auth/customer/register`
* **Step 1 (Input Check)**: Checks that the user provided a real `phone`, `email`, and `username`.
* **Step 2 (Uniqueness Check)**: Searches MongoDB to ensure **both** the phone number and the email are completely new (rejects with `400` if duplicate).
* **Step 3 (Save Real Data)**: Creates and saves the customer with their real information (zero auto-generated fake emails).
* **Step 4 (Issue Cookies)**: Generates 1-day access and 7-day refresh tokens, attaches them as secure cookies, and returns the new customer profile.

### 2. Customer Login (`loginCustomer`)
> **Endpoint**: `POST /api/auth/customer/login`
* **Step 1 (Input Check)**: Reads the `phone` number from the request (OTP-ready).
* **Step 2 (Lookup in MongoDB)**: Searches for an existing customer. **Does NOT auto-create** fake accounts. If not found, immediately returns `404: Customer not found. Please register first.`
* **Step 3 (Ban Check)**: Checks `customer.isActivated`. If banned, rejects with `403 Forbidden`.
* **Step 4 (Issue Cookies)**: Attaches fresh `accessToken` and `refreshToken` cookies and logs the customer in.

### 3. Delivery Partner & Admin Login (`loginDeliveryPartner` / `loginAdmin`)
> **Endpoints**: `POST /api/auth/delivery/login` & `POST /api/auth/admin/login`
* **Step 1 (Input Check)**: Reads `email` and `password`.
* **Step 2 (Bcrypt Password Check)**: Finds the account by email and compares the password using `bcrypt.compare`. *(Passwords are automatically hashed by Mongoose `pre("save")` hooks).*
* **Step 3 (Ban Check)**: Checks that `isActivated === true`.
* **Step 4 (Issue Cookies)**: Sets secure cookies and returns the profile.

### 4. Refresh Token Handler (`refreshTokenHandler`)
> **Endpoint**: `POST /api/auth/refresh-token`
* **Step 1 (Read Token)**: Extracts the `refreshToken` from cookies (or request body).
* **Step 2 (Token Verification)**: Verifies the cryptographic signature and checks that it has not expired (> 7 days).
* **Step 3 (MongoDB Database Verification)**: Reads `userId` and `role` from the token and looks up the real human in MongoDB (`Customer`, `DeliveryPartner`, or `Admin`).
* **Step 4 (Ban Check)**: Verifies the account was not banned or deleted while away.
* **Step 5 (Mint Fresh Ticket)**: Issues a brand-new 1-day `accessToken` cookie so the user stays logged in seamlessly.

### 5. Tracking Controller (`updateUser`)
> **Endpoints**: `PATCH /api/user` & `PATCH /api/tracking/user`
* **Step 1 (Gate Check)**: The `verifyAuth` middleware runs first, verifies the cookie, and confirms the user is active.
* **Step 2 (Pick Collection)**: Chooses `Customer` or `DeliveryPartner` based on `request.user.role`.
* **Step 3 (Update Database)**: Saves the new GPS coordinates (`liveLocation: { latitude, longitude }`) or phone number using `.findByIdAndUpdate(...)`.
* **Step 4 (Return Profile)**: Strips out sensitive fields (passwords) and returns the updated document.

### 6. Category & Product Retrieval
> **Endpoints**: `GET /api/categories` & `GET /api/products/:categoryId`
* **`getAllCategories`**: Queries `Category.find()` so the mobile app can display category banners/icons.
* **`getProductsByCategoryId`**: Queries `Product.find({ category: categoryId }).select("-category")`.
  * **Why `.select("-category")`?** Because the user is already inside that category screen. Stripping the category ID eliminates duplicate data and makes the mobile response lighter and faster.

---

## 5. Environment Variables

Create a `.env` file in the `server` directory (you can copy `.env.example`):

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP Server port | `3000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0...` |
| `COOKIE_SESSION` | Secret key used to sign session cookies | (Random secret string) |
| `ACCESS_TOKEN` | Secret key for 1-day Access JWTs | (Random secret string) |
| `REFRESH_TOKEN` | Secret key for 7-day Refresh JWTs | (Random secret string) |

---

## 6. Scripts & Commands

From the `server/` directory:

```bash
# Run in development mode with hot-reloading (via tsx watch)
npm run dev

# Run in production mode
npm start
```

---

## 7. Architecture & Class Diagram

To view the full visual relationship diagram of all database entities, see **[SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md)**.
