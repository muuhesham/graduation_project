# 🤖 AI Vector Embedding Sequence

This sequence diagram details the asynchronous workflow used to generate AI embeddings for events, ensuring the main API thread remains unblocked and responsive.

```mermaid
sequenceDiagram
    autonumber
    participant Org as Organizer (Client)
    participant API as Express API
    participant DB as Postgres
    participant Redis as BullMQ Queue
    participant Worker as Embedding Worker
    participant Ollama as Local AI (Ollama)

    Org->>API: POST /api/v1/events (Title, Description, Tags)
    activate API
    API->>DB: Save Event Data (embedding: null)
    DB-->>API: Event Created (ID: 123)
    
    Note over API,Redis: Decoupling AI generation
    API->>Redis: Job: { type: 'generate_vector', eventId: 123 }
    
    API-->>Org: 201 Created (Success)
    deactivate API

    %% Background Process
    activate Worker
    Redis-->>Worker: Dequeue Job (eventId: 123)
    Worker->>DB: Fetch Event Description & Tags
    DB-->>Worker: "A beautiful concert in Cairo..."
    
    Note over Worker,Ollama: Calling Local LLM for Vectors
    Worker->>Ollama: POST /api/embeddings (model: nomic-embed-text)
    Ollama-->>Worker: Return 768-dimensional Vector [0.12, -0.05, ...]
    
    Worker->>DB: UPDATE Event SET embedding = Vector
    DB-->>Worker: Update Successful
    Worker->>Redis: Mark Job Completed
    deactivate Worker
```

### 🧠 Performance Benefits
- **Zero Latency Impact**: The Organizer receives a `201 Created` response instantly. They do not wait for the LLM to process the text.
- **Fault Tolerance**: If the `Ollama` service is temporarily down, the `BullMQ` worker will automatically retry the job with exponential backoff, ensuring no events are missing from the semantic search index.
