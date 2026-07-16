<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

**Fa3liat** is a comprehensive web application platform for creating events, managing tickets, and handling online payments. The platform supports both general-admission and seat-based events with multiple ticket tiers, organizer onboarding workflows, and AI-assisted event discovery.

> 💡 **Looking for the full application?** 
> To view or run the entire project (including Backend, Frontend Web, and Mobile App), please visit the repository: https://github.com/muuhesham/source_code_gp.
---

## 📋 Table of Contents

- [Overview](#-overview)
- [Screenshots & Demo](#-screenshots--demo)
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

## 📸 Screenshots & Demo

### 🚀 Live Demo 
* 🔗 [Watch Live Demo (Google Drive)](https://drive.google.com/drive/folders/1ZYVKVTpJjSawZfwO7PDVc2_0u5-4er9S?usp=drive_link)

### 💻 Web Application
<img width="1600" height="790" alt="WhatsApp Image 2026-07-16 at 11 50 34 AM" src="https://github.com/user-attachments/assets/397e80fb-57b5-4617-8d6b-d713b2d782f7" />
<img width="1600" height="780" alt="WhatsApp Image 2026-07-16 at 11 51 28 AM" src="https://github.com/user-attachments/assets/69ecec31-9445-48a0-8b6f-53c30d65a150" />
<img width="1055" height="591" alt="fc512ee5-8354-4086-b58a-ff72de98b7e6" src="https://github.com/user-attachments/assets/0a991d8b-901e-489f-8736-08f804af2a9b" />
<img width="1054" height="757" alt="WhatsApp Image 2026-07-16 at 11 52 52 AM" src="https://github.com/user-attachments/assets/c8e580d9-5014-4d21-bca3-10c55cf8a7dc" />
<img width="1600" height="791" alt="WhatsApp Image 2026-07-16 at 11 51 15 AM" src="https://github.com/user-attachments/assets/ea5b5be1-fed8-4386-91f9-086a16e9d9f9" />

### 📱 Mobile Application
<img width="300" height="580" alt="b29ab7d9-b874-44d5-a28c-f43b842a0587" src="https://github.com/user-attachments/assets/2f05d175-63fc-40aa-b5db-5bd698e90709" />

### QR-CODE TICKET
<img width="647" height="637" alt="WhatsApp Image 2026-07-16 at 12 51 57 PM" src="https://github.com/user-attachments/assets/805b1ea6-53d6-4c8e-a004-7983ed095c76" />



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

## 🚀 Getting Started

### 1. Docker Setup (Recommended)

This is the fastest way to get the backend, database, and all workers running with one command.

```bash
# Navigate to the root directory
cd ../../
docker compose up --build backend db redis
```

---

### 2. Manual Setup (Development)

If you need to run the backend standalone for development:

1. **Prerequisites:** Ensure you have PostgreSQL 16 and Redis 7 running locally.
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   ```bash
   cp .env.example .env  # Update your local DB_URL and REDIS_URL
   ```
4. **Initialization:**
   ```bash
   npm run setup         # Runs migrations, generates Prisma, and seeds DB
   ```
5. **Start Server:**
   ```bash
   npm run dev
   ```

---

## 🐳 Docker Containerization (Service Details)

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

### Interactive API Documentation (Swagger)
We provide comprehensive, interactive API documentation using **Swagger UI**. This tool automatically parses our route definitions to provide an up-to-date reference for the entire API.

- **Access Point:** [`/api-docs`](http://localhost:3000/api-docs) (replace `localhost:3000` with your server's host and port).
- **Key Features:**
    - **Explore Endpoints:** View all available routes grouped by module.
    - **Interactive Testing:** Execute API requests directly from your browser using the "Try it out" button.
    - **Schema Visualization:** Inspect detailed request body schemas, query parameters, and response structures.
    - **Auto-generated:** The documentation automatically syncs with our code-based API annotations.

### Endpoint Modules

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

  <p align="center">
    <img src="https://github.com/user-attachments/assets/8514fc87-19bc-4b87-8fd0-50090dac01a8" alt="Fa3liat Database Schema" width="100%">
  </p>


### Core Models
- **User** & **Organizer** (Hobbyist, Business, Company)
...

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
