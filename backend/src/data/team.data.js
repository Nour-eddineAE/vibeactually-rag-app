let prisma = null;

exports.injectDB = (deps) => {
    prisma = deps.prisma;
};

// Get team by name
exports.getByName = async (name) => {
    const t = await prisma.team.findUnique({ where: { name } });
    return t ? { id: t.id } : null;
};

// Create team if not exists
exports.createIfNotExists = async (name) => {
    const t = await prisma.team.upsert({
        where: { name },
        update: {},
        create: { name },
        select: { id: true },
    });
    return t.id;
};

exports.getAll = async () => {
    const rows = await prisma.team.findMany();
    return rows.map((t) => ({ id: t.id, name: t.name }));
};
