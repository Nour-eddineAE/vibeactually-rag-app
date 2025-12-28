let prisma = null;

exports.injectDB = (deps) => {
    prisma = deps.prisma;
};

/**
 * Executes a SQL query and returns the result rows.
 * @param {string} sql - The sanitized SQL query to run.
 */
exports.executeSQL = async (sql) => {
    try {
        // Using unsafe variant because SQL is sanitized upstream
        const rows = await prisma.$queryRawUnsafe(sql);
        return rows;
    } catch (err) {
        console.error("[chat.data] SQL execution error:", err.message);
        throw err;
    }
};
