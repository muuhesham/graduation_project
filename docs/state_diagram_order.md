# 🚥 Order & Ticket State Lifecycle

This state diagram visualizes the complex lifecycle of an `Order` and its associated `Ticket`s, illustrating how financial statuses dictate ticket validity.

```mermaid
stateDiagram-v2
    %% Define Order States
    state "Order Lifecycle" as OrderLifecycle {
        [*] --> Pending : User initiates checkout
        Pending --> Completed : Payment succeeds (Stripe Webhook)
        Pending --> Cancelled : Payment fails or timeout
        Completed --> Refunded : Admin or Organizer issues refund
        Cancelled --> [*]
        Refunded --> [*]
    }

    %% Define Ticket States
    state "Ticket Lifecycle" as TicketLifecycle {
        [*] --> Unassigned : Order is Pending
        Unassigned --> Valid : Order Completed (QR Generated)
        Unassigned --> Revoked : Order Cancelled
        Valid --> Used : QR Scanned at Venue
        Valid --> Expired : Event time passes
        Valid --> Revoked : Order Refunded
        Used --> [*]
        Expired --> [*]
        Revoked --> [*]
    }

    %% Note on constraints
    note right of TicketLifecycle
        Tickets only become 'Valid' 
        after the Order transitions
        to 'Completed'.
    end note
```

### 🗝️ State Transitions Logic
- **Pending -> Completed**: Driven entirely by the asynchronous Stripe Webhook. The frontend never dictates payment success.
- **Valid -> Used**: Triggered by the Organizer/Gatekeeper scanning the QR code via the application endpoint.
- **Valid -> Revoked**: If an order is refunded, all associated tickets immediately become invalid, and their QR codes will return an error if scanned.
