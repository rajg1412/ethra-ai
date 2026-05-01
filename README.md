# Ethra — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control (Admin / Member).

Built with **Next.js 16**, **React 19**, **Supabase** (PostgreSQL + Auth + RLS), and **TypeScript**.

---

## Assignment Checklist

| Requirement | Status | Details |
|---|---|---|
| User Signup / Login | ✅ | Supabase Auth, JWT sessions via SSR cookies |
| Project management | ✅ | Create, view, delete projects |
| Team management | ✅ | Invite by email, change roles, remove members |
| Task creation & assignment | ✅ | Title, description, priority, assignee, due date |
| Task status tracking | ✅ | Kanban board: To Do → In Progress → Done |
| Dashboard (stats + overdue) | ✅ | Projects count, total tasks, pending, overdue |
| REST APIs | ✅ | Full REST layer under `/api/*` |
| Database (SQL) | ✅ | PostgreSQL via Supabase |
| Proper validations | ✅ | Zod schemas on all inputs (API + server actions) |
| Relationships | ✅ | FK constraints, cascades, unique constraints |
| Role-based access control | ✅ | Global admin, project admin, project member |
| Admin creation via script | ✅ | `scripts/seed-admin.ts` |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (email + password, SSR cookie sessions)
- **Validation:** Zod
- **UI:** Tailwind CSS v4, shadcn/ui, Framer Motion
- **Language:** TypeScript

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                   # Login & Signup pages + actions
│   ├── (dashboard)/              # All authenticated pages
│   │   ├── dashboard/            # Stats overview
│   │   ├── projects/             # Projects list + detail (Kanban)
│   │   ├── tasks/                # Task board across all projects
│   │   ├── team/                 # Member management
│   │   ├── admin/users/          # Global admin console
│   │   ├── error.tsx             # Error boundary
│   │   └── loading.tsx           # Loading skeleton
│   └── api/                      # REST API routes
│       ├── projects/             # GET, POST /api/projects
│       ├── projects/[id]/        # GET, DELETE /api/projects/:id
│       ├── tasks/                # GET, POST /api/tasks
│       ├── tasks/[id]/           # PATCH, DELETE /api/tasks/:id
│       ├── team/                 # GET, POST /api/team
│       └── team/[memberId]/      # PATCH, DELETE /api/team/:memberId
├── lib/
│   ├── rbac.ts                   # Auth context + role resolution
│   ├── schemas.ts                # Zod validation schemas
│   └── services/                 # Business logic (server-only)
│       ├── project.service.ts
│       ├── task.service.ts
│       ├── team.service.ts
│       ├── dashboard.service.ts
│       └── user.service.ts
├── components/                   # UI components (Kanban, modals, sidebar)
├── types/                        # TypeScript type definitions
├── utils/supabase/               # Supabase client (server, client, middleware)
└── middleware.ts                 # Session refresh on every request
supabase/
└── schema.sql                    # Full DB schema with RLS policies + triggers
scripts/
└── seed-admin.ts                 # Admin user creation script
```

---

## REST API Reference

All endpoints require authentication via session cookie. Responses follow `{ data }` on success and `{ error: string }` on failure.

### Projects

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/projects` | Any member | List all accessible projects |
| POST | `/api/projects` | Authenticated | Create a new project |
| GET | `/api/projects/:id` | Project member | Get single project |
| DELETE | `/api/projects/:id` | Project admin | Delete project |

### Tasks

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/tasks` | Authenticated | List tasks (optional `?projectId=`) |
| POST | `/api/tasks` | Project admin | Create a task |
| PATCH | `/api/tasks/:id` | Member (status only) / Admin (full) | Update task |
| DELETE | `/api/tasks/:id` | Project admin | Delete task |

### Team

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/team?projectId=` | Project member | List project members |
| POST | `/api/team` | Project admin | Invite a member by email |
| PATCH | `/api/team/:memberId` | Project admin | Change member role |
| DELETE | `/api/team/:memberId?projectId=` | Project admin | Remove member |

---

## Role-Based Access Control

