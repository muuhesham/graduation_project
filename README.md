# Fa3liat — Online Ticketing & Event Management Web Application

**Fa3liat** is a web application platform for creating events, managing general-admission tickets.

---
## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** React.js
- **Database:** PostgreSQL, Prisma ORM
- **Caching:** Redis
- **Authentication:** JWT
---

## Project Structure
```plaintext
.
├── src/
│   ├── app.js             # Main Express app setup
│   ├── server.js          # Server entery point
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── validations/       # Request validations
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   └── config/            # Configuration files 
├── prisma/                # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── .env                   # Environment variables
├── .env.example           # Example env template
├── package.json
├── package-lock.json
└── README.md
```
---

## Installation & Running the Project

### Prerequisites
- Node.js
- PostgreSQL
- Redis (for caching)
- Mail service (for OTP / notifications)


### Steps

1. Clone the repository:
   
```bash
git clone https://github.com/muuhesham/graduation_project
cd fa3liat
```
2. Install dependencies:

```bash
npm install
```
3. Setup environment variables: Copy `.env.example` to `.env` and fill in your values:

```bash
# EXAMPLE
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/fa3liat
JWT_SECRET=add-your-secret-key
```
4. Run database migrations:

```bash
npx prisma migrate dev
```
5. Generate prisma client:

```bash
npx prisma generate
```
6. Start the server:
   
```bash
npm run dev
# SERVER RUN ON: http://localhost:3000
```

---

## Environment Variables Table
```plaintext
| Variable       | Description                             |
|----------------|-----------------------------------------|
| PORT           | Server port                             |
| DATABASE_URL   | PostgreSQL connection string            |
| JWT_SECRET     | Secret key for JWT authentication       |
| REDIS_URL      | Redis server URL                        |
| MAIL_HOST      | SMTP host for sending emails            |
| MAIL_PORT      | SMTP port                               |
| MAIL_USER      | SMTP username                           |
| MAIL_PASS      | SMTP password                           |
| FRONTEND_URL   | Frontend base URL                       |
```

---

## API Documentation
[![Postman Collection](https://img.shields.io/badge/Postman-API-blue?logo=postman)](https://crimson-desert-397910.postman.co/workspace/e3ee1eae-0259-47fe-a53f-ff735b573084)

---

## How to Contribute
- Fork the repository
- Create a new branch: `feature/your-feature`
- Make your changes
- Submit a Pull Request
- Wait for your feature review - you may receive feedback via email

---
## [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) License 

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
