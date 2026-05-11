# 🧬 Database Entity Relationship Diagram (ERD)

Fa3liat uses a normalized relational schema designed for transactional integrity and complex event hierarchies.

## ERD Visualization

```mermaid
erDiagram
    %% Styles
    classDef main fill:#f9f,stroke:#333,stroke-width:2px;
    
    USER ||--o| ORGANIZER : "specializes"
    USER ||--o{ TICKET : "owns"
    USER ||--o{ ORDER : "places"

    ORGANIZER ||--o{ EVENT : "manages"
    ORGANIZER |o--|| HOBBYIST : "legal_info"
    ORGANIZER |o--|| BUSINESS : "legal_info"
    ORGANIZER |o--|| COMPANY : "legal_info"

    EVENT ||--o{ EVENT_SESSION : "has_timing"
    EVENT ||--o{ TICKET_TYPE : "defines"
    EVENT ||--o{ SEAT_TIER : "configures"

    SEAT_TIER ||--o{ SEAT : "generates"
    TICKET_TYPE ||--o{ TICKET : "issues"
    SEAT ||--o| TICKET : "allocated_to"

    ORDER ||--o{ TICKET : "generates"
    
    PAYOUT ||--o{ ORDER : "batches"
    ORGANIZER ||--o{ PAYOUT : "receives"
```

## Core Schema Logic

### 1. Seating & Inventory
- **Grid Logic**: Venue layouts are stored as tiers (VIP, Standard) with `numberOfRows` and `numberOfColumns`.
- **Atomic Allocation**: The `SEAT` table tracks the `isSold` state. During checkout, we use Prisma's atomic transactions to lock seat rows, ensuring no two tickets are issued for the same physical seat.

### 2. Semantic Data (PGVector)
- The `EVENT` table contains an `embedding` field. This is a vector representation of the event's metadata, enabling sub-second similarity searches using cosine distance.

### 3. Financial Ledger
- **Orders**: Immutable records of purchase attempts.
- **Payouts**: Aggregated ledger entries used to trigger bulk transfers from the platform's Stripe balance to individual Organizer connected accounts.
