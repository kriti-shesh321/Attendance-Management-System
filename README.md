# SkillBridge Attendance Management System

A role-based attendance management system prototype built for the SkillBridge Programme.

The system supports five user roles:

* Student
* Trainer
* Institution
* Programme Manager
* Monitoring Officer

Each role has different permissions and dashboard views with backend-enforced role validation.

---

# Live URLs

## Frontend

https://skillbridge-attendance-mgmt-system.netlify.app/

---

## Backend API

https://attendance-management-system-production-2bac.up.railway.app

### Health Check

https://attendance-management-system-production-2bac.up.railway.app/health

### Base API URL:

https://attendance-management-system-production-2bac.up.railway.app/api/v1

---

## API Documentation (Postman)

https://documenter.getpostman.com/view/17086606/2sBXqMJzfi

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Axios
* React Router DOM

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Zod Validation

## Database & Deployment

* PostgreSQL (Railway Hosted)
* Backend Deployment: Railway
* Frontend Deployment: Netlify

---

# Why I Chose This Stack

I used a stack I was already comfortable with so I could focus more on implementing the role-based flows, API design, validation, and deployment within the assignment timeline.

Although the assignment recommended Clerk authentication, I chose JWT-based authentication because I had significantly more experience with it and could move faster while still implementing proper backend role validation.

## Internal Planning Documents

* `docs/PROJECT-PLANS.md` - planning notes, schema drafts, and architectural decisions made during development

---

# Features Implemented

## Authentication

* User registration
* User login
* JWT authentication
* Backend role validation middleware
* Role-based route protection

---

## Student

* Login/Register
* Join batches using invite token
* View joined batches
* View active sessions
* Mark attendance

---

## Trainer

* Login/Register
* Create batches
* Generate invite tokens
* Create sessions
* View trainer sessions

---

## Institution

* Login/Register
* View institution batches
* View batch summaries

---

## Programme Manager

* View programme summaries
* View institution level summaries

---

## Monitoring Officer

* Read-only programme summary dashboard

---

# Role-Based Access

All protected backend endpoints validate:

* JWT token
* User authentication
* Allowed roles

Frontend role-based rendering is only for UX purposes. Actual access control is enforced server-side.

---

# Database Schema Decisions

Some important schema decisions:

* `users` table stores role information directly
* `institution_id` is nullable because Programme Managers and Monitoring Officers are not tied to a single institution
* `batch_students` is implemented as a join table
* attendance records use:
  * `session_id`
  * `student_id`
  * unique constraint on (`session_id`, `student_id`) to prevent duplicate attendance marking
* invite tokens are stored separately in `batch_invites`

Reference planning notes and schema drafts were documented during development before implementation. 

---

# API Design

REST API endpoints were designed first before implementation to make backend development more structured and predictable.

Main modules:

* Auth
* Institutions
* Batches
* Sessions
* Attendance
* Summary

Detailed API documentation:

* `/docs/API-DESIGN.md`
* Postman Collection
* Public Postman Documentation URL above

---

# Local Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/kriti-shesh321/Attendance-Management-System
```

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=8000
```
Refer to `.env.example`.

Run migrations:

```bash
npx prisma migrate dev
```

Seed database:

```bash
npx prisma db seed
```

Run backend:

```bash
npm run dev
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=<your-backend-url>
```
Refer to `.env.example`.

Run frontend:

```bash
npm run dev
```

---

# Seeded Test Accounts

Password for all seeded accounts:

```txt
qwertyuiop
```

---

## Student

```txt
student1@test.com
```

---

## Trainer

```txt
trainer1@test.com
```

---

## Institution

```txt
institution1@test.com
```

---

## Programme Manager

```txt
manager@test.com
```

---

## Monitoring Officer

```txt
monitor@test.com
```

---

# Sample Seeded Data

The seed script creates:

* 3 institutions
* 5 trainers
* 15 students
* batches
* sessions
* attendance records

Seed logic is available in:

```txt
backend/prisma/seed.ts
``` 

---

# Testing Notes

Suggested flow for testing:

1. Login as Trainer
2. Create Batch
3. Generate Invite Token
4. Login/Register as Student
5. Join Batch using Invite Token
6. View joined batches and sessions
7. Login as Institution / Programme Manager / Monitoring Officer to verify summary dashboards

---

# What Is Fully Working

## Backend

* Authentication
* JWT validation
* Role middleware
* Batch APIs
* Session APIs
* Attendance APIs
* Summary APIs
* Validation using Zod
* PostgreSQL persistence
* Prisma ORM integration
* Railway deployment

---

## Frontend

* Login/Register
* Role-based dashboard routing
* Student dashboard
* Trainer dashboard
* Institution dashboard
* Programme Manager dashboard
* Monitoring Officer dashboard
* Batch creation & invite token generation for Trainers
* Invite token joining flow for Students
* Backend API integration

---

# Known Limitations / Incomplete Areas

Due to the assignment time constraints, some tradeoffs were intentionally made.

## Current limitations

* Duplicate invite tokens can currently be generated for the same batch
* Trainer batch ownership flow can be improved further
* All Dashboard UI is minimal and not fully polished
* No global error middleware yet
* No pagination or advanced filtering
* UI was intentionally kept simple and functional over aesthetic 

---

# One Thing I Would Improve With More Time

I would redesign the batch ownership system more carefully.

Currently:

* both Trainers and Institutions can create batches
* but since batch trainer ownership is simplified for MVP scope, the institution created batches currently do not have a dedicated trainer assignment flow

With more time, I would:

* implement proper trainer assignment when an institution creates the batch
* support reusable vs one-time invite links
* improve invite management
* add cleaner dashboard state management
* add global error handling and logging

---

# AI Usage

AI tools such as ChatGPT and GitHub Copilot were used during development for:

* architecture discussion
* API design checks
* debugging TypeScript/Prisma issues
* frontend scaffolding
* code cleanup/refactoring
* deployment troubleshooting

---

# Folder Structure

```txt
/backend
/frontend
/docs
README.md
```

Important docs:

* `docs/API-DESIGN.md`
* `docs/postman-collection.json`

---

# Final Notes

This project was developed within the intended 2-3 day assignment scope mentioned in the brief. 

The primary focus was:

* functional role-based flows
* backend validation
* API structure
* deployment
* readable architecture

I avoided UI polish or enterprise-level abstractions.