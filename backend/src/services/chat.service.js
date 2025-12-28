const { openai } = require("../plugins/openai.plugin");
const {
    SCHEMA_DESCRIPTION,
    DOMAIN_CONTEXT,
    EXAMPLES,
    SANITIZATION_RULES,
} = require("../utils/prompting.util");
const { sanitizeSQL } = require("../utils/sql-sanitization.util");
const { executeSQL } = require("../data/chat.data");

async function processChatMessage(message) {
    if (!message || typeof message !== "string") {
        throw new Error("Message is required");
    }

    const systemPrompt = `
You are a helpful assistant that generates SQL queries for a PostgreSQL database.
You must ONLY return SQL code (no markdown, no explanations).

${SCHEMA_DESCRIPTION}

${DOMAIN_CONTEXT}

${EXAMPLES}

${SANITIZATION_RULES}

Rules:
- Only use SELECT statements.
- Never modify data.
- Fully qualify table names using quoted identifiers (e.g. public."Member").
- Prefer readable SQL (use aliases and formatting).
- Always ensure valid Postgres syntax.
`;

    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-5-chat-latest",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
        ],
    });

    let rawSQL = completion.choices[0].message.content.trim();

    console.log("rawsql: ------------- : ", rawSQL);

    // Extract SQL if wrapped in markdown
    const match = rawSQL.match(/```sql([\s\S]*?)```/i);
    if (match) {
        rawSQL = match[1].trim();
    }

    const safeSQL = sanitizeSQL(rawSQL);

    if (!safeSQL) {
        throw new Error("Unsafe or invalid SQL generated.");
    }

    const rows = await executeSQL(safeSQL);

    return { query: safeSQL, result: rows };
}

async function getQuestionSamples() {
    const system = `You generate short, useful, diverse natural-language questions for a SQL query editor.
Return ONLY a JSON array of 5 strings (no extra text). Questions should help analysts explore the dataset, avoid leading the model to unsafe actions, and be generic.`;

    const rules = `Constraints:
- Do NOT mention explicit team or member names.
- Keep questions concise (<= 120 characters), end with a question mark.
- Avoid placeholders like "Team Alpha" or names.
- Use generic phrasing like "by team", "top performers", "most at risk".
- Focus on insights (readiness, overdue, bottlenecks, trends).`;

    const content = `Context for suggestions:\n\n${SCHEMA_DESCRIPTION}\n\n${DOMAIN_CONTEXT}\n`;

    const messages = [
        { role: "system", content: system },
        { role: "user", content: `${content}\n${rules}\nGenerate 5 example questions now as a JSON array of strings.` },
    ];

    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-5-chat-latest",
        messages,
        temperature: 0.7,
    });

    const text = completion.choices?.[0]?.message?.content?.trim?.() || "[]";

    // Try to extract JSON array
    let payload = text;
    const codeFence = text.match(/```(?:json)?([\s\S]*?)```/i);
    if (codeFence) payload = codeFence[1].trim();

    let samples;
    try {
        samples = JSON.parse(payload);
        if (!Array.isArray(samples)) throw new Error("Not an array");
        samples = samples
            .map(s => String(s).trim())
            .filter(Boolean)
            .slice(0, 5);
    } catch (_e) {
        // Fallback: split lines
        samples = text
            .split(/\n|•|\d+\.|-\s+/)
            .map(s => s.replace(/^\s*"|"\s*$/g, "").trim())
            .filter(s => s.length > 0 && s.length < 180)
            .slice(0, 5);
    }

    // Final safety: enforce rule about explicit names by removing those with typical proper-name patterns
    const filtered = samples.filter(q => !/(team\s+\w+|member\s+\w+)/i.test(q));
    return (filtered.length >= 3 ? filtered : samples).slice(0, 5);
}

module.exports = { processChatMessage, getQuestionSamples };
