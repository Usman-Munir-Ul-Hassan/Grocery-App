# 🛒 Grocery Delivery Application

A full-stack, real-time Grocery Delivery Platform built with modern **React Native** (Frontend) and high-performance **Fastify + TypeScript + MongoDB** (Backend).

---

## 1. System Architecture Overview

```text
┌────────────────────────────────┐       ┌────────────────────────────────┐
│   Customer & Delivery Apps     │       │       Fastify REST API         │
│        (React Native)          │ <───> │         (TypeScript)           │
│  - Google Maps Live Tracking   │       │  - HttpOnly Cookie Auth (JWT)  │
│  - Category & Product Catalog  │       │  - Bcrypt Password Security    │
│  - Order Checkout & History    │       │  - Structured Error Logging    │
└────────────────────────────────┘       └──────────────┬─────────────────┘
                                                        │
                                         ┌──────────────┴─────────────────┐
                                         │       MongoDB Database         │
                                         │  - Customers, DeliveryPartners │
                                         │  - Products, Categories, Orders│
                                         │  - Branches & Auto-Counters    │
                                         └────────────────────────────────┘
```

---

## 2. User Roles

| Role | Description | Primary Authentication |
|---|---|---|
| **Customer** | Browses grocery catalog, adds items to cart, places orders, tracks delivery live | Phone Number (OTP-ready) & Email |
| **Delivery Partner** | Receives assigned orders, navigates to store & customer, streams live GPS location | Email & Bcrypt Password |
| **Admin** | Manages branches, categories, products, inventory, and user banning/activation | Email & Bcrypt Password |

---

## 3. Repository Layout

```text
Grocerry App/
├── .coderabbit.yaml         # AI Code Reviewer configuration
├── .gitignore               # Root git exclusion rules (protects .env & node_modules)
├── README.md                # Overall system documentation (You are here)
├── agents.md                # Strict engineering rules & architectural standards
├── package.json             # Root workspace configuration
└── server/                  # Backend REST API service (Fastify + TypeScript)
    ├── README.md            # In-depth technical backend documentation & logic guide
    ├── SCHEMA_DIAGRAM.md    # Visual Mermaid entity & class relationship diagram
    ├── .env.example         # Template for required environment variables
    └── src/                 # Application source code
```

---

## 4. Documentation & Technical Deep-Dives

* 📖 **[Backend Technical Guide & Controller Logic (server/README.md)](./server/README.md)**:
  Detailed breakdown of the backend directory, cookie timings, and step-by-step plain English logic for all core controllers.
* 📊 **[Database Schema & Class Diagram (server/SCHEMA_DIAGRAM.md)](./server/SCHEMA_DIAGRAM.md)**:
  Visual Mermaid diagram illustrating all Mongoose models, data attributes, inheritance, and relations.
* 📋 **[Engineering Guidelines (agents.md)](./agents.md)**:
  Standard development protocols, Single Responsibility Principle (SRP), and beginner-friendly coding standards.
