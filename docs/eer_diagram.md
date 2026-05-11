# 🧬 Extended Entity Relationship (EER) Diagram

This diagram visualizes the complex inheritance and specialized relationships within the Fa3liat database, specifically focusing on the Organizer and Seating hierarchies.

```mermaid
erDiagram
    ORGANIZER ||--o| HOBBYIST : "specializes (Subtype)"
    ORGANIZER ||--o| BUSINESS : "specializes (Subtype)"
    ORGANIZER ||--o| COMPANY : "specializes (Subtype)"
    
    ORGANIZER {
        String id PK
        Enum type "HOBBYIST | BUSINESS | COMPANY"
        String stripeAccountId "Connected Account ID"
        Enum status "ACTIVE | SUSPENDED"
        Boolean isEmailVerified
    }
    
    HOBBYIST {
        String organizerId PK,FK
        String nationalId "Legal Personal ID"
    }
    
    BUSINESS {
        String organizerId PK,FK
        String commercialRegistration "Legal Business Num"
        String taxId
    }
    
    COMPANY {
        String organizerId PK,FK
        String registrationNumber "Corp Reg"
        String officialDocsPath "S3/Disk Reference"
    }

    EVENT ||--o{ SEAT_TIER : "contains"
    SEAT_TIER ||--o{ SEAT : "defines"
    
    SEAT {
        Int id PK
        Int rowIndex
        Int seatIndex
        Boolean isSold
    }

    TICKET }|--|| SEAT : "reserved_for"
    ADMIN ||--o{ PAYOUT : "triggers"
    PAYOUT ||--o{ ORDER : "batch_pays"
```

### 🧬 Logical Inheritance Details
- **Organizer Sub-typing**: We use a **Class Table Inheritance** pattern where common organizer attributes (contact info, stripe keys) live in the `ORGANIZER` table, while legal verification requirements vary by entity type and live in specialized tables.
- **Seat Mapping**: The system supports complex venues. An `EVENT` can have multiple `SEAT_TIER`s (e.g., VIP, General), each defining a physical grid of `SEAT`s.
- **Batch Payouts**: The `PAYOUT` entity acts as a super-node that aggregates multiple completed `ORDERS` for a single Stripe transfer session.
