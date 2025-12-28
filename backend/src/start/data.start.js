const { TaskData, MemberData, ChatData, TeamData } = require("../data");

module.exports = (db) => {
    // Inject Prisma client into data access modules
    TaskData.injectDB(db);
    MemberData.injectDB(db);
    ChatData.injectDB(db);
    TeamData.injectDB(db);
};
