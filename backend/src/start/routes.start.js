const express = require("express");
const cors = require("cors");
const { TaskRoute, ChatRoute, ReadinessRoute } = require("../routes");

module.exports = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use("/api/tasks", TaskRoute);
    app.use("/api/chats", ChatRoute);
    // Alias for singular form as requested
    app.use("/api/chat", ChatRoute);
    app.use("/api/readiness", ReadinessRoute);
};
