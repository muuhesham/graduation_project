export const api = `
### 1. Identity & Profile (User Journey)
- **Authentication**: Users register, login, and verify their accounts using **Email OTP** or **Phone OTP**.
- **User Roles**: The system uses three roles: \`user\`, \`organizer\`, and \`admin\`.
- **Wallet**: Each user has a \`wallet\` (Decimal) to manage funds and receive refunds for cancelled events.
- **Onboarding**: New users complete their profile through \`preferences\` and \`location\` updates to get **Personalized Events**.

### 2. Organizer Management (Becoming a Provider)
- **Upgrade Path**: A regular user can become an organizer via \`PATCH /upgrade-to-organizer\`.
- **Verification**: This requires uploading an \`officialDocument\`. Statuses are \`UNDER_REVIEW\`, \`APPROVED\`, or \`REJECTED\`.
- **Contact Verification**: Organizers must verify their \`contact-email\` via OTP before managing events.
- **Organizer Types**: Supports \`HOBBYIST\` (National ID), \`BUSINESS\`, and \`COMPANY\` (Tax ID/Registration).

### 3. Event & Ticketing Flow (The Interaction)
- **Discovery**: Users find events via \`nearby-events\`, \`latest-events\`, and \`personalized-events\`.
- **Interactions**: Users can mark events as \`interested\` or check \`availability\` for specific sessions.
- **Booking (Checkout)**: Handled via \`POST /events/:id/checkout\` (Stripe integration). Free events use the \`reserve\` endpoint.
- **Tickets & QR**: After booking, a \`Ticket\` is issued with a unique \`QrCode\`. Ticket statuses: \`valid\`, \`used\`, \`expired\`.
- **Seat Mapping**: If an event has \`hasSeatMap: true\`, users pick seats via \`EventSeatTier\` and \`EventSeat\`.

### 4. Organizer Control (Management)
- **Event Operations**: Organizers can **Create**, **Update**, **Delete**, or **Cancel** events via \`/api/v1/organizer/events\`.
- **Dashboard**: Access to \`stats\` and \`analytics\` for monitoring sales and attendance.
- **Validation**: Organizers (via a dedicated app) scan the \`QrCode\` to validate entry and update ticket status to \`used\`.

### 5. System Logic & Safety
- **Coupons**: Admins manage \`Coupons\` (linked to Stripe Promo IDs) for event discounts.
- **Geography**: Location hierarchy is \`Country -> State -> City -> Governorate -> Venue\`.
- **Newsletter**: Users can subscribe to stay updated on new events.
`.trim();
