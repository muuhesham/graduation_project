# 🛡️ Data Validation & Error Handling Specification

Fa3liat implements a rigorous, two-tier validation and centralized error handling strategy to ensure system robustness and security.

---

## 1. Data Validation (Tier 1: Middleware)
We use `express-validator` to define strict schemas for every incoming request.

### Key Validation Logic:
- **Type Checking**: Ensures fields are the correct primitive (String, Int, Boolean).
- **Format Verification**: Validates emails, phone numbers, and ISO dates.
- **Sanitization**: Automatically trims whitespace and escapes potentially dangerous characters.
- **Custom Logic**: Used for complex checks, such as verifying that an `endDate` is after a `startDate`.

---

## 2. Business Rule Validation (Tier 2: Service Layer)
While the middleware handles structure, the **Service Layer** handles state-dependent rules:
- **Inventory Check**: Verifying that a seat isn't already sold before creating an order.
- **Permission Check**: Verifying that an organizer owns the event they are trying to edit.
- **Status Check**: Ensuring a ticket can only be redeemed if its status is `valid`.

---

## 3. Centralized Error Handling
Fa3liat uses a single error-handling middleware to catch all exceptions and format them into JSend-compliant responses.

### The `AppError` Hierarchy
All custom errors extend the base `AppError` class (found in `src/errors/AppError.js`):

| Error Class | Status Code | Usage |
| :--- | :--- | :--- |
| **BadRequestError** | 400 | Validation failures. |
| **UnauthorizedError**| 401 | Missing or invalid auth. |
| **ForbiddenError** | 403 | Insufficient permissions. |
| **NotFoundError** | 404 | Missing database record. |
| **ConflictError** | 409 | Inventory lock or duplicate data. |
| **InternalServerError** | 500 | Uncaught exceptions / DB failure. |

---

## 4. Global Error Handling Middleware
The middleware (in `src/middlewares/errorHandler.js`) performs the following:
1.  **Logging**: All errors are logged to the console (and optionally to a log file) with a stack trace in development.
2.  **JSend Formatting**: Converts the error into the standard `fail` or `error` structure.
3.  **Production Safety**: In production mode, sensitive error details (like DB query strings or file paths) are hidden from the client to prevent information leakage.
