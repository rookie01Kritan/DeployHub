# DeployHub — Build Progress

## Project Description
Enterprise collaborative learning and project management platform.
Built as a learning project following senior engineering mentorship format.
One phase at a time, full explanations, no skipping.

## Mentor Rules (paste these in every new conversation)
- Teach before coding, explain every decision
- One phase at a time, wait for "Continue" before moving forward
- Ask for test outputs to verify work before proceeding
- Never skip interview questions
- Build bottom-up: Repository → Service → Controller → Route
- Always explain WHY, not just HOW

## Tech Stack

### Backend (Complete)
- Runtime: Node.js v24.14.1
- Framework: Express.js v5.2.1
- Database: PostgreSQL 17.10 (local) + Neon (production)
- Database Driver: pg (node-postgres) — raw SQL, NO ORM
- Authentication: JWT (jsonwebtoken) + bcrypt
- Environment: dotenv
- Dev tool: nodemon

### Frontend (Not started)
- React + Vite
- React Router
- TanStack Query
- Tailwind CSS
- TypeScript (planned)

## Architecture
Strict layered architecture — nothing skips a layer:

HTTP Request
↓
Routes          — URL mapping only
↓
Controllers     — HTTP translation (req/res), zero business logic
↓
Services        — Business logic + authorization checks
↓
Repositories    — Raw SQL queries ONLY
↓
PostgreSQL

## Folder Structure

backend/
├── src/
│   ├── config/
│   │   └── db.js                    — pg connection pool (shared, single instance)
│   ├── database/
│   │   └── schema.sql               — complete schema, source of truth
│   ├── repositories/
│   │   ├── userRepository.js        — users table queries
│   │   ├── teamRepository.js        — teams table + transaction
│   │   ├── teamMemberRepository.js  — team_members table queries
│   │   ├── projectRepository.js     — projects table queries
│   │   ├── taskRepository.js        — tasks table + dynamic SQL
│   │   └── learningRepository.js    — modules + lessons queries
│   ├── services/
│   │   ├── authService.js           — register/login business logic
│   │   ├── teamService.js           — team business logic
│   │   ├── teamMemberService.js     — membership + role logic
│   │   ├── projectService.js        — project business logic
│   │   ├── taskService.js           — task business logic
│   │   └── learningService.js       — modules + lessons logic
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   ├── teamMemberController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── learningController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── teamRoutes.js            — includes nested teamMemberRoutes
│   │   ├── teamMemberRoutes.js      — mergeParams: true
│   │   ├── projectRoutes.js         — mergeParams: true
│   │   ├── taskRoutes.js            — mergeParams: true
│   │   └── learningRoutes.js        — mergeParams: true
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── teamValidator.js
│   │   ├── teamMemberValidator.js
│   │   ├── projectValidator.js
│   │   ├── taskValidator.js
│   │   └── learningValidator.js
│   ├── middlewares/
│   │   ├── authMiddleware.js        — JWT verification, sets req.userId
│   │   └── errorHandler.js         — centralized error handler (4 params)
│   ├── utils/
│   │   └── authorizationHelpers.js  — requireAdmin, requireMember, requireValidProject
│   └── index.js                     — entry point, Express app setup
├── .env                             — secrets (never committed)
├── .gitignore
├── package.json
└── PROGRESS.md                      — this file

## Database

### Connection
- Local: postgresql://postgres:[password]@localhost:5432/deployhub
- Password contains # (URL-encoded as %23 in DATABASE_URL)

### All 11 Tables
```sql
users              — accounts (id, name, email, password_hash, created_at)
teams              — groups (id, name, created_by→users, created_at)
team_members       — junction table (user_id→users, team_id→teams, role, joined_at)
                     composite PK: (user_id, team_id)
                     role CHECK: ('Admin', 'Member'), default 'Member'
projects           — work containers (id, team_id→teams RESTRICT, name, description)
tasks              — work items (id, project_id→projects RESTRICT, assignee_id→users SET NULL,
                     title, description, status, created_at)
                     status CHECK: ('todo', 'in_progress', 'done'), default 'todo'
learning_modules   — courses (id, team_id→teams RESTRICT, title, description, created_at)
lessons            — ordered content (id, module_id→modules CASCADE, title, content,
                     order_index, created_at)
quizzes            — one per module (id, module_id→modules CASCADE UNIQUE, title, created_at)
questions          — quiz questions (id, quiz_id→quizzes CASCADE, question_text,
                     order_index, created_at)
question_options   — multiple choice (id, question_id→questions CASCADE, option_text,
                     is_correct BOOLEAN, created_at)
quiz_attempts      — results (id, quiz_id, user_id, score INTEGER CHECK 0-100, completed_at)
```

