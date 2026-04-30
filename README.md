# Fa3liat — Online Ticketing & Event Management Web Application

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
</p>

**Fa3liat** is a comprehensive web application platform for creating events, managing tickets, and handling online payments. The platform supports both general-admission and seat-based events with multiple ticket tiers.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

Fa3liat is an event management and ticketing platform built with modern web technologies. It enables organizers to create events, sell tickets online, manage venues, and handle payments through integrated payment gateways. The platform supports:

- 🎫 **General Admission Tickets** - Standard ticketed events
- 💺 **Seat-Based Events** - Events with assigned seating
- 👤 **User Authentication** - Email, phone, and social login
- 📱 **QR Code Tickets** - Mobile ticket validation
- 💳 **Payment Integration** - Stripe payment processing
- 📧 **Email Notifications** - OTP and event notifications
- 📅 **Event Sessions** - Multiple sessions per event
- 🎟️ **Ticket Types** - Multiple ticket tiers with pricing
- 📍 **Venue Management** - Location and seating maps
- 🔖 **Coupon System** - Discount codes for events

---

## 🛠 Tech Stack

| Category           | Technology        |
| ------------------ | ----------------- |
| **Runtime**        | Node.js           |
| **Framework**      | Express.js        |
| **Database**       | PostgreSQL        |
| **ORM**            | Prisma            |
| **Caching**        | Redis             |
| **Authentication** | JWT               |
| **Queue**          | BullMQ            |
| **Payments**       | Stripe            |
| **SMS**            | Twilio            |
| **Email**          | Nodemailer        |
| **AI/ML**          | LangChain, OpenAI |

---

## ✨ Features

### Authentication & Authorization

- Email/password authentication
- Phone number verification (OTP)
- Social login (Google, Facebook, Apple)
- JWT-based session management
- Role-based access control (User, Organizer, Admin)

### Event Management

- Create and manage events
- Event categories and tags
- Multiple event sessions
- Event rules and policies
- Banner and media uploads

### Ticketing System

- Multiple ticket types per event
- General admission tickets
- Seat-based ticketing with tier pricing
- QR code generation for tickets
- Ticket validation and check-in

### Payment Processing

- Stripe integration
- Secure payment processing
- Refund handling
- Payout management for organizers

### Venue Management

- Create and manage venues
- Seat map configuration
- State/City/Country location hierarchy

### Additional Features

- Newsletter subscription
- User wallet system
- Interested events tracking
- Coupon/discount codes
- Rate limiting and security

---

## 📂 Project Structure

```
fa3liat/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.js                # Database seeder
│   └── factories/             # Test data factories
│       ├── category.factory.js
│       ├── city.factory.js
│       ├── country.factory.js
│       ├── event.factory.js
│       ├── organizer.factory.js
│       ├── state.factory.js
│       ├── tag.factory.js
│       ├── user.factory.js
│       └── venue.factory.js
├── migrations/                 # Database migrations
├── scripts/
│   ├── setup.js               # Project setup script
│   ├── generate.js            # Prisma client generation
│   ├── migrate.js             # Database migration
│   └── seed.js                # Seed database
├── data/
│   └── governorates.json     # Egypt governorates data
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── resources.js           # API resources loader
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── routes/                # API routes
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── event.routes.js
│   │   ├── home.routes.js
│   │   ├── location.routes.js
│   │   ├── newsletter.routes.js
│   │   ├── onboarding.routes.js
│   │   ├── order.routes.js
│   │   ├── organizer.routes.js
│   │   ├── organizerDashboard.routes.js
│   │   ├── payment.routes.js
│   │   ├── profile.routes.js
│   │   ├── search.routes.js
│   │   ├── ticket.routes.js
│   │   └── user.routes.js
│   ├── middlewares/           # Custom middlewares
│   ├── validations/           # Request validations
│   ├── services/              # Business logic
│   ├── repositories/          # Data access layer
│   ├── models/                # Additional models
│   ├── helpers/               # Helper functions
│   ├── utils/                 # Utility functions
│   ├── queues/                # Queue configurations
│   ├── workers/               # Background workers
│   │   ├── mailWorker.js
│   │   ├── smsWorker.js
│   │   └── embeddingWorker.js
│   ├── mails/                 # Email templates
│   ├── policies/              # Authorization policies
│   ├── types/                 # Type definitions
│   └── errors/                # Custom error classes
├── package.json
├── .env.example
└── README.md
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/api/auth/register`   | Register new user    |
| POST   | `/api/auth/login`      | User login           |
| POST   | `/api/auth/otp/send`   | Send OTP to email    |
| POST   | `/api/auth/otp/verify` | Verify OTP           |
| POST   | `/api/auth/refresh`    | Refresh access token |
| POST   | `/api/auth/logout`     | Logout user          |

