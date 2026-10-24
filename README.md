# Aircraft Technical Records Management System

A full-stack portfolio project for aviation maintenance record management and due-date tracking. Built with **Angular 18**, **Spring Boot 3**, and **PostgreSQL**.

---

## Live Demo

> **Note:** The backend runs on Render's free tier and may take 30–60 seconds to wake from sleep on first load.

| Part | URL |
|---|---|
| Frontend | _(add your Netlify/Vercel URL here)_ |
| Backend API | _(add your Render URL here)_ |

Demo credentials:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@techrecords.dev` | `Password123!` |
| Engineer | `alice@techrecords.dev` | `Password123!` |
| Auditor | `auditor@techrecords.dev` | `Password123!` |

---

## Features

- **Due-date tracking** — calculates next-due inspections by flight hours, cycles, and calendar days; flags tasks as OK / Due Soon / Overdue
- **Fleet dashboard** — overview of all aircraft with overdue and due-soon counts
- **Aircraft management** — register, view, and update aircraft with full detail pages
- **Flight log** — log flights; automatically updates cumulative airframe hours and cycles
- **Maintenance records** — record completed tasks against task templates with certification data
- **Airworthiness Directives** — track AD compliance per aircraft
- **Document management** — upload and download maintenance documents
- **Audit log** — full trail of every write operation (admin/auditor access)
- **Role-based access** — Admin, Engineer, Auditor roles enforced on both frontend and backend
- **JWT authentication** — stateless token-based auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18, Angular Material, standalone components |
| Backend | Java 21, Spring Boot 3.3, Spring Security (JWT) |
| Database | PostgreSQL 16, Flyway migrations |
| Testing | JUnit 5, Mockito |
| Packaging | Docker, Docker Compose |

---

## Quick Start (Docker)

**Prerequisites:** Docker and Docker Compose installed.


```

- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- PostgreSQL: localhost:5432

The database is seeded automatically with sample aircraft, task templates, and maintenance records so the dashboard immediately shows meaningful data including some overdue items.

---

## Local Development

### Backend

```bash
# Requires Java 21 and Maven
cd backend
mvn spring-boot:run
```

Or with your own PostgreSQL instance:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/techrecords
export DB_USERNAME=techrecords
export DB_PASSWORD=techrecords
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start   # runs ng serve with proxy to localhost:8080
```

Open http://localhost:4200

---

## Running Tests

```bash
# Backend unit tests (includes DueCalculationService tests)
cd backend
mvn test
```

The `DueCalculationServiceTest` covers all due-date logic combinations:
- Hour-based limits (OK / Due Soon / Overdue)
- Calendar-based limits
- Cycle-based limits
- Compound limits ("whichever comes first")
- Edge cases: no prior record, exact boundary conditions

---

## Architecture

```
┌─────────────────────┐     JWT      ┌──────────────────────────┐
│   Angular Frontend  │ ──────────► │   Spring Boot Backend     │
│                     │             │                            │
│  - Auth             │   REST/JSON  │  - AuthController          │
│  - Dashboard        │ ◄────────── │  - AircraftController      │
│  - Aircraft detail  │             │  - MaintenanceController   │
│  - Maintenance      │             │  - DueCalculationService   │
│  - ADs              │             │  - AuditAspect (AOP)       │
│  - Documents        │             │                            │
└─────────────────────┘             └────────────┬───────────────┘
                                                 │ JPA / Flyway
                                    ┌────────────▼───────────────┐
                                    │       PostgreSQL            │
                                    │  - 10 tables               │
                                    │  - Seed data (V2)          │
                                    └────────────────────────────┘
```

### Due-Date Calculation Logic

```
nextDueHours  = lastHoursAtCompletion  + intervalHours
nextDueCycles = lastCyclesAtCompletion + intervalCycles
nextDueDate   = lastPerformedDate      + intervalDays
```

Status is evaluated against **whichever limit is reached first**:

| Status | Condition |
|---|---|
| **Overdue** | Any limit has already passed |
| **Due Soon** | Within 10% of the interval (or 30 days for calendar) |
| **OK** | All limits comfortably in the future |

---

## Database Schema

10 tables with Flyway-managed migrations:

`users` · `aircraft` · `components` · `flight_logs` · `task_templates` · `maintenance_records` · `airworthiness_directives` · `ad_compliance` · `documents` · `audit_log`

---

## Deployment

### Backend → Render (Free Tier)

1. Create a new **Web Service** on Render, connect your repo
2. Set build command: `cd backend && mvn package -DskipTests`
3. Set start command: `java -Xmx256m -jar backend/target/*.jar`
4. Add environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`
5. Use **Neon** or **Supabase** for the free PostgreSQL database

### Frontend → Netlify / Vercel

1. Set build command: `npm run build -- --configuration production`
2. Set publish directory: `dist/frontend/browser`
3. Add environment variable: set `apiUrl` in `environment.prod.ts` to your Render backend URL

---

## Aviation Terminology Used

- **TBO** — Time Between Overhaul
- **AD** — Airworthiness Directive
- **MRO** — Maintenance, Repair and Overhaul
- **C-Check** — Heavy maintenance inspection
- **Cycles** — Number of pressurisation cycles / landings
- **ICAO** — International Civil Aviation Organisation airport codes

---

## Future Enhancements

- OCR digitisation of scanned logbook pages (Tess4J)
- Full-text search across documents (PostgreSQL FTS)
- Compliance checker flagging missing documents and expired certificates
- Maintenance cost analytics using FAA/NTSB public data
