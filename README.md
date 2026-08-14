# TaskFlow

A lightweight full-stack task board built as a take-home assignment.

## Features

- Board with columns and tasks
- Create task
- Edit task
- Delete task
- Priority labeling
- Priority filtering
- Move task with dropdown
- Native drag-and-drop
- Board name editing
- Real SQLite persistence
- Data validation
- Error handling
- Responsive UI

## Tech Stack

- React
- Vite
- JavaScript
- Node.js
- Express
- SQLite
- better-sqlite3
- Zod
- Node native test runner

## Architecture

The application is structured as a monorepo with explicit separation of concerns.

```text
client/
  src/
    api/
    components/
    hooks/
    styles/

server/
  src/
    db/
    repositories/
    services/
    routes/
  tests/
```

**Data Flow:**
React UI → API layer → Express routes → Services → Repositories → SQLite

## Database

The relational schema maps natively to the domain:
- `boards` (id, name)
- `columns` (id, board_id, name)
- `tasks` (id, column_id, title, description, priority, created_at)

Integrity is enforced via primary keys, strict foreign key constraints, priority enumerations (`low`, `medium`, `high`), and cascading deletes where applicable.

### Notable SQL Queries

**Task Count per Column**
```sql
SELECT
  columns.id AS columnId,
  columns.name AS columnName,
  COUNT(tasks.id) AS taskCount
FROM columns
LEFT JOIN tasks ON tasks.column_id = columns.id
WHERE columns.board_id = ?
GROUP BY columns.id, columns.name
ORDER BY columns.id
```

**Priority-Filtered Tasks (Newest First)**
```sql
SELECT
  tasks.id,
  tasks.column_id AS columnId,
  tasks.title,
  tasks.description,
  tasks.priority,
  tasks.created_at AS createdAt
FROM tasks
INNER JOIN columns ON columns.id = tasks.column_id
WHERE columns.board_id = ? AND tasks.priority = ?
ORDER BY tasks.created_at DESC, tasks.id DESC
```

## API

The application defines a strict JSON REST API with comprehensive validation.

- `GET /api/boards/:boardId` - Retrieve board, columns, and tasks
- `GET /api/boards/:boardId/tasks?priority=...` - Retrieve filtered tasks
- `POST /api/boards/:boardId/tasks` - Create a new task in a specific column
- `PATCH /api/boards/:boardId` - Rename a board
- `PATCH /api/tasks/:taskId` - Update task title, description, or priority
- `PATCH /api/tasks/:taskId/move` - Move a task to a different column
- `DELETE /api/tasks/:taskId` - Delete a task

## Validation & Error Handling

- **Strict Validation:** Handled by Zod. Task titles and board names cannot be empty or whitespace-only.
- **Controlled Error States:** Invalid payloads return `400 Bad Request`. Non-existent records return `404 Not Found`. Unexpected failures return `500 Internal Server Error`.
- **UI Resilience:** Failed mutations trigger visible user feedback without crashing or desynchronizing the React interface.

## Testing

Backend testability is achieved by injecting isolated in-memory SQLite databases into the repository layer.

- **Server:** 13/13 unit and integration tests passing via the native Node.js test runner.
- **Client:** ESLint passes cleanly, and production Vite compilation succeeds.

## Running Locally

**Prerequisites:** Node.js 20+ recommended

1. **Clone, Install, and Seed**
   ```bash
   git clone <repository>
   cd taskflow
   npm ci --prefix server
   npm ci --prefix client

   cd server
   node src/db/seed.js
   ```
   The seed script creates the deterministic initial board, columns, and tasks.

2. **Run Tests**
   ```bash
   cd server
   npm test
   cd ../client
   npm run lint
   ```

3. **Development Mode**
   Start the backend and frontend separately:
   ```bash
   # Terminal 1:
   cd server
   npm start

   # Terminal 2:
   cd client
   npm run dev
   ```

4. **Production Mode (Single Server)**
   Build the frontend, then start the Express server which will host the API and UI concurrently.
   ```bash
   cd client
   npm run build

   cd ../server
   npm start
   ```
   Then open `http://localhost:3000/`.

## Engineering Decisions

- **SQLite Backend:** Explicitly chosen because the assignment permits it. SQLite requires no separately managed database server, which keeps local setup simple.
- **Raw SQL:** Maintained directly in the repository layer for clarity and performance rather than obscuring logic behind a heavy ORM.
- **Stretch Goal Implementation:** Native HTML5 drag-and-drop was selected as the sole stretch goal.
- **Accessibility Fallback:** The `<select>` dropdown movement is retained alongside drag-and-drop as a robust, fully accessible fallback interaction.
- **Production Serving:** The Vite proxy is utilized exclusively for local development. For production, the Express backend serves both the JSON API and the compiled React SPA directly via statically mapped directories.

## Assumptions / Trade-offs

- **Single Default Board:** Authentication and multi-tenant board switching are excluded to adhere strictly to the assignment scope. The app defaults to operating on Board `1`.
- **Deployment Pending:** The application is architecturally ready for PaaS platforms, utilizing standard `process.env.PORT` conventions, but is not currently deployed.

## What I Would Improve With More Time

- Transition to a managed database (e.g., PostgreSQL) for real-world production concurrency.
- Introduce end-to-end browser automation tools (e.g., Playwright) for visual and UI-driven testing.

## Time Spent

Approximately 2 days, including implementation, testing, stabilization, and deployment preparation.

## What I Learned

- Serving a Vite SPA from an Express API requires careful middleware prioritization to prevent the HTML wildcard fallback from swallowing legitimate `/api/*` `404` errors.
- SQLite foreign key constraints are not enabled by default and must be explicitly toggled via pragmas when initializing `better-sqlite3`.
- Consolidating SQL in a dedicated repository layer allows testing with `:memory:` instances.
