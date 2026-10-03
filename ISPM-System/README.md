# ISPM System

**Information Security Policy Awareness and Management System**

A full-stack web application that helps organisations manage security policies, track compliance, deliver security awareness training, and monitor employee acknowledgements.

---

## Technology Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 19, Vite, Tailwind CSS v4, React Router           |
| Backend    | Node.js, Express.js (ES Modules)                        |
| Database   | MySQL                                                   |
| ORM        | Prisma 5.22.0 / @prisma/client 5.22.0                   |

---

## Project Structure

```
ISPM-System/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── assets/        # Static assets (images, icons)
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layout wrappers
│   │   ├── pages/         # Route-level page components
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility/helper functions
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/           # Node.js + Express API
    ├── prisma/
    │   ├── schema.prisma  # Prisma schema (MySQL)
    │   └── seed.js        # Development seed script
    ├── src/
    │   ├── config/        # Environment & Prisma client
    │   ├── controllers/   # Request handler logic
    │   ├── middleware/     # Express middleware (auth, errors)
    │   ├── routes/        # API route definitions
    │   ├── services/      # Business logic layer
    │   └── utils/         # Utility helpers
    ├── .env.example       # Environment variable template
    └── package.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MySQL** (local or remote, version 8+)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ISPM-System
```

### 2. Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your MySQL connection string and JWT secret:

```env
DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/ispm_db
JWT_SECRET=your_long_random_secret
```

> **DATABASE_URL format:** `mysql://<user>:<password>@<host>:<port>/<database>`
>
> Example for a local root user with no password:
> `DATABASE_URL=mysql://root:@localhost:3306/ispm_db`

### 3. Install dependencies

**Frontend:**

```bash
cd frontend
npm install
```

**Backend:**

```bash
cd backend
npm install
```

---

## Database Setup

### Step 1 – Generate the Prisma Client

This must be run after any schema change and after a fresh `npm install`:

```bash
cd backend
npm run db:generate
```

### Step 2 – Create the database in MySQL

Connect to MySQL and create the target database:

```sql
CREATE DATABASE IF NOT EXISTS ispm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3 – Run the initial migration

This creates all tables, indexes, and constraints from the Prisma schema:

```bash
cd backend
npm run db:migrate
```

> Prisma will prompt you for a migration name on first run. Use something like `init`.

### Step 4 – Seed development data

Populates the database with one user per system role:

```bash
cd backend
npm run db:seed
```

> The seed uses `upsert` — it is safe to run multiple times without creating duplicates.

---

## Development Seed Accounts

> ⚠️ **These accounts are for local development only. Never use them in production.**

| Role               | Email                    | Development Password |
| ------------------ | ------------------------ | -------------------- |
| SYSTEM_ADMIN       | admin@ispm.local         | `Ispm@Dev2024!`      |
| COMPLIANCE_OFFICER | compliance@ispm.local    | `Ispm@Dev2024!`      |
| TRAINING_ADMIN     | training@ispm.local      | `Ispm@Dev2024!`      |
| EMPLOYEE           | employee@ispm.local      | `Ispm@Dev2024!`      |

Passwords are stored as **bcrypt hashes** (12 rounds) — plain-text passwords are never stored.

---

## Database Schema Overview

The schema covers 8 system areas:

| Area             | Models                                                         |
| ---------------- | -------------------------------------------------------------- |
| Users            | `User`                                                         |
| Policies         | `Policy`, `PolicyVersion`, `PolicyAcknowledgement`             |
| Training         | `TrainingModule`, `TrainingProgress`                           |
| Quizzes          | `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, `QuizAnswer` |
| Helpdesk         | `HelpdeskTicket`, `TicketResponse`                             |
| Notifications    | `Notification`                                                 |
| Audit Logs       | `AuditLog`                                                     |
| Compliance       | _Derived from acknowledgements, training progress, quiz results_ |

### Enums

| Enum              | Values                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| `Role`            | `SYSTEM_ADMIN`, `COMPLIANCE_OFFICER`, `TRAINING_ADMIN`, `EMPLOYEE`               |
| `PolicyStatus`    | `DRAFT`, `PUBLISHED`, `ARCHIVED`                                                 |
| `TrainingStatus`  | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`                             |
| `TicketStatus`    | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`                                      |
| `TicketPriority`  | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`                                              |
| `NotificationType`| `POLICY_PUBLISHED`, `POLICY_ACKNOWLEDGEMENT_DUE`, `TRAINING_ASSIGNED`, `TRAINING_DUE`, `QUIZ_PASSED`, `QUIZ_FAILED`, `TICKET_UPDATE`, `SYSTEM` |

---

## Available npm Scripts

### Frontend (`frontend/`)

| Script            | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start Vite dev server (port 5173) |
| `npm run build`   | Production bundle                 |
| `npm run preview` | Preview production build          |

### Backend (`backend/`)

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start with nodemon (hot reload)      |
| `npm run start`     | Start without hot reload             |
| `npm run db:generate` | Generate Prisma client             |
| `npm run db:migrate` | Run database migrations             |
| `npm run db:seed`   | Seed development data               |
| `npm run db:studio` | Open Prisma Studio (DB browser)     |

### 5. Start the development servers

**Backend** (runs on port 5001):

```bash
cd backend
npm run dev
```

**Frontend** (runs on port 5173):

```bash
cd frontend
npm run dev
```

---

## API Endpoints

| Method | Endpoint     | Description             |
| ------ | ------------ | ----------------------- |
| GET    | /api/health  | API health check        |

### Health check response

```json
{
  "success": true,
  "message": "ISPM API is running"
}
```

> API base URL (development): `http://localhost:5001/api`

---

## User Roles

| Role               | Responsibilities                                          |
| ------------------ | --------------------------------------------------------- |
| SYSTEM_ADMIN       | Full system access, user management, audit log review     |
| COMPLIANCE_OFFICER | Policy management, compliance reporting                   |
| TRAINING_ADMIN     | Training module & quiz management                         |
| EMPLOYEE           | View policies, acknowledge policies, complete training    |

## Planned Modules

- Authentication & Authorization
- User Management
- Policy Management & Acknowledgement
- Security Awareness & Training
- Quiz & Assessment
- Compliance Tracking & Reporting
- Helpdesk / Security Queries
- Notifications
- Activity Logs / Audit Trail
- Role-specific Dashboards

---

> **Status**: Database schema complete. Authentication and module implementation pending.

