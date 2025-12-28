// src/utils/constants/openaiPrompt.js

const SCHEMA_DESCRIPTION = `
Database schema (Prisma models):

Table: public."Team"
- id (integer, primary key)
- name (text, unique, not null)

Table: public."Member"
- id (integer, primary key)
- name (text, unique, not null)
- "teamId" (integer, foreign key to public."Team".id, nullable)

Table: public."Task"
- id (integer, primary key)
- "memberId" (integer, foreign key to public."Member".id)
- name (text, not null)
- "dueDate" (date, not null)
- overdue (boolean, default false)

Relationships:
- Each team can have multiple members.
- Each member belongs to at most one team (optional).
- Each member can have multiple tasks.
- A task belongs to exactly one member.
`;

const DOMAIN_CONTEXT = `
Definitions:
- "Readiness" = percentage of tasks that are not overdue.
- "At risk" = members or teams with the lowest readiness.
- "Bottlenecks" = overdue tasks that block progress.
- "Overdue" = true when due_date < current date.
`;

const SANITIZATION_RULES = `
Sanitization rules to follow:
- Only return SELECT statements.
- Do not use semicolons at the end of the query.
- Avoid dangerous SQL keywords: DROP, DELETE, UPDATE, INSERT, ALTER, CREATE, TRUNCATE, GRANT, REVOKE, REPLACE.
- Avoid comments (-- or /* */).
- Only query the provided schema and context.
- Fully qualify table names using quoted identifiers (e.g. public."Member").
- Use quoted column names for camelCase fields (e.g. "teamId", "memberId", "dueDate").
- Always ensure valid PostgreSQL syntax.
`;

const EXAMPLES = `
Examples:
Q: What members have the highest readiness?
SQL: SELECT m.name,
           ROUND(100.0 * SUM(CASE WHEN t.overdue = false THEN 1 ELSE 0 END) / COUNT(*), 2) AS readiness
     FROM public."Member" m
     JOIN public."Task" t ON m.id = t."memberId"
     GROUP BY m.id ORDER BY readiness DESC LIMIT 5

Q: Which members are most at risk?
SQL: SELECT m.name,
           ROUND(100.0 * SUM(CASE WHEN t.overdue = false THEN 1 ELSE 0 END) / COUNT(*), 2) AS readiness
     FROM public."Member" m
     JOIN public."Task" t ON m.id = t."memberId"
     GROUP BY m.id ORDER BY readiness ASC LIMIT 5

Q: What teams have the lowest readiness?
SQL: SELECT tm.name,
           ROUND(100.0 * SUM(CASE WHEN t.overdue = false THEN 1 ELSE 0 END) / COUNT(*), 2) AS readiness
     FROM public."Team" tm
     JOIN public."Member" m ON m."teamId" = tm.id
     JOIN public."Task" t ON t."memberId" = m.id
     GROUP BY tm.id ORDER BY readiness ASC LIMIT 5

Q: What tasks are the biggest bottlenecks right now?
SQL: SELECT t.name, COUNT(*) AS overdue_count
     FROM public."Task" t WHERE t.overdue = true
     GROUP BY t.name ORDER BY overdue_count DESC LIMIT 5
`;

module.exports = {
    SCHEMA_DESCRIPTION,
    DOMAIN_CONTEXT,
    SANITIZATION_RULES,
    EXAMPLES,
};
