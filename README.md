# Fa3liat

Fa3liat is an event ticketing and event management platform built with Node.js, Express, Prisma, PostgreSQL, and Redis. The system supports attendee registration, organizer onboarding, event publishing, ticket purchases, seat-based booking flows, newsletter subscriptions, background workers, and optional AI-assisted event discovery.

This repository is submitted as a source-code deliverable. It includes full setup, database, and run instructions for local execution and Docker-based execution.

## Repository Structure

```text
.
├── src/                  Source code
├── exe/                  Notes for executable delivery
├── docs/                 Supporting technical documentation
├── prisma/               Database schema, migrations, and seed data
├── README.md             Main setup and usage guide
├── NOTION_DOCS.md        Draft content for the Notion documentation space
├── ARCHITECTURE.md       Architecture overview
├── docker-compose.yml    Container-based development environment
└── Dockerfile            Application image definition
```

## Project Overview

### Goals

- Provide a backend platform for discovering, publishing, and managing events.
- Support multiple organizer types through a structured onboarding process.
- Prevent overselling through transaction-safe order and seat management.
- Offload background work such as email, SMS, and embedding generation to workers.
- Offer optional AI-based search and chatbot capabilities.

### Target Audience

- Attendees looking for events and purchasing tickets.
- Organizers managing events and ticket inventory.
- Administrators reviewing organizers and moderating platform operations.

## Main Features

- JWT-based authentication with email and phone verification support.
- Organizer onboarding with approval workflow.
- Event creation, event browsing, and category-based discovery.
- Order placement and ticket generation.
- Seat-tier and venue management.
- Newsletter subscription flow.
- Background workers for mail, SMS, and embedding jobs.
- Stripe payment integration.
- Optional semantic search using Ollama and pgvector.

## Technology Stack

| Area | Technology |
| :--- | :--- |
| Runtime | Node.js 20.x |
| Backend Framework | Express 5 |
| ORM | Prisma |
| Database | PostgreSQL 16 with `pgvector` |
| Cache / Queue | Redis 7 |
| Background Jobs | BullMQ |
| Payments | Stripe |
| Mail | Nodemailer, MailHog for local testing |
| SMS | Twilio |
| AI / Search | Ollama, LangChain, PGVector |
| Testing | Jest, Supertest |
| Containerization | Docker, Docker Compose |

## Prerequisites and Dependencies

### Required Software

- Node.js 20.x
- npm 10.x or later
- PostgreSQL 16 or later
- Redis 7 or later
- A POSIX-compatible shell for local npm scripts on Windows, such as Git Bash or WSL

### Recommended Software

- Docker Desktop with Docker Compose
- Postman or a similar API client for endpoint testing

### External Services

- Stripe account and webhook secret for payment flows
- Google OAuth credentials for social login
- Twilio credentials for SMS delivery
- Ollama for local embedding generation
- OpenAI API key for chatbot functionality

### System Requirements

- Operating system: Windows 10/11, Linux, or macOS
- Minimum RAM: 4 GB for the core API stack
- Recommended RAM: 8 GB or more when running PostgreSQL, Redis, workers, and optional AI services together
- Disk space: enough for `node_modules`, PostgreSQL data, uploads, logs, and optional Ollama models

