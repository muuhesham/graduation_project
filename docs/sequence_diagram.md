# 🔄 Ticket Booking & Financial Sequence

This sequence diagram details the interaction between system components during a high-stakes transaction, highlighting inventory locking and asynchronous verification.

```mermaid
sequenceDiagram
    autonumber
    actor User as Attendee (User)
    participant Front as Frontend (React)
    participant API as Core API (Express)
    participant DB as Postgres (Prisma)
    participant Queue as BullMQ (Redis)
    participant Stripe as Stripe API

    User->>Front: Click "Purchase Tickets"
    Front->>API: POST /api/v1/orders/checkout
    activate API
    
    Note over API,DB: Critical Section: Inventory Lock
    API->>DB: Check seat availability & $transaction lock
    alt Seats are taken
        DB-->>API: Conflict (Row Locked)
        API-->>Front: 409 Conflict: Seats no longer available
    else Seats available
        DB-->>API: Success
        API->>DB: Create Order (Status: PENDING)
        API->>DB: Create Ticket placeholder rows
    end
    
    API->>Stripe: Create PaymentIntent (amount, meta)
    Stripe-->>API: Return client_secret
    API-->>Front: 201 Created + client_secret
    deactivate API
    
    Front->>User: Show Secure Payment Modal
    User->>Stripe: Enter Card Details & Confirm
    Stripe-->>User: Payment Successful UI
    
    rect rgb(240, 248, 255)
        Note right of Stripe: Async Webhook Execution
        Stripe->>API: POST /webhooks/stripe (payment_intent.succeeded)
        activate API
        API->>DB: Update Order (Status: COMPLETED)
        API->>DB: Finalize Tickets & Generate IDs
        API->>Queue: Enqueue "Ticket_Success_Email"
        API-->>Stripe: 200 OK
        deactivate API
    end
    
    Front->>API: GET /api/v1/orders/{id}/tickets
    API-->>Front: Return Ticket list with QR Data
    Front-->>User: Render QR Codes for Entry
```

### 🗝️ Key Architectural Highlights
- **Atomic Transactions**: Steps 4-8 are wrapped in a database transaction to ensure no overbooking occurs.
- **Webhook Decoupling**: The order is finalized only after Stripe confirms the funds, preventing fraudulent ticket generation.
- **Background Delivery**: Ticket confirmation emails are handled by a worker to keep the webhook response sub-second.
