# 🧱 System UML Class Modeling

This diagram models the object-oriented structure of the Fa3liat backend, representing the Core Services and Models that drive the business logic.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +Decimal wallet
        +register(data)
        +verifyOTP(code)
        +addToWallet(amount)
    }

    class Organizer {
        +String id
        +OrganizerType type
        +onboard(docs)
        +connectStripe(accountId)
        +requestPayout()
    }

    class Event {
        +Int id
        +String title
        +Vector embedding
        +publish()
        +setupSeatMap(grid)
        +calculateSimilarity(query)
    }

    class BookingService {
        <<Service>>
        +validateInventory(seats)
        +createOrder(userId, seats)
        +handleWebhook(stripeEvent)
    }

    class AIService {
        <<Service>>
        +generateEmbedding(text)
        +queryVectorDB(vector)
    }

    class Ticket {
        +UUID id
        +TicketStatus status
        +generateQR()
        +redeem()
    }

    class Order {
        +UUID id
        +OrderStatus status
        +totalPrice
        +finalize()
        +refund()
    }

    User "1" -- "0..1" Organizer : implements
    User "1" *-- "*" Order : places
    Organizer "1" *-- "*" Event : manages
    Event "1" *-- "*" Ticket : issues
    Order "1" *-- "*" Ticket : contains
    
    BookingService ..> Order : manages
    AIService ..> Event : augments
```

### 🧱 Architectural Patterns Used
1.  **Service Layer Pattern**: Core business logic is abstracted from controllers into Services (`BookingService`, `AIService`).
2.  **Repository Pattern (via Prisma)**: Data access is handled by the Prisma client, allowing for type-safe database queries.
3.  **Active Record/Model Logic**: Models like `Ticket` and `Order` handle their own status transitions and side effects (like QR generation).
