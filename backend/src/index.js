const express = require("express");
const setUp = require("./start");

const app = express();
setUp.setupConfig();
setUp.setupRoutes(app);
setUp.setupDataAccess(setUp.setupDB());

app.listen(4000, () => {
    console.log("🚀 Backend running on http://localhost:4000");
});
