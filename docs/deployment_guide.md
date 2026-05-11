# 🚢 Deployment & Infrastructure Specification

Fa3liat is built for containerized deployment, ensuring consistency across development, staging, and production environments.

---

## 1. Docker Topology
The application is orchestrated using **Docker Compose** with several specialized services:

- **`app`**: The Node.js Express API.
- **`db`**: PostgreSQL with the `pgvector` extension enabled.
- **`redis`**: High-performance cache and job queue backbone.
- **`mailhog`**: Local SMTP server for testing email delivery.
- **`ollama`**: AI engine container for generating vector embeddings.
- **`mail-worker` / `sms-worker`**: Specialized containers running background job loops.

---

## 2. Docker Networking
- **Bridge Network**: All services communicate over an internal bridge network.
- **Security**: The database and redis containers are *not* exposed to the public internet. Only the `app` container (port 8000) and `mailhog` (port 8026 - dev only) have published ports.

---

## 3. Persistent Volumes
To ensure data persists across container restarts:
- **`postgres_data`**: Stores the relational and vector data.
- **`redis_data`**: Persists the job queue state and cache.
- **`ollama_data`**: Stores the downloaded LLM models (e.g., `nomic-embed-text`).
- **`uploads`**: Local bind mount for storing user-uploaded banners and QR codes.

---

## 4. Environment Management
- **`.env` files**: Used to store secrets like `JWT_KEY` and `STRIPE_SECRET_KEY`.
- **Precedence**: Environment variables set in `docker-compose.yml` override those in the local `.env` file.
- **Validation**: On startup, the app validates that all required environment variables are present before booting the HTTP server.

---

## 5. Continuous Integration (CI)
A typical CI pipeline for Fa3liat (e.g., GitHub Actions) performs:
1.  **Linting**: Ensures code adheres to Prettier/ESLint rules.
2.  **Unit Tests**: Runs the Jest test suite.
3.  **Build**: Verifies that the Docker images can be built without errors.
4.  **Database Migration Check**: Verifies that Prisma migrations are in sync with the schema.