### Key Schema Decisions
- CASCADE downward (child has no value without parent)
- RESTRICT upward (teams/projects/modules — force deliberate deletion)
- SET NULL for task assignee (task survives if user deleted)
- UNIQUE on quizzes.module_id (enforces one quiz per module)
- order_index for lessons and questions (explicit ordering)

## API Endpoints (All Implemented)

### Auth (public)

POST /api/auth/register    — { name, email, password } → { user, token }
POST /api/auth/login       — { email, password } → { user, token }

### Teams (all require JWT)

POST   /api/teams              — create team (auto-adds creator as Admin)
GET    /api/teams              — get all teams for logged-in user
GET    /api/teams/:id          — get one team (must be member)

### Team Members (all require JWT)

GET    /api/teams/:id/members            — get all members (any member)
POST   /api/teams/:id/members            — invite by email (Admin only)
PATCH  /api/teams/:id/members/:userId    — change role (Admin only)
DELETE /api/teams/:id/members/:userId    — remove member (Admin only)

### Projects (all require JWT)

POST   /api/teams/:teamId/projects                    — create (Admin only)
GET    /api/teams/:teamId/projects                    — list (any member)
GET    /api/teams/:teamId/projects/:projectId         — get one (any member)
PATCH  /api/teams/:teamId/projects/:projectId         — update (Admin only)
DELETE /api/teams/:teamId/projects/:projectId         — delete (Admin only)

### Tasks (all require JWT)

POST   /api/teams/:teamId/projects/:projectId/tasks             — create (any member)
GET    /api/teams/:teamId/projects/:projectId/tasks             — list (any member)
GET    /api/teams/:teamId/projects/:projectId/tasks/:taskId     — get one (any member)
PATCH  /api/teams/:teamId/projects/:projectId/tasks/:taskId     — update partial (any member)
DELETE /api/teams/:teamId/projects/:projectId/tasks/:taskId     — delete (any member)

### Learning Modules (all require JWT)

POST   /api/teams/:teamId/modules                              — create module (Admin)
GET    /api/teams/:teamId/modules                              — list modules (member)
GET    /api/teams/:teamId/modules/:moduleId                    — get with lessons (member)
PATCH  /api/teams/:teamId/modules/:moduleId                    — update (Admin)
DELETE /api/teams/:teamId/modules/:moduleId                    — delete (Admin)
POST   /api/teams/:teamId/modules/:moduleId/lessons            — add lesson (Admin)
PATCH  /api/teams/:teamId/modules/:moduleId/lessons/:lessonId  — update lesson (Admin)
DELETE /api/teams/:teamId/modules/:moduleId/lessons/:lessonId  — delete lesson (Admin)

## Key Patterns (memorize these)

### 1. Parameterized queries (SQL injection prevention)
```js
pool.query("SELECT * FROM users WHERE email = $1", [email])
```

### 2. Transaction pattern (atomic operations)
```js
const client = await pool.connect();
try {
  await client.query("BEGIN");
  // multiple queries
  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release();
}
```

### 3. Dynamic SQL (partial PATCH updates)
```js
const fields = [];
const values = [];
let paramCount = 1;
if (updates.title !== undefined) {
  fields.push(`title = $${paramCount++}`);
  values.push(updates.title);
}
values.push(id);
pool.query(`UPDATE table SET ${fields.join(", ")} WHERE id = $${paramCount}`, values);
```

### 4. Authorization check pattern (in service layer)
```js
const membership = await teamMemberRepository.getMember(requesterId, teamId);
if (!membership || membership.role !== "Admin") {
  throw { status: 403, message: "Only team Admins can perform this action." };
}
```

