const setupRoutes = require("./routes.start");
const setupDB = require("./database.start");
const setupDataAccess = require("./data.start");
const setupConfig = require("./config.start");

module.exports = {
    setupRoutes,
    setupDB,
    setupDataAccess,
    setupConfig,
};