### Global Roles

| Role | Description |
|---|---|
| **Global Admin** | Full access to all projects, all tasks, and the admin console at `/admin/users` |
| **Regular User** | Access only to projects they own or are a member of |

### Project-Level Roles

| Role | Can view | Can create/delete tasks | Can manage members | Can delete project |
|---|---|---|---|---|
| **Owner** | ✅ | ✅ | ✅ | ✅ |
| **Project Admin** | ✅ | ✅ | ✅ | ❌ |
| **Member** | ✅ | ❌ | ❌ | ❌ |

Members can update the **status** of tasks assigned to them. They cannot change any other task fields.

### Security Architecture

RBAC is enforced at **two independent layers**:

1. **Server layer** — `src/lib/rbac.ts` verifies user identity and role on every server action and API route before any DB operation.
2. **Database layer** — Row Level Security (RLS) policies in Supabase enforce the same rules at the SQL level. A trigger (`guard_task_updates`) additionally prevents members from updating task fields beyond status, even if the app layer is bypassed.

---

## Database Schema

```
profiles          — one per user, linked to auth.users
projects          — owned by a profile
project_members   — join table: profile ↔ project, with role (admin/member)
tasks             — belong to a project, optionally assigned to a member
```

**ENUMs:** `project_role` (admin, member) · `task_status` (todo, in_progress, completed) · `task_priority` (low, medium, high)

**Triggers:**
- `on_auth_user_created` — auto-creates a profile row when a user signs up
- `guard_task_updates` — enforces that members can only change `status` on tasks assigned to them

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/rajg1412/ethra-ai.git
cd ethra-ai
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run the schema:

```bash
# In your Supabase project → SQL Editor, paste and run:
supabase/schema.sql
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SECRET_KEY=your_supabase_service_role_key
```

> ⚠️ `NEXT_PUBLIC_SUPABASE_SECRET_KEY` is the **service role key** (not the anon key). It is only used by the admin seed script and never exposed to the browser.

### 4. Create the admin user

The admin account is created via a script using the Supabase service role key. This bypasses email confirmation and sets `is_admin = true` directly on the profile.

```bash
npx tsx scripts/seed-admin.ts
```

This creates (or finds if already existing):

```
Email:    admin@gmail.com
Password: 12345678
Role:     Global Admin
```

The script:
1. Creates the user in Supabase Auth (or finds them if already registered)
2. Waits for the `on_auth_user_created` trigger to auto-create their profile
3. Sets `is_admin = true` on the profile row

You can then log in at `/login` with these credentials and access the Admin Console at `/admin/users`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Features

### Dashboard
- Live counts: active projects, total tasks, pending tasks, overdue tasks
- Recent tasks list with status badges
- Active projects with real completion percentage (completed tasks / total tasks)

### Projects
- Create projects (any authenticated user)
- View only projects you own or are a member of (enforced by RLS)
- Kanban board per project (To Do / In Progress / Done columns)
- Optimistic UI updates on task drag / status change

### Tasks
- Create tasks with title, description, priority, assignee, due date
- Only project admins can create / delete tasks
- Members can update the status of tasks assigned to them
- Global task board showing all tasks across projects

### Team Management
- Invite members by email (must be a registered user)
- Change member roles (admin ↔ member)
- Remove members
- Protection: cannot remove the last admin, cannot remove the project owner

### Admin Console (`/admin/users`)
- View all registered users
- See global admin status per user
- Accessible only to users with `is_admin = true`

---

## Validation

All inputs are validated with **Zod** before any DB operation:

| Schema | Used in |
|---|---|
| `createProjectSchema` | POST `/api/projects` + createProject action |
| `createTaskSchema` | POST `/api/tasks` + createTask action |
| `updateTaskSchema` | PATCH `/api/tasks/:id` |
| `inviteMemberSchema` | POST `/api/team` + inviteMember action |
| `updateMemberRoleSchema` | PATCH `/api/team/:memberId` + updateMemberRole action |

Invalid requests return HTTP 400 with a human-readable error message listing which fields failed and why.

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```