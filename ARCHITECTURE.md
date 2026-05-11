# 🏗️ System Architecture: Fa3liat

Fa3liat is engineered for high-throughput ticketing operations, utilizing a service-oriented monolith architecture with asynchronous processing for non-blocking performance.

## 🗺️ High-Level Topology

The following diagram illustrates the professional distribution of responsibilities across the system layers.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef api fill:#bbf,stroke:#333,stroke-width:2px;
    classDef data fill:#dfd,stroke:#333,stroke-width:2px;
    classDef worker fill:#fdb,stroke:#333,stroke-width:2px;
    classDef external fill:#eee,stroke:#333,stroke-dasharray: 5 5;

    subgraph Client_Layer [User Interface]
        Frontend[React.js Web Dashboard]:::client
        Mobile[Mobile Consumer App]:::client
    end

    subgraph API_Layer [Express.js Backend Cluster]
        Router[REST Router]:::api
        Auth[JWT/OTP Auth]:::api
        Logic[Business Services]:::api
        Valid[Validator]:::api
    end

    subgraph Data_Storage [State & Storage]
        Postgres[(PostgreSQL 16 + PGVector)]:::data
        Redis[(Redis 7 Cache/Queue)]:::data
    end

    subgraph Worker_Tier [Background Workers - BullMQ]
        EmailW[Mail Worker]:::worker
        SMSW[SMS Worker]:::worker
        AIW[AI Embedding Worker]:::worker
    end

    subgraph External_Integrations [Third-Party Ecosystem]
        Stripe[Stripe Payments]:::external
        Ollama[Ollama AI Engine]:::external
        Twilio[Twilio SMS]:::external
    end

    %% Connections
    Frontend & Mobile <-->|JSON/HTTPS| Router
    Router --> Valid --> Auth --> Logic
    
    Logic <-->|Prisma ORM| Postgres
    Logic <-->|Pub/Sub| Redis
    Logic <-->|External API| Stripe
    
    Redis -- "Queue Jobs" --> Worker_Tier
    
    EmailW -->|SMTP| External_Integrations
    SMSW -->|REST| Twilio
    AIW -->|REST| Ollama
    AIW <-->|Vector Ops| Postgres

    %% Legend
    subgraph Legend
        L1[Client Layer]:::client
        L2[Backend Logic]:::api
        L3[Persistent Data]:::data
        L4[Async Process]:::worker
    end
```

---

## 💎 Architectural Pillars

### 1. Intelligent Search (AI-Powered)
Fa3liat utilizes **Vector Embeddings** to provide semantic search.
- **Technology**: `PGVector` extension for PostgreSQL.
- **Workflow**: Event descriptions are transformed into vectors using the `nomic-embed-text` model via **Ollama**. This allows users to find events based on "vibes" or "intent".

### 2. Transactional Consistency
For seat management, the system employs **Atomic Row Locking**.
- **Mechanism**: Prisma `$transaction` API.
- **Impact**: Ensures that in a multi-tier seat map, once a user initiates checkout, that specific inventory row is locked, preventing overbooking or race conditions.

### 3. Scalable Task Offloading
Heavy operations are never performed on the main thread.
- **Technology**: `BullMQ` (Redis-backed queue).
- **Workers**:
    - **Mail Worker**: Handles system-critical OTP delivery and marketing newsletters.
    - **SMS Worker**: Integrated with Twilio for phone-based verification.
    - **Embedding Worker**: Asynchronously updates the vector database when events are modified.

### 4. Financial Infrastructure
The system implements **Stripe Connect** for complex financial orchestration.
- **Organizer Onboarding**: specialized logic for Hobbyist (ID verification) vs Business/Company (Tax/Doc verification).
- **Payout Logic**: Automated calculation of platform fees vs organizer earnings.

---

## 🔗 Technical Detailed Diagrams

*   🧬 [Database ERD & Schema Logic](./docs/database_erd.md)
*   🔄 [End-to-End Booking Sequence](./docs/sequence_diagram.md)
*   🚥 [Order & Ticket State Lifecycle](./docs/state_diagram_order.md)
*   ⚡ [Real-time Notifications (Socket.io Flow)](./docs/socket_flow.md)
*   🏢 [Organizer Onboarding Flowchart](./docs/flowchart_organizer.md)
*   🤖 [AI Vector Embedding Sequence](./docs/sequence_ai_embedding.md)
*   🛤️ [User Registration Activity Flow](./docs/activity_diagram.md)
*   🧱 [System UML Class Modeling](./docs/uml_class_diagram.md)

---

## 📘 Software Engineering (SWE) Specifications

For a deeper understanding of our internal standards and implementation details, please review the following specifications:

*   🌐 **[API Design Specification](./docs/api_design.md)**: REST principles, JSend format, and status codes.
*   🔒 **[Security Architecture](./docs/security.md)**: AuthN/AuthZ, rate limiting, and data sanitization.
*   🛡️ **[Validation & Error Handling](./docs/validation_error_handling.md)**: express-validator schemas and AppError hierarchy.
*   🧱 **[Service Layer Deep Dive](./docs/services_deep_dive.md)**: Domain logic, transactions, and worker integration.
*   🚢 **[Deployment & Infrastructure](./docs/deployment_guide.md)**: Docker topology, networking, and volumes.
*   📖 **[Glossary & Troubleshooting](./docs/glossary_troubleshooting.md)**: Domain terms and common setup issues.
