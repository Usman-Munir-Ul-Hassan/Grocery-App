# Project Guidelines & Agent Rules (`agents.md`)

This document defines the strict development rules, architectural standards, and communication protocols for this React Native grocery app project. The AI agent must adhere to these rules on every task without exception.

---

## 1. No Assumptions & Ask for Confirmation
- **Do not assume anything** regarding features, architecture, packages, or design choices.
- If anything is unclear or open to interpretation, **ask the user and wait for confirmation** before proceeding.

## 2. Concise & Simple Communication (No Over-Explaining)
- Provide simple, direct, and short explanations.
- Explain concepts in an easy-to-understand way that aids learning.
- Avoid unnecessary jargon, long lectures, or repetitive information.

## 3. Plan & Permission Before Implementation
- **Never implement code changes without prior permission.**
- Before writing, editing, or deleting any code, present a plan containing:
  1. **Impacted Files**: List of all files to be created, modified, or removed.
  2. **Proposed Changes**: Exact nature of the changes.
  3. **Justification**: Why each change is required.
- Wait for user approval before making modifications.

## 4. SOLID Architecture & Separation of Concerns (SRP)
- Strictly follow the **Single Responsibility Principle (SRP)**. Every file should do one thing well.
- Keep concerns cleanly separated into dedicated directories:
  - **Components (`/components`)**: Pure UI rendering.
  - **Hooks (`/hooks`)**: Reusable state and logic separated from presentation.
  - **Utilities (`/utils`)**: Reusable helper and formatting functions.
  - **Data / Services (`/services`, `/data`)**: API calls, state stores, and mock data kept strictly outside UI components.

## 5. Modern React Native Standards
- Always use modern React Native standards and current official documentation practices.
- Avoid deprecated APIs, legacy class components, or outdated third-party patterns.

## 6. Clean, Understandable TypeScript (Basic to Progressive)
- Use TypeScript for type safety, starting from basic definitions (interfaces, simple types).
- **Avoid advanced/complex TypeScript** (e.g., convoluted generics, complex conditional types) that hinder readability.
- Keep types explicit, clear, and easy to understand.

## 7. Simple & Standard Naming Conventions
- Use standard, self-explanatory names:
  - `PascalCase` for React components and TypeScript types/interfaces.
  - `camelCase` for functions, variables, and hooks (prefixed with `use`).
- Avoid cryptic abbreviations or overly complicated names.

## 8. Robust Error Handling & Diagnostic Logging
- Implement structured error handling across the app (`try/catch`, validation, fallback states).
- Use clear, descriptive logging for runtime events and errors so that issues can be diagnosed easily by both humans and AI models.

## 9. Simple, Beginner-Friendly Code Standards
- **Simple Naming**: Use clear, self-explanatory names like `user`, `errorMessage`, `deliveryPartner` (avoid cryptic abbreviations like `cfg`, `tmp`, `dp`).
- **One Function, One Job**: Keep functions short and focused on doing one thing well.
- **Basic TypeScript**: Avoid complex generics, conditional types, or nested utility types unless truly needed. Keep types straightforward.
- **Plain English Comments**: Add a short comment above each function explaining what it does in simple words.
- **Simple Over Clever**: If there is a simple way and a complex/clever way, always pick the simple way.
- **Beginner-Friendly Explanation**: After writing or modifying code, provide a brief 3–4 line explanation in plain English.

## 10. Strict Adherence
- These rules must never be bypassed or violated under any circumstances.
