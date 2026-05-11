# 🔒 Security Architecture Specification

Security is a core pillar of the Fa3liat system. We implement a multi-layered security strategy to protect user data, financial transactions, and system availability.

---

## 1. Authentication (AuthN)
### JWT & Refresh Tokens
- **Access Tokens**: Short-lived (e.g., 15 minutes) JWTs used for authorization on protected routes.
- **Refresh Tokens**: Long-lived tokens stored in the database. We implement **Token Rotation**; every time a refresh token is used, it is invalidated and a new one is issued.
- **OTP Verification**: For account creation and critical actions, a 6-digit One-Time Password is required. OTPs are handled by background workers and expire after 10 minutes.

---

## 2. Authorization (AuthZ)
### Role-Based Access Control (RBAC)
We define three primary roles:
1.  **Attendee (User)**: Can view events, book tickets, and manage their profile.
2.  **Organizer**: Can manage events and view sales analytics. Inherits Attendee permissions.
3.  **Admin**: Global system oversight, including organizer verification and payout approval.

### Policy-Based Access
Beyond roles, we use specific policies (found in `src/policies/`) to ensure users can only modify their *own* resources (e.g., a user can only view their own tickets).

---

## 3. Rate Limiting & Protection
- **Global Rate Limit**: Applied via `express-rate-limit` using a **Redis store** to track requests across container restarts.
- **Brute Force Protection**: Specific, stricter limits on `/auth/login` and `/auth/register` endpoints.
- **DDoS Mitigation**: Handled at the infrastructure level (e.g., Docker bridge networking and optional Cloudflare proxying).

---

## 4. Data Integrity & Sanitization
- **Sanitization**: All HTML input is sanitized using `sanitize-html` to prevent XSS.
- **Validation**: Strict schema validation via `express-validator` ensures that only expected fields reach the Service layer.
- **Parameterization**: Prisma ORM automatically uses parameterized queries, making the system inherently immune to SQL Injection.

---

## 5. Financial Security
- **Stripe Webhooks**: Webhook signatures are verified using the `STRIPE_WEBHOOK_SECRET` to prevent request spoofing.
- **PCI Compliance**: No credit card data ever touches our servers. All sensitive data is handled directly by Stripe's secure infrastructure.
