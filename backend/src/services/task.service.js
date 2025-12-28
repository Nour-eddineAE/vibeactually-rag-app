const ExcelJS = require("exceljs");
const { TaskData, MemberData, TeamData } = require("../data");

// Convert possible Excel serial numbers to JS Date
function excelSerialToDate(n) {
    if (typeof n !== "number") return null;
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = Math.round(n * 24 * 60 * 60 * 1000);
    return new Date(epoch.getTime() + ms);
}

async function importTasksFromExcel(filePath) {
    if (!filePath) throw new Error("filePath is required");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) throw new Error("No worksheet found in uploaded file");

    const headerRow = worksheet.getRow(1);
    const colNameIndexMap = {};
    headerRow.eachCell((cell, colNumber) => {
        const name = String(cell.value ?? "").trim();
        if (name) colNameIndexMap[name] = colNumber;
    });

    const skipColumns = ["Name", "Wing", "Team"]; // only task columns remain

    // Caches to avoid repeated DB calls
    const teamIdByName = new Map();
    const memberIdByName = new Map();
    const tasksBuffer = [];

    const now = new Date();

    const getTeamId = async (teamName) => {
        const key = teamName || "Unknown";
        if (teamIdByName.has(key)) return teamIdByName.get(key);
        const id = await TeamData.createIfNotExists(key);
        teamIdByName.set(key, id);
        return id;
    };

    const getMemberId = async (memberName, teamId) => {
        if (memberIdByName.has(memberName)) return memberIdByName.get(memberName);
        const id = await MemberData.createIfNotExists(memberName, teamId);
        memberIdByName.set(memberName, id);
        return id;
    };

    const parseDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === "string") {
            const d = new Date(value);
            return isNaN(d.getTime()) ? null : d;
        }
        if (typeof value === "number") {
            const d = excelSerialToDate(value);
            return d && !isNaN(d.getTime()) ? d : null;
        }
        if (value && typeof value === "object" && value.result) {
            const d = new Date(value.result);
            return isNaN(d.getTime()) ? null : d;
        }
        return null;
    };

    for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
        const row = worksheet.getRow(rowIndex);

        const memberName = row.getCell(colNameIndexMap["Name"])?.text?.trim();
        const teamName = row.getCell(colNameIndexMap["Team"])?.text?.trim() || "Unknown";
        if (!memberName) continue;

        const teamId = await getTeamId(teamName);
        const memberId = await getMemberId(memberName, teamId);

        for (const colName of Object.keys(colNameIndexMap)) {
            if (skipColumns.includes(colName)) continue;
            const colIndex = colNameIndexMap[colName];
            const cellValue = row.getCell(colIndex).value;
            if (!cellValue) continue;

            const dueDate = parseDate(cellValue);
            if (!dueDate) continue;

            const overdue = dueDate < now;
            tasksBuffer.push({ memberId, name: colName, dueDate, overdue });
        }
    }

    // Bulk insert tasks in chunks to minimize DB roundtrips
    let inserted = 0;
    if (tasksBuffer.length) {
        const CHUNK = 1000;
        for (let i = 0; i < tasksBuffer.length; i += CHUNK) {
            const slice = tasksBuffer.slice(i, i + CHUNK);
            inserted += await TaskData.insertMany(slice);
        }
    }

    return {
        processed: {
            teams: teamIdByName.size,
            members: memberIdByName.size,
            tasks: tasksBuffer.length,
        },
        insertedTasks: inserted,
    };
}

module.exports = {
    importTasksFromExcel,
};