## Source Code Compilation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Event-Ticketing
```

Replace `<your-repository-url>` with the final GitHub repository URL before submission.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Environment

Create a local environment file from the provided template:

```bash
cp .env.example .env
```

Update `.env` before running the project.

### 4. Minimum Environment Variables

The full template is provided in `.env.example`. The following groups must be reviewed:

| Group | Variables |
| :--- | :--- |
| App | `APP_NAME`, `NODE_ENV`, `HOSTNAME`, `PUBLIC_HOST`, `BIND_HOST`, `PROTOCOL`, `PORT`, `APP_URL`, `FRONT_URL`, `APP_CURRENCY`, `STORAGE_TYPE` |
| Authentication | `JWT_KEY`, `JWT_REKEY` |
| Database | `DATABASE_URL` |
| Redis | `REDIS_URL` |
| Mail | `MAIL_SERVER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` |
| Newsletter | `NEWSLETTER_CONFIRMATION_SUCCESS_URL`, `NEWSLETTER_CONFIRMATION_ALREADY_SUBSCRIBED_URL`, `NEWSLETTER_CONFIRMATION_FAILURE_URL`, `NEWSLETTER_JWT_KEY`, `NEWSLETTER_JWT_EXPIRY` |
| Google OAuth | `CLIENT_ID`, `CLIENT_SECRET`, `CALLBACK_URL`, `GOOGLE_REDIRECT_URL` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_API_KEY`, `SUCCESS_ROUTE`, `CANCEL_ROUTE` |
| AI / Search | `AI_API_KEY`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_DIMENSION` |

### 5. Database Setup

Make sure PostgreSQL is running and that the database in `DATABASE_URL` exists.

The project migrations include creation of the `pgvector` extension. Use:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. Seed the Database

```bash
npm run prisma:seed
```

### 7. Convenience Setup Script

As an alternative to running the commands manually, the repository includes a guided setup script:

```bash
npm run setup
```

This script can:

- create `.env` from `.env.example`
- create local `logs/` and `uploads/` directories
- generate the Prisma client
- run migrations
- seed the database

## Compilation Steps

This project does not require a separate frontend bundling step. The effective build and compilation steps for the backend are:

```bash
npm run prisma:generate
npm run prisma:migrate
```

If you want seeded sample data:

```bash
npm run prisma:seed
```

## Run Instructions

### Local Development

Start the API server:

```bash
npm run dev
```

The local API server runs on:

- `http://localhost:8000`

For full functionality, start the background workers in separate terminals:

```bash
npm run queue:mail-worker
npm run queue:sms-worker
npm run queue:embedding-worker
```

Notes:

- `queue:embedding-worker` is only needed when AI embedding features are enabled.
- The API routes are mounted under `/api/v1`.

### Production-Style Start

```bash
npm start
```

### Running Tests

```bash
npm test
```

## Docker Setup

Docker is the recommended way to run the full stack because it starts the main services with consistent configuration.

### Standard Stack

```bash
docker compose up --build
```

This starts:

- PostgreSQL with `pgvector`
- Redis
- MailHog
- API container
- Mail worker

Default Docker endpoints:

- API: `http://localhost:3000`
- MailHog UI: `http://localhost:8026`

### AI Profile

To include Ollama and the embedding worker:

```bash
docker compose --profile ai up --build
```

### Stripe Webhook Forwarding

To start the Stripe CLI container in addition to the main stack:

```bash
docker compose --profile stripe up --build
```

## User Guide Summary

Typical system usage follows this sequence:

1. A user registers and authenticates.
2. An organizer submits onboarding data and waits for approval.
3. An approved organizer creates venues, events, and ticket configurations.
4. An attendee browses events and places an order.
5. Workers process asynchronous jobs such as emails, SMS, and embeddings.
6. Administrators review organizer applications and monitor platform activity.

The Notion documentation should expand these flows into step-by-step user instructions.

## Technical Documentation

Supporting technical documents are available in the repository:

- [Architecture Overview](./ARCHITECTURE.md)
- [API Design](./docs/api_design.md)
- [Deployment Guide](./docs/deployment_guide.md)
- [Database ERD](./docs/database_erd.md)
- [Security Notes](./docs/security.md)
- [Validation and Error Handling](./docs/validation_error_handling.md)
- [Service Layer Deep Dive](./docs/services_deep_dive.md)
- [Notion Documentation Draft](./NOTION_DOCS.md)

## Submission Notes

- This repository satisfies the source-code submission path.
- The `/exe` folder is included for completeness; no pre-built executable is distributed in the current submission.
- Before final submission, confirm that the public Notion link is accessible in an incognito browser window.

## License

This project is released under the MIT License.