### Users

| Method | Endpoint        | Description      |
| ------ | --------------- | ---------------- |
| GET    | `/api/users/me` | Get current user |
| PUT    | `/api/users/me` | Update profile   |
| DELETE | `/api/users/me` | Delete account   |

### Events

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/events`       | List events       |
| GET    | `/api/events/:slug` | Get event details |
| POST   | `/api/events`       | Create event      |
| PUT    | `/api/events/:id`   | Update event      |
| DELETE | `/api/events/:id`   | Delete event      |

### Tickets

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | `/api/tickets`          | List user tickets  |
| GET    | `/api/tickets/:id`      | Get ticket details |
| POST   | `/api/tickets/validate` | Validate QR code   |

### Orders

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| POST   | `/api/orders`     | Create order     |
| GET    | `/api/orders`     | List user orders |
| GET    | `/api/orders/:id` | Order details    |

### Organizers

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/api/organizers/register` | Register as organizer |
| GET    | `/api/organizers/profile`  | Get organizer profile |
| PUT    | `/api/organizers/profile`  | Update organizer      |

### Venues

| Method | Endpoint          | Description   |
| ------ | ----------------- | ------------- |
| GET    | `/api/venues`     | List venues   |
| POST   | `/api/venues`     | Create venue  |
| GET    | `/api/venues/:id` | Venue details |

### Categories

| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| GET    | `/api/categories`            | List categories    |
| GET    | `/api/categories/:id/events` | Events by category |

### Search

| Method | Endpoint                 | Description       |
| ------ | ------------------------ | ----------------- |
| GET    | `/api/search/events`     | Search events     |
| GET    | `/api/search/organizers` | Search organizers |

### Location

| Method | Endpoint                          | Description       |
| ------ | --------------------------------- | ----------------- |
| GET    | `/api/location/countries`         | List countries    |
| GET    | `/api/location/states/:countryId` | States by country |
| GET    | `/api/location/cities/:stateId`   | Cities by state   |

---

## 🗄 Database Schema

### Core Models

- **User** - User accounts with authentication
- **Organizer** - Event organizer profiles
- **Event** - Event listings
- **Venue** - Event venues
- **Category** - Event categories
- **Ticket** - Purchased tickets
- **Order** - Order records
- **TicketType** - Ticket type definitions

### Authentication Models

- **Otp** - Email OTP codes
- **PhoneOtp** - Phone OTP codes
- **RefreshToken** - JWT refresh tokens
- **ResetPasswordToken** - Password reset tokens

### Supporting Models

- **Governorate** - Egypt governorates
- **NewsletterSubscriber** - Newsletter emails
- **InterestedEvent** - User interests
- **EventTag** - Event tags
- **EventRule** - Event policies
- **Coupon** - Discount codes
- **EventSeatTier** - Seat pricing tiers
- **EventSeat** - Individual seats

---

## 🚀 Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis

### Steps

1. **Clone the repository**

    ```bash
    git clone https://github.com/muuhesham/graduation_project.git
    cd graduation_project
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure environment variables**

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. **Setup database**

    ```bash
    npm run prisma:migrate
    npm run prisma:generate
    ```

5. **Seed database (optional)**

    ```bash
    npm run prisma:seed
    ```

6. **Start the server**
    ```bash
    npm run dev
    ```

---

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fa3liat"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mail
MAIL_HOST="smtp.example.com"
MAIL_PORT=587
MAIL_USER="user@example.com"
MAIL_PASSWORD="password"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
FACEBOOK_APP_ID="your-app-id"
FACEBOOK_APP_SECRET="your-app-secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# App
NODE_ENV="development"
PORT=8000
```

---

## 📜 Available Scripts

| Script                      | Description              |
| --------------------------- | ------------------------ |
| `npm run setup`             | Run full project setup   |
| `npm run dev`               | Start development server |
| `npm run start`             | Start production server  |
| `npm run prisma:generate`   | Generate Prisma client   |
| `npm run prisma:migrate`    | Run database migrations  |
| `npm run prisma:seed`       | Seed database            |
| `npm run queue:mail-worker` | Start mail worker        |
| `npm run queue:sms-worker`  | Start SMS worker         |
| `npm run test`              | Run tests                |

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

---

<p align="center">Built with ❤️ by the Fa3liat Team</p>
