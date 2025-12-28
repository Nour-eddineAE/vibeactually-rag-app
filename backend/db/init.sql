-- Ensure public schema exists
CREATE SCHEMA IF NOT EXISTS public;

-- =========================
-- Prisma-aligned tables (quoted identifiers)
-- =========================

-- Teams table -> Prisma model "Team"
CREATE TABLE IF NOT EXISTS "Team" (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Members table -> Prisma model "Member"
CREATE TABLE IF NOT EXISTS "Member" (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    "teamId" INTEGER REFERENCES "Team"(id) ON DELETE SET NULL
);

-- Index matching Prisma schema name
CREATE INDEX IF NOT EXISTS idx_members_team_id ON "Member"("teamId");

-- Tasks table -> Prisma model "Task"
CREATE TABLE IF NOT EXISTS "Task" (
    id SERIAL PRIMARY KEY,
    "memberId" INTEGER NOT NULL REFERENCES "Member"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    overdue BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_task_per_member UNIQUE ("memberId", name)
);

-- Indexes matching Prisma schema names
CREATE INDEX IF NOT EXISTS idx_tasks_member_id ON "Task"("memberId");
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON "Task"("dueDate");
