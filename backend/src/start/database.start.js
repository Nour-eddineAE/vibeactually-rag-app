const { PrismaClient } = require("@prisma/client");

module.exports = () => {
    const options = {
        // Optional: enable useful query logging in dev
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    };
    if (process.env.DATABASE_URL) {
        options.datasources = { db: { url: process.env.DATABASE_URL } };
    }
    const prisma = new PrismaClient(options);

    // Graceful shutdown
    const shutdown = async () => {
        try {
            await prisma.$disconnect();
        } catch (_) {}
    };
    process.on("beforeExit", shutdown);
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    return { prisma };
};
