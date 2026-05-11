# 🧱 Service Layer & Business Logic Deep Dive

The Service Layer is the heart of the Fa3liat backend, containing all domain-specific logic and coordinating interactions between the database and external integrations.

---

## 1. Architectural Role
The Service layer sits between the **Controllers** and the **Models (Prisma)**.
- **Controllers**: Solely responsible for HTTP parsing, input extraction, and calling the relevant service.
- **Services**: Responsible for state management, authorization policies, third-party integrations, and complex data transformations.

---

## 2. Transactional Integrity
We use Prisma's `$transaction` API to ensure that complex multi-step operations either succeed completely or fail gracefully.

### Example: Booking Process
1.  **Start Transaction**
2.  **Lock Seats**: Select target seats using `FOR UPDATE`.
3.  **Validate**: Check if seats were sold while user was browsing.
4.  **Execute**: Create Order, Create Tickets, Update Wallet.
5.  **Commit**: Only if all steps above succeed.

---

## 3. Asynchronous Worker Integration
To maintain a high-performance event loop, services offload non-critical tasks to **BullMQ**.

### Process Flow:
1.  **Service Action**: (e.g., `eventService.createEvent`)
2.  **Job Enqueue**: The service pushes a job to the Redis queue (e.g., `embedding-queue`).
3.  **Worker Pick-up**: A separate worker process detects the job and executes it (e.g., calling Ollama for vectorization).
4.  **Callback**: Once finished, the worker updates the event's `embedding` column in PostgreSQL.

---

## 4. Error Propagation
Services do not handle their own HTTP errors. Instead, they throw domain-specific errors (e.g., `InsufficientInventoryError`) or generic `AppError` subclasses. These are caught by the `asyncWrapper` in the route definition and passed to the global error handler.

---

## 5. Third-Party Abstractions
Services often act as wrappers for external SDKs:
- **PaymentService**: Abstracts the Stripe SDK.
- **MailService**: Wraps Nodemailer and MailHog.
- **SMSService**: Wraps the Twilio SDK.
- **AIService**: Wraps LangChain and Ollama integration.
