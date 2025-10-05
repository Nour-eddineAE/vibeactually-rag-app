-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id SERIAL PRIMARY KEY,
    member_id INT REFERENCES public.members(id),
    name TEXT NOT NULL,
    due_date DATE NOT NULL,
    overdue BOOLEAN DEFAULT FALSE
);
