# Fa3liat — Event Management & E-Ticketing Web Application

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
</p>

**Fa3liat** is a comprehensive web application platform for creating events, managing tickets, and handling online payments. The platform supports both general-admission and seat-based events with multiple ticket tiers, organizer onboarding workflows, and AI-assisted event discovery.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Main Features](#-main-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Docker Setup](#-docker-setup)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Technical Documentation](#-technical-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

Fa3liat is an event management and ticketing platform built with modern web technologies. It enables organizers to create events, sell tickets online, manage venues, and handle payments through integrated payment gateways. The platform supports:

- 🎫 **General Admission Tickets** - Standard ticketed events.
- 💺 **Seat-Based Events** - Events with assigned seating and flexible seat management.
- 👤 **User Authentication** - Email, phone (OTP), and social login (Google) with soft delete support.
- 📱 **QR Code Tickets** - Mobile ticket validation with QR code generation.
- 💳 **Payment Integration** - Stripe payment processing and payout management.
- 📧 **Background Workers** - Reliable email, SMS, and AI processing using BullMQ.
- 📍 **Venue & Location Core** - Detailed location hierarchy and seating map configurations.
- 📱 **Mobile API** - Specialized endpoints for mobile ticket scanning.

---

## ✨ Main Features

- **Organizer Onboarding**: Multi-stage approval workflow for hobbyists, businesses, and companies.
- **Seat Map Locking**: Transaction-safe seat reservations to prevent overbooking.
- **Semantic Search**: (Optional) AI-powered event discovery using Ollama and pgvector.
- **Real-time Notifications**: Socket.io integration for instant updates.
- **Coupon System**: Event-specific and platform-wide discount codes.
- **Newsletter**: Subscription flow with double opt-in confirmation.
- **Admin Dashboard**: Comprehensive monitoring and moderation tools.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | Node.js 20.x |
| **Framework** | Express.js 5 |
| **Database** | PostgreSQL 16 (with `pgvector`) |
| **ORM** | Prisma |
| **Caching / Queue** | Redis 7, BullMQ |
| **Authentication** | JWT, bcryptjs |
| **Payments** | Stripe |
| **SMS** | Twilio |
| **AI / ML** | Ollama, LangChain |
| **Testing** | Jest, Supertest |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis 7+

### 1. Clone the repository

```bash
git clone https://github.com/muuhesham/graduation_project.git
cd graduation_project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file from the provided template:

```bash
cp .env.example .env
```

*Update `.env` with your actual database, Redis, and external service credentials.*

### 4. Guided Setup

Alternatively, use the built-in setup script to automate folder creation and basic configuration:

```bash
npm run setup
```

### 5. Database Initialization

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 6. Start the server

```bash
npm run dev
```

---

## 🐳 Docker Setup

Docker is the recommended way to run the full stack with consistent configuration.

### Standard Stack
```bash
docker compose up --build
```

### AI Profile (Ollama + Embedding Worker)
```bash
docker compose --profile ai up --build
```

### Stripe Webhook Forwarding
```bash
docker compose --profile stripe up --build
```

---

## 📂 Project Structure

```text
.
├── src/
│   ├── config/            # Configuration (DB, Redis, Mail, Stripe)
│   ├── controllers/       # Route handlers
│   ├── models/            # Core business models
│   ├── services/          # Business logic layer
│   ├── repositories/      # Data access layer
│   ├── routes/            # API endpoint definitions
│   ├── middlewares/       # Auth, validation, error handling
│   ├── workers/           # BullMQ background workers
│   ├── resources/         # API response transformers
│   └── utils/             # Utility helpers
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.js            # Main seeder
│   └── seeders/           # Modular data seeders
├── docs/                  # Detailed technical documentation
├── data/                  # Static JSON data (e.g. governorates)
├── scripts/               # Setup and maintenance utilities
├── tests/                 # Integration and unit tests
├── Dockerfile             # App image definition
└── docker-compose.yml     # Orchestration
```

---

## 🔗 API Endpoints

The API is versioned and mounted under `/api/v1`.

| Module | Base Path | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | Login, Register, OTP, Social Login |
| **User** | `/api/v1/user` | Profile management, Onboarding |
| **Events** | `/api/v1/events` | Browsing, Checkout, Interests |
| **Organizer** | `/api/v1/organizer` | Event management, Venue setup |
| **Admin** | `/api/v1/admin` | Reviews, Payouts, System stats |
| **Mobile** | `/api/v1/mobile` | Ticket scanning and validation |

---

## 🗄 Database Schema

### Core Models
- **User** & **Organizer** (Hobbyist, Business, Company)
- **Event**, **Venue**, **Category**, **Tag**
- **Order**, **OrderItem**, **Ticket**, **TicketType**
- **EventSeat**, **EventSeatTier** (Assigned seating)

### Supporting Models
- **Otp**, **PhoneOtp**, **RefreshToken**, **ResetPasswordToken**
- **NewsletterSubscriber**, **InterestedEvent**, **EventReview**
- **Payout**, **PayoutItem**, **Coupon**, **QrCode**

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run setup` | Run full project setup utility |
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed database with sample data |
| `npm test` | Run test suite with Jest |
| `npm run queue:mail-worker` | Start mail processing worker |

---

## 📚 Technical Documentation

Detailed guides are available in the `/docs` folder:
- [Architecture Overview](./ARCHITECTURE.md)
- [API Design](./docs/api_design.md)
- [Database ERD](./docs/database_erd.md)
- [Deployment Guide](./docs/deployment_guide.md)
- [Security Notes](./docs/security.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

<p align="center">Built with ❤️ by the Fa3liat Team</p>