### 5. Cross-resource ownership check
```js
if (project.team_id !== teamId) {
  throw { status: 403, message: "Project does not belong to this team." };
}
```

### 6. Error throwing pattern (services throw, controllers catch)
```js
// Service throws:
throw { status: 400, message: "Validation failed." };

// Controller catches:
try {
  const result = await service.doSomething();
  res.status(200).json(result);
} catch (err) {
  next(err); // goes to errorHandler middleware
}
```

### 7. Ordered content management
```js
// Append to end:
const maxIndex = await repo.getMaxOrderIndex(moduleId); // COALESCE(MAX, -1)
targetIndex = maxIndex + 1;

// Insert at position:
await repo.shiftLessonsUp(moduleId, orderIndex); // UPDATE SET order_index + 1
targetIndex = orderIndex;

// After delete:
await repo.shiftLessonsDown(moduleId, deletedIndex); // UPDATE SET order_index - 1
```

## Security Decisions Made
- Password hashing: bcrypt, 12 salt rounds
- JWT expiry: 7 days (no refresh token yet — known gap)
- Same error message for wrong email AND wrong password (prevents user enumeration)
- req.userId set by middleware from verified JWT (never from req.body)
- Ownership checks in service layer, not controller
- Parameterized queries everywhere (no string interpolation in SQL)
- .env excluded from git from day one

## Known Gaps (to address in later phases)
- No refresh token / token revocation (logout doesn't invalidate server-side)
- No rate limiting on auth endpoints (brute force possible)
- No helmet middleware (missing security headers)
- No CORS restriction (open to all origins)
- schema.sql is destructive (wipes data on re-run) — needs proper migrations
- No pagination on list endpoints
- No tests (unit or integration)
- No Docker
- No CI/CD
- No monitoring/logging

## Test Credentials (local only)
- Kritan (Admin): kritan@example.com / securepassword123
- Sarah (Member): sarah@example.com / securepassword123

## Completed Phases
- [x] Phase 0: Requirements Analysis
- [x] Phase 1: Software Architecture
- [x] Phase 2: Development Environment
- [x] Phase 3: SQL Fundamentals
- [x] Phase 4: Database Design (ER Diagram)
- [x] Phase 5: Database Schema Implementation
- [x] Phase 6: Database Connection (pg pool)
- [x] Phase 7: Backend Architecture (Auth vertical slice)
- [x] Phase 8: API Testing (Thunder Client)
- [x] Phase 9: Authorization Middleware (JWT)
- [x] Phase 10: Teams API
- [x] Phase 11: Team Members API
- [x] Phase 12: Projects API
- [x] Phase 13: Tasks API
- [x] Phase 14: Auth Helpers Refactor + Learning Modules Schema
- [x] Phase 15: Learning Modules + Lessons API
- [x] Phase 16: Quizzes API
- [x]Phase 18: Frontend — Auth + Dashboard
- [x]Phase 19: Kanban Board UI (tasks, columns, status updates)
- [x]Phase 20: Frontend — Learning Modules + Quizzes
- [x]Phase 21: Docker
- [x]Phase 22: CI/CD (GitHub Actions)
## Current Phase
**Phase 23: Cloud Deployment** (not started)

## Remaining Phases
- [ ] Phase 23: Cloud Deployment
- [ ] Phase 24: Monitoring + Logging
- [ ] Phase 25: Testing (Unit + Integration)
- [ ] Phase 26: Performance + Security Hardening
- [ ] Phase 27: Final Code Review

## How to Start a New Conversation
Paste this exact text at the start of every new Claude conversation:

---
I am building DeployHub — an enterprise collaborative learning
and project management SaaS platform. I am learning under a
senior engineering mentorship format.

MENTOR RULES:
- Teach before coding, explain every decision and why
- One phase at a time, wait for "Continue" before moving on
- Always ask for test outputs before proceeding
- Never skip interview questions — they are mandatory
- Build bottom-up: Repository → Service → Controller → Route
- Never rush, never skip explanations

Here is my complete progress file:
[PASTE FULL PROGRESS.md CONTENTS HERE]

Please continue from [PHASE NUMBER]: [PHASE NAME].
Use the exact same teaching format, code patterns, and standards
established in previous phases.
---

