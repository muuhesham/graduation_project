# ⚡ Real-time Interaction Sequence (Socket.io)

This sequence diagram illustrates how Fa3liat uses WebSockets to provide instant feedback to users without page refreshes, specifically for ticket sales and admin broadcasts.

```mermaid
sequenceDiagram
    autonumber
    participant Attendee as User (App)
    participant API as Express API
    participant Socket as Socket.io Server
    participant Redis as Redis Pub/Sub
    participant Org as Organizer (Dashboard)

    Attendee->>API: POST /api/v1/orders/checkout
    activate API
    API->>DB: Lock & Create Order
    API-->>Attendee: Return Checkout URL
    deactivate API

    rect rgb(240, 255, 240)
        Note over API,Socket: External Event Trigger
        API->>Redis: Publish "ticket:sold" event
        Redis->>Socket: Emit event to Room: [organizer_123]
        Socket->>Org: socket.emit("SALES_UPDATE", { amount: 50 })
        Note right of Org: Dashboard updates chart instantly
    end

    rect rgb(255, 240, 240)
        Note over API,Socket: Global Admin Broadcast
        Admin->>API: POST /api/v1/admin/broadcast
        API->>Socket: io.emit("MAINTENANCE_NOTICE", "System restart in 5m")
        Socket->>Attendee: Show alert overlay
        Socket->>Org: Show alert overlay
    end
```

### ⚡ Technical Implementation
- **Rooms**: Users are automatically joined to rooms based on their role and ID (e.g., `user_${id}`, `organizer_${id}`).
- **Redis Adapter**: Even if multiple API instances are running, the `socket.io-redis` adapter ensures messages reach users connected to any server node.
- **Graceful Degradation**: If WebSockets fail to connect, the system falls back to long-polling automatically.
