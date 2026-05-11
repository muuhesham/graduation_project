# API Design Specification

Fa3liat follows RESTful principles and utilizes an enhanced version of the JSend specification to ensure a consistent and predictable interface for all clients.

---

## 1. RESTful Principles
- Versioning: All endpoints are prefixed with `/api/v1/`.
- Resource Naming: Plural nouns are used for resource collection (e.g., `/events`, `/tickets`).
- HTTP Methods:
    - GET: Retrieve resources.
    - POST: Create new resources or perform complex operations (like checkout).
    - PATCH: Partially update existing resources.
    - DELETE: Remove resources (soft deletes are used internally).

---

## 2. Enhanced Response Format (JSend)
The system uses an Object-Frozen JSend utility that extends the standard with optional status codes and custom messages.

### 2.1 Success Responses (2xx)
Success responses can optionally include a specialized `code` and a human-readable `message`.
```json
{
  "status": "success",
  "data": {
    "event": { "id": 1, "title": "Conference" }
  },
  "code": 200,
  "message": "Resource retrieved successfully"
}
```

### 2.2 Fail Responses (4xx)
Used for client-side errors, such as validation failures or business rule violations.
```json
{
  "status": "fail",
  "data": {
    "email": "Email address is already in use"
  },
  "code": 400
}
```

### 2.3 Error Responses (500)
Used for unhandled server exceptions.
```json
{
  "status": "error",
  "message": "Internal Server Error",
  "code": 500,
  "data": null
}
```

---

## 3. Standard HTTP Status Codes
| Code | Meaning | Context |
| :--- | :--- | :--- |
| 200 | OK | Successful retrieval or update. |
| 201 | Created | Resource successfully persisted. |
| 400 | Bad Request | Validation schema failed. |
| 401 | Unauthorized | Missing or expired JWT. |
| 403 | Forbidden | Insufficient permissions for resource. |
| 404 | Not Found | Resource missing in database. |
| 409 | Conflict | State conflict (e.g., inventory lock). |
| 429 | Too Many Requests | Rate limit exceeded (Redis-backed). |

---

## 4. Query & Filter Standards
- Pagination: Implemented via `?page={n}&limit={m}`.
- Sorting: Provided via `?sort={field}:{order}`.
- Semantic Search: The `?q={query}` parameter triggers high-dimensional vector similarity matching via PGVector.
