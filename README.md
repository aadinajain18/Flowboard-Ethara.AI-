# FlowBoard

Full-stack team task management platform with JWT authentication, role-based access control, Kanban boards, real-time analytics, natural language task entry, and a hand-crafted dual-theme engine — built end-to-end in strict TypeScript.

[![Live Demo](https://img.shields.io/badge/demo-live-black?style=flat-square&logo=railway)](https://pleasing-presence-production-a3af.up.railway.app/)
[![API](https://img.shields.io/badge/api-online-22c55e?style=flat-square)](https://flowboard-etharaai-production.up.railway.app/health)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

> **Try it now** — [pleasing-presence-production-a3af.up.railway.app](https://pleasing-presence-production-a3af.up.railway.app/)  
> Login: `admin@example.com` / `Admin123!`

---

## Table of Contents

- [Stack](#stack)
- [Features](#features)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)
- [License](#license)

---

## Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Client** | React 18 · Vite | SPA with HMR, code-splitting, tree-shaking |
| **Styling** | TailwindCSS · CSS Custom Properties | Utility-first CSS with tokenized theme variables |
| **Animation** | Framer Motion | Spring-physics layout transitions, gesture support |
| **Charts** | Recharts | Composable SVG chart components for analytics |
| **State** | Zustand | Lightweight, immutable global stores (auth, theme) |
| **Data Fetching** | TanStack React Query · Axios | Cached queries, optimistic updates, retry logic |
| **Forms** | React Hook Form · Zod | Performant uncontrolled forms with schema validation |
| **Drag & Drop** | dnd-kit | Accessible, keyboard-friendly sortable lists |
| **Server** | Node.js · Express | REST API with layered middleware architecture |
| **ORM** | Prisma | Type-safe database client with auto-generated types |
| **Database** | PostgreSQL | Relational data with foreign keys, cascading deletes |
| **Auth** | JWT · bcrypt | Stateless tokens, salted password hashing |
| **Validation** | Zod (shared) | Same schema library on both client and server |

---

## Features

### Core Functionality
- **Project Management** — Create, update, archive, and delete projects. Each project tracks members, tasks, activity history, and health metrics.
- **Task Lifecycle** — Full CRUD for tasks with status (`TODO` → `IN_PROGRESS` → `DONE`), four priority levels, due date tracking, assignee management, and subtask support.
- **Kanban Board** — Drag-and-drop interface using `dnd-kit`. Moving a card between columns persists the status change to the database immediately.
- **Member Management** — Invite users to projects with role assignment. Project admins can add/remove members; regular members have scoped permissions.
- **Task Filters** — Filter by status, priority, and assignee. Search across task titles. Filters compose together and persist during navigation.

### Analytics & Insights
- **Dashboard** — Four stat counters (total tasks, completed, overdue, completion rate), a status distribution donut chart, priority breakdown bar chart, team workload visualization, and a chronological activity feed.
- **Velocity Tracking** — Tasks completed per week over the last 12 weeks, rendered as a trend line.
- **Completion Heatmap** — 365-day contribution-style heatmap showing daily task completion patterns.
- **Burndown Charts** — Per-project burndown comparing actual remaining work against the ideal trajectory.

### Power User Features
- **Natural Language Parser** — The quick-add bar (`lib/nlParser.ts`) accepts sentences like `"Fix login bug tomorrow urgent"` and extracts the title, resolves relative dates to `Date` objects, and maps keywords to `TaskPriority` enum values. No external NLP library — built from scratch with regex-based heuristics.
- **Command Palette** — `⌘K` opens a global search overlay. Type to search across projects and tasks, then navigate instantly.
- **Keyboard Shortcuts** — `⌘K` for search, `Escape` to close modals, plus component-level shortcuts throughout.
- **Dynamic Browser Tab** — The `useDynamicTab` hook updates the browser tab title with unread notification count (e.g., `(3) FlowBoard`), similar to Gmail or Slack behavior.

### UX & Design
- **Dual Theme Engine** — Two palettes designed by hand: a warm Charcoal/Almond dark mode and a Plum/Oatmeal light mode. Driven entirely by CSS custom properties in `index.css`, with `localStorage` persistence and zero-flicker transitions.
- **Glassmorphism** — Sidebar and top bar use `backdrop-blur` with translucent backgrounds, letting the gradient mesh bleed through.
- **Audio Feedback** — `lib/sounds.ts` synthesizes micro-sounds using the Web Audio API (oscillator → gain envelope → destination). Task completion, modal open/close, and toggle interactions each have distinct audio profiles. Zero external audio files.
- **Animated Empty States** — When a project has no tasks or a filter returns no results, animated geometric shapes float using Framer Motion spring physics.
- **Onboarding Tour** — First-time users see a guided overlay highlighting the sidebar, command palette, and quick-add bar.
- **Notification Center** — Bell icon in the top bar with unread badge. Dropdown lists notifications with mark-as-read functionality.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Vite)                     │
│  React 18 · Zustand · React Query · Framer Motion        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Pages   │ │Components│ │  Hooks   │ │  Stores  │    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘    │
│       └─────────────┴────────────┴─────────────┘         │
│                         │ Axios                          │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTPS (JWT Bearer)
┌─────────────────────────┼────────────────────────────────┐
│                      Backend (Express)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Routes  │→│  Zod     │→│Controllers│→│ Services │    │
│  │          │ │ Validate │ │          │ │          │    │
│  └──────────┘ └──────────┘ └──────────┘ └────┬─────┘    │
│                                               │          │
│  ┌──────────┐ ┌──────────┐              ┌────┴─────┐    │
│  │  Auth    │ │  Error   │              │  Prisma  │    │
│  │Middleware│ │ Handler  │              │  Client  │    │
│  └──────────┘ └──────────┘              └────┬─────┘    │
└──────────────────────────────────────────────┼───────────┘
                                               │ TCP
                                        ┌──────┴──────┐
                                        │ PostgreSQL  │
                                        │  (Railway)  │
                                        └─────────────┘
```

**Request lifecycle:** Incoming HTTP → CORS/Helmet/Rate-limit → Route matcher → Zod schema validation → JWT auth middleware → Controller (extracts params, calls service) → Service (business logic, Prisma queries) → JSON response.

---

## Data Model

The database has 8 tables with full referential integrity:

| Model | Key Fields | Relations |
|---|---|---|
| **User** | `name`, `email`, `password`, `role` (ADMIN/MEMBER) | Owns projects, memberships, assigned tasks, notifications |
| **Project** | `name`, `description`, `color`, `status` | Has many tasks, members, activities |
| **ProjectMember** | `projectId`, `userId`, `role` | Join table with unique constraint on `[projectId, userId]` |
| **Task** | `title`, `status`, `priority`, `dueDate`, `position` | Belongs to project + assignee. Supports subtasks (self-referential) |
| **TaskLabel** | `name`, `color` | Belongs to task (tagging system) |
| **Comment** | `content`, `taskId`, `userId` | Threaded under tasks |
| **Activity** | `action`, `entityType`, `entityTitle`, `details` | Audit log for all mutations |
| **Notification** | `type`, `title`, `message`, `read` | Per-user, supports mark-as-read |

All IDs use `cuid()`. Cascading deletes are configured so removing a project cleans up all child records.

---

## Project Structure

```
flowboard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # 8 models, 5 enums, full relations
│   │   └── seed.ts                    # Generates 4 users, 3 projects, 21 tasks, activities, notifications
│   └── src/
│       ├── controllers/               # 6 controllers: auth, project, task, analytics, activity, notification
│       ├── services/                  # Business logic (decoupled from HTTP layer)
│       ├── middleware/
│       │   ├── auth.middleware.ts      # JWT verification, user injection
│       │   ├── validate.middleware.ts  # Generic Zod validator factory
│       │   ├── error.middleware.ts     # Centralized error handler with AppError class
│       │   └── logger.middleware.ts    # Request/response logging
│       ├── routes/                    # 6 route files, one per domain
│       ├── schemas/                   # Zod schemas for auth, project, task payloads
│       ├── utils/                     # JWT sign/verify, bcrypt helpers, AppError
│       ├── types/                     # AuthRequest generic interface
│       ├── prisma.ts                  # Singleton Prisma client
│       └── index.ts                   # Express app setup (CORS, Helmet, compression, rate-limit)
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/                  # LoginForm, SignupForm, AuthBranding, PasswordStrength
│       │   ├── dashboard/             # StatCards, Charts, ActivityFeed, RecentTasks, WorkloadChart
│       │   ├── layout/                # AppShell, Sidebar, TopBar, NotificationCenter, PageTransition
│       │   ├── projects/              # ProjectCard, ProjectForm, AddMemberModal
│       │   ├── tasks/                 # KanbanBoard, TaskDetailPanel, TaskFilters, TaskListView, QuickAddBar
│       │   ├── ui/                    # Modal, Avatar, Skeleton, EmptyState, CommandPalette, ThemeToggle, SpotlightCard
│       │   ├── analytics/             # Heatmap
│       │   └── onboarding/            # OnboardingTour
│       ├── hooks/                     # useDynamicTab, useKeyboardShortcuts
│       ├── lib/
│       │   ├── api.ts                 # Axios instance with interceptors
│       │   ├── nlParser.ts            # Natural language → structured task data
│       │   ├── sounds.ts              # Web Audio API synthesis engine
│       │   ├── schemas.ts             # Shared Zod validation schemas
│       │   └── dateUtils.ts           # Relative date resolution helpers
│       ├── pages/                     # Dashboard, Projects, ProjectDetail, Analytics, AuthPage
│       ├── store/                     # auth.ts (session), theme.ts (dark/light preference)
│       └── types/                     # Shared TypeScript interfaces
│
├── CONTRIBUTING.md                    # Contribution guidelines and coding standards
├── LICENSE                            # MIT
└── README.md
```

---

## Getting Started

**Prerequisites:** Node.js 18+, PostgreSQL 14+

### 1. Clone

```bash
git clone https://github.com/aadinajain18/Flowboard-Ethara.AI-.git
cd Flowboard-Ethara.AI-
```

### 2. Backend

```bash
cd backend
cp .env.example .env            # Set DATABASE_URL, JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed                     # Creates test users, projects, tasks
npm run dev                      # Express API → http://localhost:4000
```

### 3. Frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env            # Set VITE_API_URL=http://localhost:4000
npm install
npm run dev                      # Vite HMR → http://localhost:5173
```

### Test Accounts

Created automatically by the seeder:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin123!` |
| Member | `member@example.com` | `Member123!` |
| Member | `sam@example.com` | `Member123!` |
| Member | `casey@example.com` | `Member123!` |

---

## API Reference

Base URL: `https://flowboard-etharaai-production.up.railway.app`  
All protected routes require: `Authorization: Bearer <token>`  
Response format: `{ success: boolean, data?: T, message?: string }`

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | `{ name, email, password }` | Register new user, returns JWT |
| `POST` | `/api/auth/login` | `{ email, password }` | Authenticate, returns JWT + user object |
| `GET` | `/api/auth/me` | — | Get current user from token |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects for authenticated user |
| `POST` | `/api/projects` | Create project (name, description, color, icon) |
| `GET` | `/api/projects/:id` | Get project details with member list |
| `PATCH` | `/api/projects/:id` | Update project metadata |
| `DELETE` | `/api/projects/:id` | Delete project and all child records |
| `POST` | `/api/projects/:id/members` | Add member by email |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/:projectId/tasks` | List tasks (supports `?status=`, `?priority=`, `?assigneeId=`) |
| `POST` | `/api/projects/:projectId/tasks` | Create task (title, priority, dueDate, assigneeId) |
| `GET` | `/api/tasks/:id` | Get task with comments and labels |
| `PATCH` | `/api/tasks/:id` | Update any task field |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `PATCH` | `/api/tasks/:id/status` | Quick status update (used by Kanban drag-drop) |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/summary` | Dashboard aggregate (total, completed, overdue, per-project stats) |
| `GET` | `/api/analytics/heatmap` | 365-day completion heatmap data |
| `GET` | `/api/analytics/velocity` | Weekly velocity for last 12 weeks |
| `GET` | `/api/analytics/burndown/:projectId` | Daily burndown (actual vs ideal) |

### Activity & Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/activity/recent` | Recent activity across all projects |
| `GET` | `/api/projects/:projectId/activity` | Activity log for specific project |
| `GET` | `/api/notifications` | User's notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `PORT` | No | Server port (default: 4000) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | No | Allowed CORS origin (default: `http://localhost:5173`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL |

---

## Deployment

The application is deployed on [Railway](https://railway.app) with three services:

| Service | Type | URL |
|---|---|---|
| PostgreSQL | Database | Internal (private network) |
| Backend | Web Service | [flowboard-etharaai-production.up.railway.app](https://flowboard-etharaai-production.up.railway.app) |
| Frontend | Static Site | [pleasing-presence-production-a3af.up.railway.app](https://pleasing-presence-production-a3af.up.railway.app) |

The backend start script runs `prisma migrate deploy` before booting Express, so schema changes propagate automatically on each deploy. The frontend builds with `tsc && vite build` and serves the `dist/` directory with `serve -s`.

---

## Design Decisions

- **Why Zustand over Redux?** The app has two global concerns (auth session, theme preference). Zustand's minimal API handles this without boilerplate. React Query manages all server state separately.
- **Why Zod on both ends?** Sharing the same validation library ensures the frontend form validation and backend request validation stay in sync. A field rejected by the server will also be rejected by the form before submission.
- **Why CSS custom properties over Tailwind's dark mode?** Tailwind's `dark:` prefix requires duplicating every color utility. CSS variables let us swap the entire palette by toggling one class on `<html>`, and they work with non-Tailwind styles (Recharts, third-party components).
- **Why Web Audio API over audio files?** Loading `.mp3` files adds network requests and bundle size. The Web Audio API can synthesize pleasant tones in ~15 lines of code with zero latency and zero payload.
- **Why a custom NL parser?** External NLP libraries (compromise, chrono-node) add 200KB+ to the bundle. The quick-add bar only needs to handle a narrow input format, so a lightweight regex-based approach keeps the bundle lean.

---

## License

[MIT](LICENSE)
