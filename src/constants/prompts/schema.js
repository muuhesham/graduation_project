export const schema = `
### 1. User Model (The Attendee)
- **Roles**: Defined by \`enum Role { admin, user, organizer }\`.
- **Wallet**: Every user has a \`wallet\` (Decimal) for transactions and refunds.
- **Verification**: Status tracked via \`isVerified\` (Boolean) and \`isCompleted\` (Boolean).
- **Geography**: Linked to \`Governorate\` via \`governorateId\`.
- **Auth**: Supports \`LOCAL\`, \`GOOGLE\`, \`FACEBOOK\`, and \`APPLE\`.

### 2. Organizer Model (The Provider)
- **Link**: Each Organizer is a User (\`userId\` unique link).
- **Types**: Defined by \`enum OrganizerType { HOBBYIST, BUSINESS, COMPANY }\`.
  - *Hobbyist*: Linked to \`nationalId\`.
  - *Business/Company*: Linked to \`taxId\` and \`registrationNumber\`.
- **Verification**: Controlled by \`OrganizerVerficiationStatus\` (UNDER_REVIEW, APPROVED, REJECTED).
- **Status**: Can be \`ACTIVE\` or \`SUSPENDED\` (with a \`suspendReason\`).
- **Review**: Organizers are reviewed by Admins (\`reviewedBy\`).

### 3. The Core Relationship (How they interact)
- **Event Creation**: Only Users with \`role: organizer\` and an \`APPROVED\` status can create an \`Event\`.
- **Ticketing**:
    - Users purchase \`TicketType\` (price/quantity).
    - This creates an \`Order\` and then a \`Ticket\`.
    - Each \`Ticket\` is linked to a \`User\` (the buyer) and an \`Event\` (via TicketType).
- **Verification Flow**: The Organizer (via their app) scans the \`QrCode\` linked to the \`Ticket\` to change its status to \`used\`.
`.trim();
