# ISPM System

**Information Security Policy Awareness and Management System**

A full-stack web application that helps organisations manage security policies, track compliance, deliver security awareness training, and monitor employee acknowledgements.

---

## Technology Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | React 19, Vite, Tailwind CSS v4, React Router |
| Backend    | Node.js, Express.js (ES Modules)  |
| Database   | MySQL                             |
| ORM        | Prisma                            |

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
    │   └── schema.prisma  # Prisma schema (MySQL)
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
- **MySQL** (local or remote)

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

### 4. Generate Prisma client

```bash
cd backend
npm run db:generate
```

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

## Available npm Scripts

### Frontend (`frontend/`)

| Script          | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start Vite dev server (port 5173) |
| `npm run build` | Production bundle                 |
| `npm run preview` | Preview production build        |

### Backend (`backend/`)

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start with nodemon (hot reload)      |
| `npm run start`     | Start without hot reload             |
| `npm run db:generate` | Generate Prisma client             |
| `npm run db:migrate` | Run database migrations             |
| `npm run db:studio`  | Open Prisma Studio (DB browser)     |

---

## User Roles (planned)

1. **System Administrator**
2. **Compliance Officer**
3. **Training Administrator**
4. **Employee**

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

> **Status**: Foundation only – no modules implemented yet.
