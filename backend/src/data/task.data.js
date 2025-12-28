let prisma = null;

exports.injectDB = (deps) => {
    prisma = deps.prisma;
};

exports.insertTask = async (memberId, name, dueDate, overdue) => {
    try {
        const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
        await prisma.task.create({
            data: { memberId, name, dueDate: due, overdue: !!overdue },
        });
    } catch (e) {
        // Ignore unique constraint violation (ON CONFLICT DO NOTHING behavior)
        if (e && e.code !== "P2002") throw e;
    }
};

exports.getAll = async () => {
    const rows = await prisma.task.findMany();
    return rows.map((t) => ({
        id: t.id,
        member_id: t.memberId,
        name: t.name,
        due_date: t.dueDate,
        overdue: t.overdue,
    }));
};

exports.getAllWithMembers = async () => {
    const rows = await prisma.task.findMany({ include: { member: true } });
    return rows.map((t) => ({
        id: t.id,
        member_id: t.memberId,
        name: t.name,
        due_date: t.dueDate,
        overdue: t.overdue,
        member_name: t.member?.name || null,
        team_id: t.member?.teamId ?? null,
    }));
};

// Bulk insert tasks with skipDuplicates. Returns number of created rows reported by Prisma.
exports.insertMany = async (rows) => {
    if (!rows || !rows.length) return 0;
    const data = rows.map((t) => ({
        memberId: t.memberId,
        name: t.name,
        dueDate: t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate),
        overdue: !!t.overdue,
    }));
    const result = await prisma.task.createMany({ data, skipDuplicates: true });
    // Prisma returns { count }
    return result?.count ?? 0;
};

exports.getTestData = async () => {
    // Upsert Teams
    const alpha = await prisma.team.upsert({
        where: { name: "Alpha Team" },
        create: { name: "Alpha Team" },
        update: {},
    });
    const bravo = await prisma.team.upsert({
        where: { name: "Bravo Team" },
        create: { name: "Bravo Team" },
        update: {},
    });

    // Upsert Members
    const john = await prisma.member.upsert({
        where: { name: "John Doe" },
        update: { teamId: alpha.id },
        create: { name: "John Doe", teamId: alpha.id },
    });
    const jane = await prisma.member.upsert({
        where: { name: "Jane Smith" },
        update: { teamId: bravo.id },
        create: { name: "Jane Smith", teamId: bravo.id },
    });

    // Create Tasks (skip duplicates)
    const now = new Date();
    const plus1 = new Date(now);
    plus1.setDate(now.getDate() + 1);
    const minus1 = new Date(now);
    minus1.setDate(now.getDate() - 1);

    await prisma.task.createMany({
        data: [
            { memberId: john.id, name: "Task 1", dueDate: plus1, overdue: false },
            { memberId: john.id, name: "Task 2", dueDate: minus1, overdue: true },
            { memberId: jane.id, name: "Task 3", dueDate: now, overdue: false },
        ],
        skipDuplicates: true,
    });

    // Fetch rows and map to expected shapes
    const teamsRows = await prisma.team.findMany();
    const membersRows = await prisma.member.findMany();
    const tasksRows = await prisma.task.findMany();

    const teams = { rows: teamsRows };
    const members = {
        rows: membersRows.map((m) => ({ id: m.id, name: m.name, team_id: m.teamId })),
    };
    const tasks = {
        rows: tasksRows.map((t) => ({
            id: t.id,
            member_id: t.memberId,
            name: t.name,
            due_date: t.dueDate,
            overdue: t.overdue,
        })),
    };

    return { members, teams, tasks };
};
