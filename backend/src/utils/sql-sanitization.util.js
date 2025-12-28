// src/utils/sqlSanitizer.js

const sanitizeSQL = (sql) => {
    if (!sql || typeof sql !== "string") {
        console.log("Sanitization failed: SQL is empty or not a string.");
        return null;
    }

    const trimmedSQL = sql.trim();

    // Only allow SELECT statements
    if (!/^select\s+/i.test(trimmedSQL)) {
        console.log("Sanitization failed: SQL does not start with SELECT.");
        return null;
    }

    // Disallow obviously dangerous keywords
    const forbiddenPatterns = [
        {
            pattern: /\b(drop|delete|update|insert|alter|create|truncate|grant|revoke|replace)\b/i,
            reason: "Contains forbidden SQL keyword",
        },
        { pattern: /;/, reason: "Contains semicolon (multiple statements not allowed)" },
        { pattern: /--/, reason: "Contains inline comment" },
        { pattern: /\/\*/, reason: "Contains block comment" },
    ];

    for (const { pattern, reason } of forbiddenPatterns) {
        if (pattern.test(trimmedSQL)) {
            console.log(`Sanitization failed: ${reason}.`);
            return null;
        }
    }

    // Add a LIMIT if missing to avoid huge results
    if (!/\blimit\s+\d+/i.test(trimmedSQL)) {
        console.log("Sanitization warning: LIMIT not found, adding LIMIT 100.");
        return `${trimmedSQL} LIMIT 100`;
    }

    return trimmedSQL;
};

module.exports = { sanitizeSQL };
