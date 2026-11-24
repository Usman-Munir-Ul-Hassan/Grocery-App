# Backend Guidelines & Rules (`server/agents.md`)

This document defines backend-specific architectural rules and standards. It **inherits and extends** the root `agents.md`. All root rules (no assumptions, plan before implementation, concise explanations) strictly apply here.

---

## 1. Inheritance of Root Rules
- All rules defined in the root `agents.md` apply to this backend directory.
- This file adds backend-specific architectural details; it does not replace the root rules.

## 2. MVC Architecture & Separation of Concerns (SRP)
Every file must have a single responsibility. Code must be organized cleanly into dedicated directories:
- **`routes/`**: Route URL definitions and Fastify plugin registration. No business logic.
- **`controllers/`**: Handles HTTP requests, extracts parameters, and sends responses.
- **`services/`**: Core business logic (e.g., price calculation, order validation). Pure functions and reusable logic.
- **`models/`**: Database schemas and Mongoose models only.
- **`utils/`**: Reusable helpers (e.g., logger, formatting).
- **`tests/`**: Fact-based unit and integration tests (Jest).

## 3. Calm & Disciplined Code (No Bloated Files)
- Write code calmly, cleanly, and incrementally.
- Avoid giant files. If a file grows beyond a single clear purpose, refactor and break it down.
- Avoid over-engineering; keep implementations readable and easy to follow.

## 4. Fact-Based Business Logic & Testing
- Critical calculations (pricing, discounts, delivery fees, taxes) must be deterministic and fact-based.
- Write unit tests covering normal cases, edge cases (zero values, negative numbers, maximum limits), and decimal rounding.

## 5. Structured Error Handling & Logging
- Every error must be caught and logged with:
  - Timestamp
  - Log Level (`[ERROR]`, `[WARN]`, `[INFO]`)
  - Location (`[FileName.functionName]`)
  - Clear, human-readable reason
- Do not let unhandled promise rejections crash the server silently.
