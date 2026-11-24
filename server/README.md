# Grocery App Backend Server

Fastify + TypeScript + MongoDB backend service for the Grocery Delivery Application.

---

## 1. Tech Stack

- **Runtime**: Node.js (with `tsx` for zero-build TypeScript execution)
- **Framework**: Fastify 4.x
- **Database**: MongoDB with Mongoose 9.x
- **Logging**: Fastify logger with `pino-pretty` (24-hour clean console logs)
- **Real-Time**: Socket.io (`fastify-socket.io`)

---

## 2. Directory Structure

```text
server/
├── .env                          # Environment variables
├── agents.md                     # Backend architectural rules & guidelines
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler options
├── README.md                     # Backend guide & documentation
├── SCHEMA_DIAGRAM.md             # Visual Mermaid schema & class diagram
└── src/
    ├── app.ts                    # Fastify server initialization & boot
    ├── config/
    │   ├── config.ts             # Central environment variables & config
    │   └── connectDB.ts          # Mongoose database connection lifecycle
    ├── controllers/              # HTTP request & response handlers
    ├── models/                   # Mongoose data schemas
    │   ├── admin.ts              # Admin role schema
    │   ├── branch.ts             # Store/branch location schema
    │   ├── category.ts           # Grocery category schema
    │   ├── counter.ts            # Auto-incrementing sequence counter
    │   ├── customer.ts           # Customer user schema
    │   ├── deliveryPartner.ts    # Delivery partner schema + GPS tracker
    │   ├── index.ts              # Central export barrel for models
    │   ├── order.ts              # Order schema & delivery lifecycle
    │   ├── product.ts            # Grocery item catalog schema
    │   └── user.ts               # Base user schema & roles
    ├── routes/                   # Route URL definitions & plugins
    ├── services/                 # Core business & calculation logic
    └── utils/                    # Reusable helpers & formatters
```

---

## 3. Environment Variables

Create a `.env` file in the `server` directory:

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | HTTP Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<user>:<password>@cluster0...` |
| `COOKIE_SESSION` | Cookie session secret key | (secret string) |
| `ACCESS_TOKEN` | JWT access token secret | (secret string) |
| `REFRESH_TOKEN` | JWT refresh token secret | (secret string) |

---

## 4. Scripts & Commands

From the `server/` directory:

```bash
# Run in development mode with hot reload
npm run dev

# Run in production mode
npm start
```

---

## 5. Database Models Summary

| Model | Collection | Description |
|---|---|---|
| **`User`** | — | Base schema containing `username`, `email`, `role`, and `isActivated`. |
| **`Customer`** | `customers` | Inherits `User` schema + `phone`. |
| **`DeliveryPartner`** | `deliverypartners` | Inherits `User` schema + `password`, `liveLocation` (GPS), and `branch` reference. |
| **`Admin`** | `admins` | Inherits `User` schema + `password` (default role: `Admin`). |
| **`Branch`** | `branches` | Store name, GPS `location`, `address`, and assigned `deliveryPartners`. |
| **`Category`** | `categories` | Grocery category name and thumbnail image URL. |
| **`Product`** | `products` | Product name, image, price, discount price, and reference to `Category`. |
| **`Counter`** | `counters` | Sequence counter (`sequence_value`) for sequential order numbering. |
| **`Order`** | `orders` | Order items, customer, delivery partner, branch, pickup/drop locations, total price, and status. |

---

## 6. Architecture & Class Diagram

To view the full visual relationship diagram of all database entities, see **[SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md)**.
