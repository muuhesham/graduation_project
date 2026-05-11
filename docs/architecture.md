# 🏗️ System Architecture: Fa3liat

This document provides a detailed visual and technical breakdown of the system components and their interactions.

## High-Level Topology

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef api fill:#bbf,stroke:#333,stroke-width:2px;
    classDef data fill:#dfd,stroke:#333,stroke-width:2px;
    classDef worker fill:#fdb,stroke:#333,stroke-width:2px;
    classDef external fill:#eee,stroke:#333,stroke-dasharray: 5 5;

    subgraph Client_Layer [User Interface]
        Frontend[React.js Dashboard]:::client
        Mobile[Consumer App]:::client
    end

    subgraph API_Layer [Express.js Backend Cluster]
        Router[REST Router]:::api
        Auth[JWT/OTP Auth]:::api
        Logic[Business Services]:::api
    end

    subgraph Data_Storage [State & Storage]
        Postgres[(PostgreSQL 16 + PGVector)]:::data
        Redis[(Redis 7 Cache/Queue)]:::data
    end

    subgraph Worker_Tier [Background Workers - BullMQ]
        EmailW[Mail Worker]:::worker
        SMSW[SMS Worker]:::worker
        AIW[AI Vector Worker]:::worker
    end

    subgraph External_Integrations [Third-Party Ecosystem]
        Stripe[Stripe Payments]:::external
        Ollama[Ollama AI Engine]:::external
        Twilio[Twilio SMS]:::external
    end

    %% Connections
    Frontend & Mobile <-->|JSON/HTTPS| Router
    Router --> Auth --> Logic
    
    Logic <-->|Prisma ORM| Postgres
    Logic <-->|Pub/Sub| Redis
    Logic <-->|External API| Stripe
    
    Redis -- "Queue Jobs" --> Worker_Tier
    
    EmailW -->|SMTP| External_Integrations
    SMSW -->|REST| Twilio
    AIW -->|REST| Ollama
    AIW <-->|Vector Ops| Postgres
```

## Layer Descriptions

### 1. Client Layer
- **React Frontend**: A comprehensive dashboard for Organizers and Admins to manage events, payouts, and user reports.
- **Mobile App**: Targeted at attendees for discovering events via AI and presenting QR codes for entry.

### 2. API Layer (Express.js 5.x)
- Uses a **Service-Based Architecture** where controllers only handle request/response, delegating all business logic to decoupled Services.
- **JSend Compliance**: Ensures every API response has a predictable structure (`status`, `data`, `message`).

### 3. Storage Tier
- **PostgreSQL**: Stores relational data and high-dimensional vectors (via `pgvector`).
- **Redis**: Provides sub-millisecond caching and acts as the backbone for task queuing.

### 4. Worker Tier (BullMQ)
- **Email/SMS**: Critical for the "Zero Trust" OTP authentication flow.
- **AI Worker**: Continuously re-vectorizes event data to keep search results fresh and relevant.
