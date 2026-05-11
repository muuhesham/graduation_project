# 📖 Project Glossary & Domain Terms

To ensure consistent communication across the development team and stakeholders, this glossary defines the core domain terms used throughout the Fa3liat codebase.

| Term | Definition | Code Entity |
| :--- | :--- | :--- |
| **Attendee** | A standard user who discovers and purchases tickets for events. | `User` (Role: user) |
| **Organizer** | An elevated user or entity authorized to host events and receive payouts. | `Organizer` |
| **Governorate** | A primary administrative division in Egypt (used for location-based event filtering). | `Governorate` |
| **Seat Tier** | A logical grouping of seats (e.g., VIP, Platinum) with a specific price point. | `EventSeatTier` |
| **Grid Map** | A physical layout of seats defined by rows and columns within a tier. | `EventSeat` |
| **Payout Item** | A granular record of an organizer's earnings from a single order, minus platform fees. | `PayoutItem` |
| **Embedding** | A 768-dimension vector representing the "meaning" of an event for AI search. | `Event.embedding` |
| **JSend** | The specific JSON response format used for all API communication. | `jsend.js` |
| **BullMQ** | The message queue library used for all asynchronous background tasks. | `src/queues/` |

---

# 🛠️ Troubleshooting & FAQ

### 1. Docker: "pgvector" extension not found
**Cause**: Using a standard Postgres image instead of the pgvector-enabled one.
**Fix**: Ensure you are using `pgvector/pgvector:pg16` as defined in `docker-compose.yml`.

### 2. AI: Search results are empty or irrelevant
**Cause**: The `embedding-worker` hasn't processed the events yet, or Ollama is offline.
**Fix**: 
1. Check if the worker is running: `npm run queue:embedding-worker`.
2. Ensure Ollama is reachable at the `OLLAMA_BASE_URL`.

### 3. Payments: Stripe Webhooks not working locally
**Cause**: Stripe cannot reach your `localhost`.
**Fix**: Use the Stripe CLI profile: `docker compose --profile stripe up`. This forwards events to your local API.

### 4. Database: "Relation already exists" error
**Cause**: Migrations are out of sync with your local database state.
**Fix**: Run `npx prisma migrate reset` to clean the database and re-apply all migrations from scratch.
