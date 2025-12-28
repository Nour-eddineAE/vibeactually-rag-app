let prisma = null;

exports.injectDB = (deps) => {
    prisma = deps.prisma;
};

// Get member by name
exports.getByName = async (name) => {
    const m = await prisma.member.findUnique({ where: { name } });
    return m ? { id: m.id } : null;
};

// Create member if not exists (linking to team)
exports.createIfNotExists = async (name, teamId) => {
    const m = await prisma.member.upsert({
        where: { name },
        update: { teamId },
        create: { name, teamId },
        select: { id: true },
    });
    return m.id;
};

exports.getAll = async () => {
    const rows = await prisma.member.findMany();
    return rows.map((m) => ({ id: m.id, name: m.name, team_id: m.teamId }));
};

exports.getAllWithTeams = async () => {
    const rows = await prisma.member.findMany({ include: { team: true } });
    return rows.map((m) => ({
        id: m.id,
        name: m.name,
        team_id: m.teamId,
        team_name: m.team?.name || null,
    }));
};
